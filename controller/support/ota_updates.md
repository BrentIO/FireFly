# Over-the-Air (OTA) Updates

::: info Why can't I go directly to the latest version?
OTA update will always go to the _next_ firmware release, not the latest.  This may be necessary to perform changes to the underlying file structures, introduced only in certain versions.  For example, if you are running version 1, and the latest release is version 4, you must update to version 2, then version 3, and finally version 4.  You cannot directly upgrade from version 1 to version 4.
:::

FireFly Controller supports OTA updates for both the firmware and LittleFS (`www` partition).  Data stored on the `config` partition is never updatable over OTA.

While the device is performing any type of OTA update, the [OLED display](/controller/support/OLED_screens/#ota-update) will indicate the percentage complete.  Additionally, events will be written to the [Event Log](/controller/support/event_and_error_logs).

By default, updates are checked once every 86,400 seconds (daily) at approximately the time the device was originally booted, although the frequency can be overridden with the `FIRMWARE_CHECK_SECONDS` parameter if you compile the code yourself.

## OTA Update Service
The OTA Update Service allows you to configure a webserver that will provide OTA updates to the device.  By default, the controller will check for OTA updates once per day and 30 seconds after a reboot.  Both http and https protocols are supported, provided a certificate for the website has been uploaded to the [certificates storage](/controller/support/certificate_management).

The OTA Update Service configuration is stored in the device's configuration as an entry in the JSON.  It can be configured using the [Controller's UI](/controller/software/controller/configuration/ota).

When the web server payload specifies both an application and LittleFS update, the LittleFS partition is updated first, then the application.  The web server should respond to the GET request with a formatted JSON object ([see examples below](#example-web-server-response-payloads)).  The controller will send custom headers to identify the device in the GET request to the web server:
| Header Name | Example Value | Description |
| ----------- | ------------- | ----------- |
| product_id | FFC0806-2305 | Hardware Product ID |
| uuid | 7a060b6b-dc2f-4d10-ba9e-6109f788cd95 | Device UUID |

## Response Payloads

The fields included in the response are:

| Field | Required | Usage |
| ----- | -------- | ----- |
| `type` | Yes | Matches the `APPLICATION_NAME` definition at compile time, typically `FireFly Controller` |
| `version` | Yes | Version number in `YYYY.MM.bb` format (e.g. `2026.03.01`) |
| `url` | Yes | CloudFront URL of the main application binary |
| `littlefs` | No | CloudFront URL of the LittleFS partition image; omitted if not present in the release |

See the [FireFly Cloud OTA Update Flow](/cloud/ota_update_flow) for server-side behavior, response codes, and version sequencing details.

### Example Web Server Response Payloads

Application firmware update (no LittleFS)
```json
{
    "type": "FireFly Controller",
    "version": "2026.03.01",
    "url": "https://firmware.somewhere.com/FFC3232-2603/Controller/2026.03.01/Controller.ino.bin"
}
```

Combined application and LittleFS update
```json
{
    "type": "FireFly Controller",
    "version": "2026.03.01",
    "url": "https://firmware.somewhere.com/FFC3232-2603/Controller/2026.03.01/Controller.ino.bin",
    "littlefs": "https://firmware.somewhere.com/FFC3232-2603/Controller/2026.03.01/www.bin"
}
```

## Forced OTA Updates
OTA updates can also be forced, which is helpful for ensuring a specific version of the firmware or LittleFS are downloaded.

A different certificate can be uploaded and configured for forced OTA updates than for the OTA Update Service, if required.