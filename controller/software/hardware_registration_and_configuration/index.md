# Hardware Registration and Configuration

The Hardware Registration and Configuration application is intended to be used to test hardware and perform the initial configuration of the device.  This application is used at the factory to configure the device prior to being shipped, or by a developer building their own hardware.

## :white_check_mark: What this application does
- Sets up an HTTP server using the on-board Ethernet or WiFi (depending on hardware compile options)
- Sets up the [OLED display](/controller/support/OLED_screens/) (where supported by the hardware) to display basic information and provide a user interface button
- Displays hardware MAC addresses for the MCU
- Provides a user interface to configure an identity for the device, including the device unique ID, product ID, and secret key
- <Badge type="warning" text="TODO" /> Registers the device with the cloud service for configuration backup
- Verifies the peripherals, such as the inputs, outputs, temperature sensors, OLED display, and EEPROM are online and functional
- Confirms the [partition table](/controller/support/partitions) matches the [expected configuration](/controller/development_environment/#adding-a-new-hardware-version)
- Provides [management of certificates](/controller/support/certificate_management) to be used when updating the firmware or SPIFFS, and for other uses
- Permits the user to configure routine and force immediate [updates of firmware](/controller/support/ota_updates)
- Displays a more robust [event log and error log](/controller/support/event_and_error_logs) inclusive of the event time and type with additional entries

## :no_entry_sign: What this application does not do
- Configures the user-programmable logic for high voltage switching
- Exposes the port and channel configuration
- Executes actions based on inputs from physical buttons or API/MQTT requests. See [Controller Application](/controller/software/controller/).