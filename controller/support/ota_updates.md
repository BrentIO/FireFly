# Over-the-Air (OTA) Updates
FireFly Controller supports OTA updates for both the firmware and SPIFFS (`www` partition).  Data stored on the `config` partition is never updatable over OTA.

> [!IMPORTANT]  
> When the device reboots, it will check for a newer version of firmware which may create an update loop.

While the device is performing any type of OTA update, the [OLED display](/controller/support/OLED_screens/#ota-update) will indicate the percentage complete.  Additionally, events will be written to the [Event Log](/controller/support/event_and_error_logs).

## OTA Update Service
The OTA Update Service allows you to configure a webserver that will provide OTA updates to the device automatically.  By default, the controller will check for OTA updates once per day and upon reboot.  Both http and https protocols are supported, provided a certificate for the website has been uploaded to the [certificates storage](/controller/support/certificate_management).

The OTA Update Service configuration is stored in the `config` partition as a simple JSON file.  It can be saved and deleted, but not updated.

When the web server payload specifies both an application and SPIFFS update, the SPIFFS are updated first, then the application.  The web server should respond to the GET request with a formatted payload as an array ([see examples below](#example-web-server-response-payloads)).  Optionally, the list of software versions can be curated based on the hardware product ID and/or device UUID.  The controller will send custom headers to identify the device in the GET request to the web server:
| Header Name | Example Value | Description |
| ----------- | ------------- | ----------- |
| product_id | FFC0806-2305 | Hardware Product ID |
| uuid | 7a060b6b-dc2f-4d10-ba9e-6109f788cd95 | Device UUID |


### Example Web Server Response Payloads

Application-only update
```json
[
    {
        "type": "HW Reg and Config",
        "version": "2024.5.2",
        "url": "https://server.myhost.com/hwreg/app_2024.5.2.bin",
    }
]
```

SPIFFS-only update
```json
[
    {
        "type": "Controller",
        "version": "2024.3.21",
        "spiffs": "https://server.myhost.com/controller/spiffs_2024.3.21.bin"
    }
]
```

Combined Application and SPIFFS update
```json
[
    {
        "type": "HW Reg and Config",
        "version": "2024.5.2",
        "url": "https://server.myhost.com/hwreg/app_2024.5.2.bin",
        "spiffs": "https://server.myhost.com/hwreg/spiffs_2024.5.2.bin"
    },
    {
        "type": "Controller",
        "version": "2024.3.21",
        "url": "https://server.myhost.com/controller/app_2024.3.21.bin",
        "spiffs": "https://server.myhost.com/controller/spiffs_2024.3.21.bin"
    }
]
```

## Forced OTA Updates
OTA updates can also be forced, which is helpful for ensuring a specific version of the firmware or SPIFFS are downloaded.

A different certificate can be uploaded and configured for forced OTA updates than for the OTA Update Service, if required.