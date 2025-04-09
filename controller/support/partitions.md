# Partitions
FireFly Controller uses a custom board, typically using the ESP32 WROVER-E Module featuring 16MB flash storage (ESP32-WROVER-E-N16R8).

The custom partition table will is defined as:

| Name | Type | SubType | Offset | Size (Hex) | Size (Human) | Flags |
|--|--|--|--|--|--| -- |
| nvs | data | nvs | 0x9000 | 0x5000 | 20KB |
| otadata | data | ota | 0xe000 | 0x2000 | 8KB |
| app0 | app | ota_0 | 0x10000 | 0x640000 | 6.25MB |
| app1 | app | ota_1 | 0x650000 | 0x640000 | 6.25MB |
| config | data | spiffs | 0xC90000 | 0x80000 | 512KB |
| www | data | spiffs | 0xD10000 | 0x2E0000 | 2.875MB |
| coredump | data | coredump | 0xFF0000 | 0x10000 | 64KB |


## `config` partition
Data stored within this partition contains configuration data for the controller itself, such as:
- [OTA Update Service configuration](/controller/support/ota_updates)
- [Certificates](/controller/support/certificate_management)
- I/O and action configuration

It should only be formatted and flashed by the [Hardware Registration and Configuration application](/controller/software/hardware_registration_and_configuration/).

:no_entry_sign: It is ineligible to receive OTA updates via the OTA Update Service, nor via a forced OTA update.  

The partition size is 512KB.

## `www` partition
Files stored on this partition are used for web user interface or other blobs of data.

:white_check_mark: It is eligible for OTA updates, and therefore data stored on this partition will be lost during an OTA update of the partition.

The partition size is 2.875MB.