# Partitions
FireFly Controller uses a custom board, typically using the ESP32 WROVER-E Module featuring 16MB flash storage (ESP32-WROVER-E-N16R8).

The partition table is defined per hardware model in [`devices.yaml`](https://github.com/BrentIO/FireFly-Controller/blob/main/devices.yaml) and generated automatically at build time — there is no static `partitions.csv` committed to the repository. Partition sizes can differ between hardware models; the table below reflects the layout used by all current active hardware variants.

| Name | Type | SubType | Offset | Size (Hex) | Size (Human) | Flags |
|--|--|--|--|--|--| -- |
| nvs | data | nvs | 0x9000 | 0x5000 | 20KB |
| otadata | data | ota | 0xe000 | 0x2000 | 8KB |
| app0 | app | ota_0 | 0x10000 | 0x640000 | 6.25MB |
| app1 | app | ota_1 | 0x650000 | 0x640000 | 6.25MB |
| config | data | spiffs | 0xC90000 | 0x80000 | 512KB |
| ui | data | spiffs | 0xD10000 | 0x2E0000 | 2.875MB |
| coredump | data | coredump | 0xFF0000 | 0x10000 | 64KB |

> **Note:** The `spiffs` SubType label is an ESP32 toolchain partition type identifier. The `config` and `ui` partitions both use the LittleFS filesystem, not SPIFFS.

## How the partition table is created and updated

The partition layout for each hardware model lives in `devices.yaml` under each device's `partition_scheme` list. Each entry specifies the partition label, type, subtype, offset, and size.

At build time, the CI workflow generates a `partitions.csv` for the specific device being compiled by querying `devices.yaml` using `yq` and `jq`. The generated file is written into the application directory before Arduino CLI compiles the firmware, so each hardware variant receives its own correctly-sized partition table binary.

`devices.yaml` also contains a per-device `bootloader_addr` field that specifies the flash address of the bootloader (e.g. `0x1000` for Xtensa LX6-based ESP32 variants). This value is written into the build manifest and propagated to the FireFly Cloud flash UI, so a new chip family can be supported by updating only `devices.yaml`.

To update or add a partition for a hardware model, edit the `partition_scheme` for that device in `devices.yaml`. The next build will automatically produce the correct `partitions.csv` — no other files need to be changed.


## `config` partition
Data stored within this partition contains configuration data for the controller itself, such as:
- [OTA Update Service configuration](/controller/support/ota_updates)
- [Certificates](/controller/support/certificate_management)
- I/O and action configuration

It should only be formatted and flashed by the [Hardware Registration and Configuration application](/controller/software/hardware_registration_and_configuration/).

:no_entry_sign: It is ineligible to receive OTA updates via the OTA Update Service, nor via a forced OTA update.

This protection is enforced at two levels:
- **Library level** — the OTA library only permits writes to data filesystem partition types (LittleFS/SPIFFS or FAT). App, NVS, coredump, and other partition types are unreachable regardless of what the update server requests.
- **Firmware level** — the `config` partition is explicitly blocked by name in the application firmware. Removing it from the block list requires shipping a firmware update first, making accidental overwrites a deliberate two-step process.

The partition size is 512KB.

## `ui` partition
Files stored on this partition are used for web user interface or other blobs of data.

:white_check_mark: It is eligible for OTA updates, and therefore data stored on this partition will be lost during an OTA update of the partition.

The partition size is 2.875MB.