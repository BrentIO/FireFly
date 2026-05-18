# Over-the-Air (OTA) Updates

::: info Why can't I go directly to the latest version?
OTA update will always go to the _next_ firmware release, not the latest.  This may be necessary to perform changes to the underlying file structures, introduced only in certain versions.  For example, if you are running version 1, and the latest release is version 4, you must update to version 2, then version 3, and finally version 4.  You cannot directly upgrade from version 1 to version 4.
:::

FireFly Controller supports OTA updates for both the firmware and LittleFS (`www` partition).  Data stored on the `config` partition is never updatable over OTA.

While the device is performing any type of OTA update, the [OLED display](/controller/support/OLED_screens/#ota-update) will indicate the percentage complete.  Additionally, events will be written to the [Event Log](/controller/support/event_and_error_logs).

By default, updates are checked once every 86,400 seconds (daily) at approximately the time the device was originally booted, although the frequency can be overridden with the `FIRMWARE_CHECK_SECONDS` parameter if you compile the code yourself.

## OTA Update Service
The OTA Update Service allows you to configure a webserver that will provide OTA updates to the device.  By default, the controller will check for OTA updates once per day and 30 seconds after a reboot.  Both http and https protocols are supported.  When https is used, the firmware validates the server certificate using the ESP32 core's built-in Mozilla root CA bundle by default.  If any certificates have been uploaded to the device, those are used exclusively instead of the built-in bundle.

The OTA Update Service configuration is stored in the device's configuration as an entry in the JSON.  It can be configured using the [Controller's UI](/controller/software/controller/configuration/ota).

When the web server payload specifies both an application and LittleFS update, the LittleFS partition is updated first, then the application.  The controller will send custom headers to identify the device in the GET request to the web server:

| Header Name | Example Value | Description |
| ----------- | ------------- | ----------- |
| product_id | FFC0806-2305 | Hardware Product ID |
| uuid | 7a060b6b-dc2f-4d10-ba9e-6109f788cd95 | Device UUID |

See the [func-api-ota-get](/cloud/lambdas/func-api-ota-get) Lambda documentation for the response payload format and the [FireFly Cloud OTA Update Flow](/cloud/ota_update_flow) for server-side behavior, response codes, and version sequencing details.

## Forced OTA Updates
OTA updates can also be forced, which is helpful for ensuring a specific version of the firmware or LittleFS are downloaded.

Forced OTA updates use the same certificate selection logic as the OTA Update Service: uploaded certs if present, otherwise the built-in Mozilla bundle.  No certificate field is required in the request payload.