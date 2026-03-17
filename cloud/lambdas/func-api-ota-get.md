# func-api-ota-get

## Description

Returns an OTA manifest compatible with the [BrentIO/esp32FOTA](https://github.com/BrentIO/esp32FOTA) fork for the **next** `RELEASED` firmware version the device should install. The `current_version` query parameter is required. The manifest contains CloudFront URLs the device uses to download the firmware binaries directly.

The endpoint returns the oldest `RELEASED` version whose version string is strictly greater than `current_version`, enabling sequential updates. If the device is already on the latest released version, `200 OK` is returned with the same version manifest (the esp32FOTA library uses `semver_compare` to detect no-update; non-200 responses are treated as errors). Returns `409 Conflict` if the device's current version is REVOKED and no newer release exists.

See the [OTA Update Flow](/cloud/ota_update_flow) for full scenario documentation.

`config.bin` and `manifest.json` are never included in OTA delivery. `config.bin` holds device-specific settings and must not be overwritten during an OTA update.

## Invocation

Invoked by **API Gateway** on an HTTP `GET /ota/{product_id}/{application}` request.

## Sequence Diagram

[![Sequence Diagram](./images/func-api-ota-get.svg)](./images/func-api-ota-get.svg)

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/ota/{product_id}/{application}?current_version={version}` | Returns the OTA manifest for the next released firmware version |

See the [API Reference](/cloud/api_reference) for full schema documentation.

## Response Format

The response is a manifest compatible with the [BrentIO/esp32FOTA](https://github.com/BrentIO/esp32FOTA) fork:

| Field | Required | Description |
|---|---|---|
| `type` | Yes | Firmware type string expected by the device (e.g., `"FireFly Controller"`) |
| `version` | Yes | Firmware version string (e.g., `"2026.03.001"`) |
| `url` | Yes | CloudFront URL to the main application firmware binary |
| `littlefs` | No | CloudFront URL to the LittleFS partition image; omitted if not present in the firmware |

```json
{
    "type": "FireFly Controller",
    "version": "2026.03.001",
    "url": "https://firmware.somewhere.com/FFC3232-2603/Controller/2026.03.001/Controller.ino.bin",
    "littlefs": "https://firmware.somewhere.com/FFC3232-2603/Controller/2026.03.001/www.bin"
}
```

## Binary Identification

The function uses the following rules to identify firmware binaries from the released record's file list:

| File | Identified as |
|---|---|
| `www.bin` | LittleFS partition image (`littlefs` field) |
| `config.bin` | Excluded — device-specific, not OTA-updatable |
| `manifest.json` | Excluded |
| `*.bootloader.bin` | Excluded — not OTA-updatable |
| `*.partitions.bin` | Excluded — not OTA-updatable |
| Any other `*.bin` | Main application firmware (`url` field) |

## Firmware Type Mapping

The `type` field in the manifest must match the `APPLICATION_NAME` constant on the device firmware. The mapping from URL `application` path parameter to firmware type string is configured via the `FIRMWARE_TYPE_MAP` Lambda environment variable (a JSON object).

For example: `{"Controller": "FireFly Controller"}` maps the URL path segment `Controller` to the firmware type string `"FireFly Controller"` expected by the device.
