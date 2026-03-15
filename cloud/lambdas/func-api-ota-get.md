# func-api-ota-get

## Description

Returns an OTA manifest compatible with the [BrentIO/esp32FOTA](https://github.com/BrentIO/esp32FOTA) fork for the latest `RELEASED` firmware matching the given `product_id` and `application`. The manifest contains CloudFront URLs the device uses to download the firmware binaries directly.

If multiple `RELEASED` builds exist for the same product and application, the most recently processed build is returned.

`config.bin` and `manifest.json` are never included in OTA delivery. `config.bin` holds device-specific settings and must not be overwritten during an OTA update.

## Invocation

Invoked by **API Gateway** on an HTTP `GET /ota/{product_id}/{application}` request.

## Sequence Diagram

![Sequence Diagram](./images/func-api-ota-get.svg)

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/ota/{product_id}/{application}` | Returns the OTA manifest for the latest released firmware |

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
