# Over-the-Air (OTA) Updates

::: info Why can't I go directly to the latest version?
OTA update will always go to the _next_ firmware release, not the latest.  This may be necessary to perform changes to the underlying file structures, introduced only in certain versions.  For example, if you are running version 1, and the latest release is version 4, you must update to version 2, then version 3, and finally version 4.  You cannot directly upgrade from version 1 to version 4.
:::

FireFly Controller supports OTA updates for both the firmware and SPIFFS (`www` partition).  Data stored on the `config` partition is never updatable over OTA.

While the device is performing any type of OTA update, the [OLED display](/controller/support/OLED_screens/#ota-update) will indicate the percentage complete.  Additionally, events will be written to the [Event Log](/controller/support/event_and_error_logs).

By default, updates are checked once every 86,400 seconds (daily) at approximately the time the device was originally booted, although the frequency can be overridden with the `FIRMWARE_CHECK_SECONDS` parameter if you compile the code yourself.

## OTA Update Service
The OTA Update Service allows you to configure a webserver that will provide OTA updates to the device.  By default, the controller will check for OTA updates once per day and 30 seconds after a reboot.  Both http and https protocols are supported, provided a certificate for the website has been uploaded to the [certificates storage](/controller/support/certificate_management).

The OTA Update Service configuration is stored in the device's configuration as an entry in the JSON.  It can be configured using the [Controller's UI](/controller/software/controller/configuration/ota).

When the web server payload specifies both an application and SPIFFS update, the SPIFFS are updated first, then the application.  The web server should respond to the GET request with a formatted payload as an array ([see examples below](#example-web-server-response-payloads)).  Optionally, the list of software versions can be curated based on the hardware product ID and/or device UUID.  The controller will send custom headers to identify the device in the GET request to the web server:
| Header Name | Example Value | Description |
| ----------- | ------------- | ----------- |
| product_id | FFC0806-2305 | Hardware Product ID |
| uuid | 7a060b6b-dc2f-4d10-ba9e-6109f788cd95 | Device UUID |

## Response Payloads

The fields included in the response are:

| Field | Usage | Recommended Maximum Length |
| ----- | ----- | -------------------------- |
| `type` | Matches the `APPLICATION_NAME` definition at compile time, typically `FireFly Controller` | 20 |
| `version` | The version number of the file being described in the `url` or `spiffs` binary | 10 |
| `url` | URL of the application binary | 60 |
| `spiffs` | URL of the SPIFFS binary | 60 |
| `title` | Optional, a short title for the new release version, used by Home Assistant | 30 |
| `release_summary` | Optional, URL for release notes, used by Home Assistant | 75 |

::: info Recommended maximum lengths
The recommended maximum lengths reflect the total maximum size of the object that has been tested.  Shortening some fields can allow for others to be slightly longer.  For example, if your URL is only 20 characters in length, you could add 40 characters to your release summary.
:::


### Example Web Server Response Payloads

Application-only update
```json
[
    {
        "type": "FireFly Controller",
        "version": "2024.5.2",
        "url": "https://server.myhost.com/hwreg/app_2024.5.2.bin",
        "title": "App release 2024.5.2",
        "release_summary": "We added awesome new features!",
        "release_url": "https://github.com/BrentIO/FireFly-Controller/releases/tag/2024.5.2"
    }
]
```

SPIFFS-only update
```json
[
    {
        "type": "FireFly Controller",
        "version": "2024.3.21",
        "spiffs": "https://server.myhost.com/controller/spiffs_2024.3.21.bin",
        "title": "App release 2024.3.21",
        "release_summary": "We added awesome new features!",
        "release_url": "https://github.com/BrentIO/FireFly-Controller/releases/tag/2024.3.21"
    }
]
```

Combined Application and SPIFFS update
```json
[
    {
        "type": "FireFly Controller",
        "version": "2024.5.2",
        "url": "https://server.myhost.com/hwreg/app_2024.5.2.bin",
        "spiffs": "https://server.myhost.com/hwreg/spiffs_2024.5.2.bin",
        "title": "App release 2024.5.2",
        "release_summary": "We added awesome new features!",
        "release_url": "https://github.com/BrentIO/FireFly-Controller/releases/tag/2024.5.2"
    },
    {
        "type": "FireFly Controller",
        "version": "2024.3.21",
        "url": "https://server.myhost.com/controller/app_2024.3.21.bin",
        "spiffs": "https://server.myhost.com/controller/spiffs_2024.3.21.bin",
        "title": "App release 2024.3.21",
        "release_summary": "We added awesome new features!",
        "release_url": "https://github.com/BrentIO/FireFly-Controller/releases/tag/2024.3.21"
    }
]
```

## Forced OTA Updates
OTA updates can also be forced, which is helpful for ensuring a specific version of the firmware or SPIFFS are downloaded.

A different certificate can be uploaded and configured for forced OTA updates than for the OTA Update Service, if required.