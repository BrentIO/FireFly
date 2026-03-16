# OTA Update Flow

See also: [Controller OTA Updates](/controller/support/ota_updates) for device-side configuration, request headers, and firmware payload format.

## Overview

Devices check for firmware updates by calling `GET /ota/{product_id}/{application}?current_version={version}`. The `current_version` parameter is **required** — omitting it returns `400 Bad Request`.

The endpoint returns the **next available version** for the device to install, not the latest one. This ensures controlled, sequential upgrades. A device on `2026.01.01` installs `2026.02.01` first, then `2026.03.01` on its next check — never jumping multiple versions in one step.

Sequential updates protect against skipping intermediate versions that may contain breaking data migrations or hardware configuration changes required before later versions can run successfully.

## How Versioning Works

Version strings use the format `YYYY.MM.bb` (e.g., `2026.03.01`), where `MM` is the two-digit month and `bb` is the two-digit build number within that month. DynamoDB stores version as the sort key on the `{product_id}#{application}` partition, so RELEASED builds are ordered oldest-to-newest by lexicographic string sort — which matches chronological order given this format.

The endpoint finds the oldest RELEASED version whose version string is **strictly greater** than `current_version`. If no such version exists, the device is at or beyond the latest released version — see response codes below for the exact outcome.

## Response Codes

| Condition | Response |
|---|---|
| `current_version` query param missing | `400 Bad Request` |
| No RELEASED firmware exists for this product/application | `404 Not Found` |
| A newer RELEASED version is available | `200 OK` with the next version's manifest |
| Device is already on the latest RELEASED version | `200 OK` with the current version's manifest (semver_compare == 0; device does not update) |
| Device's current version is REVOKED and nothing newer is RELEASED | `409 Conflict` |

**Note on `200` with the same version:** The [BrentIO/esp32FOTA](https://github.com/BrentIO/esp32FOTA) library always expects HTTP 200 from the manifest endpoint. It decides whether to update by comparing the returned version against the running version using `semver_compare`. Equal versions (`semver_compare == 0`) cause no update. The library treats any non-200 response as a hard error — a `404` is not a graceful "you're up to date" signal.

---

## Scenario 1: Normal Sequential Update

**Released firmware for `FFC3232-2603` / `Controller`:**

| Version | Status |
|---|---|
| `2026.01.01` | RELEASED |
| `2026.02.01` | RELEASED |
| `2026.03.01` | RELEASED |

**Update cycle for a device currently on `2026.01.01`:**

1. `GET /ota/FFC3232-2603/Controller?current_version=2026.01.01`
   - Next RELEASED version > `2026.01.01` is `2026.02.01`
   - Response: `200` with manifest for `2026.02.01`
2. Device installs `2026.02.01` and reboots.
3. `GET /ota/FFC3232-2603/Controller?current_version=2026.02.01`
   - Next RELEASED version > `2026.02.01` is `2026.03.01`
   - Response: `200` with manifest for `2026.03.01`
4. Device installs `2026.03.01` and reboots.
5. `GET /ota/FFC3232-2603/Controller?current_version=2026.03.01`
   - No RELEASED version > `2026.03.01` exists; `2026.03.01` is still RELEASED
   - Response: `200` with manifest for `2026.03.01` (same version — device does not update)

---

## Scenario 2: Device That Did Not Update When a Version Was Available

A device was online when `2026.01.01` was the latest, but did not install it. Now `2026.02.01` and `2026.03.01` are also RELEASED. The device is still on its factory firmware `2025.12.01`.

1. `GET /ota/FFC3232-2603/Controller?current_version=2025.12.01`
   - All three RELEASED versions are > `2025.12.01`; oldest is `2026.01.01`
   - Response: `200` with manifest for `2026.01.01`
2. Device installs `2026.01.01` and continues through the normal sequential flow.

---

## Scenario 3: Firmware Revoked Before Device Installed It

`2026.01.01` is revoked after release but before all devices have installed it.

**Firmware table:**

| Version | Status |
|---|---|
| `2026.01.01` | REVOKED |
| `2026.02.01` | RELEASED |
| `2026.03.01` | RELEASED |

**Device on `2026.02.01` (checking for updates):**
1. `GET /ota/FFC3232-2603/Controller?current_version=2026.02.01`
   - Response: `200` with manifest for `2026.03.01` (next RELEASED)

**Device still on factory firmware `2025.12.01` that never installed `2026.01.01`:**
1. `GET /ota/FFC3232-2603/Controller?current_version=2025.12.01`
   - RELEASED versions > `2025.12.01`: `2026.02.01`, `2026.03.01` (`2026.01.01` is REVOKED, excluded)
   - Response: `200` with manifest for `2026.02.01` (oldest RELEASED > current)
2. Device skips the revoked version cleanly and installs `2026.02.01`.

---

## Scenario 4: Device Currently Running Revoked Firmware — Newer Version Available

`2026.02.01` is revoked after some devices installed it. `2026.03.01` is still RELEASED.

**Device on `2026.02.01` (the now-revoked version):**
1. `GET /ota/FFC3232-2603/Controller?current_version=2026.02.01`
   - RELEASED versions > `2026.02.01`: `2026.03.01`
   - Response: `200` with manifest for `2026.03.01`
2. Device installs `2026.03.01` and reboots.
3. `GET /ota/FFC3232-2603/Controller?current_version=2026.03.01`
   - Response: `200` with manifest for `2026.03.01` (same version; device does not update)

---

## Scenario 5: Device Running Revoked Firmware — No Newer Version Released

`2026.03.01` is the latest version and is REVOKED. No replacement has been released yet.

**Device on `2026.03.01`:**
1. `GET /ota/FFC3232-2603/Controller?current_version=2026.03.01`
   - No RELEASED version > `2026.03.01` exists
   - `2026.03.01` is not in RELEASED (it is REVOKED)
   - Response: `409 Conflict`
2. Device receives a non-200 response (treated as `lastHTTPCheckStatus::HTTP_ERROR` by esp32FOTA). A new firmware must be released before this device can self-update.

---

## Scenario 6: Multiple Product IDs

The `product_id` and `application` path parameters together form the DynamoDB partition key (`{product_id}#{application}`). OTA queries are strictly scoped to that combination — firmware for one product is never served to another.

**Example:** Two product lines share the same application name.

| product_id | application | Version | Status |
|---|---|---|---|
| `FFC3232-2603` | `Controller` | `2026.01.01` | RELEASED |
| `FFC3232-2603` | `Controller` | `2026.02.01` | RELEASED |
| `FFC3232-2604` | `Controller` | `2026.01.01` | RELEASED |

- `GET /ota/FFC3232-2603/Controller?current_version=2026.01.01` → `200` with `2026.02.01`
- `GET /ota/FFC3232-2604/Controller?current_version=2026.01.01` → `200` with `2026.01.01` (same version; no update — only one version released for this product)

---

## Library Dependency

The [BrentIO/esp32FOTA](https://github.com/BrentIO/esp32FOTA) library does not currently append `current_version` to the manifest URL. The library must be updated to add a `use_current_version` config flag that, when enabled, appends `?current_version=<version>` to the manifest URL before issuing the GET request — mirroring the existing `use_device_id` pattern that appends `?id=<mac>`.

Until this library update is made, the server cannot perform sequential version delivery.
