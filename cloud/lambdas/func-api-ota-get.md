# func-api-ota-get

## Description

Returns an OTA manifest compatible with the [BrentIO/esp32FOTA](https://github.com/BrentIO/esp32FOTA) fork for the **next** `RELEASED` firmware version the device should install. The `current_version` query parameter is required. The manifest contains CloudFront URLs the device uses to download the firmware binaries directly.

The endpoint returns the oldest `RELEASED` version whose version string is strictly greater than `current_version`, enabling sequential updates. If the device is already on the latest released version, `200 OK` is returned with the same version manifest (the esp32FOTA library uses `semver_compare` to detect no-update; non-200 responses are treated as errors). Returns `409 Conflict` if the device's current version is REVOKED and no newer release exists.

See the [OTA Update Flow](/cloud/ota_update_flow) for full scenario documentation.

`config.bin` and `manifest.json` are never included in OTA delivery. `config.bin` holds device-specific settings and must not be overwritten during an OTA update.

## Invocation

Invoked by **API Gateway** on an HTTP `GET /ota/{class}/{product_hex}` request.

## Sequence Diagram

[![Sequence Diagram](./images/func-api-ota-get.svg)](./images/func-api-ota-get.svg)

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/ota/{class}/{product_hex}?current_version={version}` | Returns the OTA manifest for the next released firmware version |

See the [API Reference](/cloud/api_reference) for full schema documentation.

## Response Format

The response is a manifest compatible with the [BrentIO/esp32FOTA](https://github.com/BrentIO/esp32FOTA) fork:

| Field | Required | Description |
|---|---|---|
| `type` | Yes | Firmware type string expected by the device (e.g., `"FireFly Controller"`) — stored in DynamoDB from `manifest.json` at build time |
| `version` | Yes | Firmware version string (e.g., `"2026.03.001"`) |
| `app` | Yes | CloudFront URL to the main application firmware binary |
| `ui` | No | CloudFront URL to the LittleFS (`ui`) partition image; omitted if not present in the firmware |

```json
{
    "type": "FireFly Controller",
    "version": "2026.03.001",
    "app": "https://firmware.somewhere.com/controller/0x32322505/2026.03.001/Controller.ino.bin",
    "ui": "https://firmware.somewhere.com/controller/0x32322505/2026.03.001/ui.bin"
}
```

## Binary Identification

The function uses the `main_binary` field stored in DynamoDB (set by the upload Lambda from the manifest file list) to construct the `app` URL. For `ui`, it searches the file list for `ui.bin`.

| File | Identified as |
|---|---|
| `ui.bin` | LittleFS partition image (`ui` field) |
| `config.bin` | Excluded — device-specific, not OTA-updatable |
| `manifest.json` | Excluded |
| `*.bootloader.bin` | Excluded — not OTA-updatable |
| `*.partitions.bin` | Excluded — not OTA-updatable |
| Any other `*.bin` | Main application firmware (`app` field) |

## Firmware Type

The `type` field in the OTA manifest is stored in DynamoDB as `firmware_type`, populated from `manifest.json` at CI build time. The value must match the `HARDWARE_CLASS` or application type constant compiled into the device firmware. No server-side mapping is required.

## Deployment

See the [deployment workflow documentation](../github_actions/func-api-ota-get.md) for workflow steps, infrastructure dependencies, and failure scenarios.
