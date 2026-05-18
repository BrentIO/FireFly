# ESP8266 Special Handling

The FireFly Client uses an ESP8266, which lacks several hardware capabilities present on the ESP32 Controller. This page documents the platform-specific workarounds and design constraints that would need to be revisited when sunsetting the ESP8266 platform.

## Device Identity (EEPROM)

FireFly Controllers use ESP32 eFuse (hardware one-time-programmable) to store device identity. The ESP8266 has no eFuse equivalent, so identity is stored in EEPROM (flash-backed, software-enforced one-write semantics) by the HW-Reg application before production firmware is flashed.

### Storage Comparison

| Field | Size | Controller (ESP32) | Client (ESP8266) |
|-------|------|--------------------|------------------|
| UUID | 16 bytes | eFuse BLOCK1, bits 0–127 | EEPROM offset 2 |
| `product_hex` | 4 bytes | eFuse BLOCK1, bits 128–159 | EEPROM offset 18 |
| Master key | 32 bytes | eFuse BLOCK3, bits 0–255 | EEPROM offset 22 |
| `product_id` | 33 bytes | NVS namespace `device`, key `pid` | EEPROM offset 54 |

### EEPROM Layout

The identity block occupies 87 bytes beginning at EEPROM offset 0:

| Offset | Size | Field |
|--------|------|-------|
| 0 | 1 byte | Magic byte `0x1E` (ASCII Record Separator) |
| 1 | 1 byte | Magic byte `0x04` (ASCII End of Transmission) |
| 2 | 16 bytes | UUID |
| 18 | 4 bytes | `product_hex` |
| 22 | 32 bytes | Master key |
| 54 | 33 bytes | `product_id` |

Bytes 0 and 1 are sentinel values that indicate a valid identity block. On boot, `begin()` checks these two bytes first. If they are absent — all-zero EEPROM, old SPIFFS data, or any other unrecognized content — the device treats itself as unregistered and halts with [flash code 1](../support/failure_led_patterns.md).

### Security Characteristics

On ESP32, eFuse BLOCK3 is hardware write-once and can be made hardware read-protected, making it resistant to extraction even under arbitrary code execution. On ESP8266, EEPROM is flash-backed and enforced only in software. A device with physical access and the ability to run arbitrary code could read or overwrite the identity block. This is an inherent limitation of the ESP8266 platform.

### One-Write Semantics

Once identity is written by the HW-Reg application, the `write()` method returns `false` on any subsequent call (guarded by an internal `enabled` flag). Identity cannot be overwritten through the normal firmware API.

The `wipe()` method is available exclusively to the HW-Reg application to reset a device for re-registration. It clears the EEPROM block and re-enables `write()`.

### Registration Flow

1. Flash the device with the Client HW-Reg application.
2. The operator submits UUID, `product_id`, and `product_hex` via the HW-Reg web UI.
3. HW-Reg generates the master key on-device — it is never transmitted.
4. HW-Reg calls `write()`, which persists all fields to EEPROM.
5. Flash the device with the production Client application firmware.
6. On every subsequent boot, `begin()` reads and validates the identity block from EEPROM.

## CA Certificate

On the Controller (ESP32), CA certificates are managed at runtime through the configuration system and can be updated without reflashing. On the Client (ESP8266), the CA certificate is compiled directly into firmware. It cannot be stored to or loaded from the `config` partition at runtime — updating the CA requires a firmware update.

This design reflects the absence of a hardware-protected key store on the ESP8266. Storing a CA certificate in unprotected flash would offer no meaningful security benefit over embedding it in firmware.

## Partition Scheme

Unlike the Controller, the ESP8266 does not use a generated `partitions.csv`. The memory layout is baked into the FQBN board options and managed by the ESP8266 Arduino core. Board options are sourced from `devices.yaml`.

The following partition layout applies to FFI0600-2011:

| Label | Address | Size |
|-------|---------|------|
| eboot | 0x000000 | 0x001000 |
| app0 | 0x001000 | 0x100000 |
| app1 | 0x101000 | 0x100000 |
| config | 0x200000 | 0x1FB000 |
| rf_cal | 0x3FB000 | 0x001000 |
| phy_init | 0x3FC000 | 0x001000 |
| sdk_config | 0x3FE000 | 0x002000 |

::: info
On ESP8266, `LittleFS.begin()` locates the filesystem by the address baked into the core at compile time via the `eesz` board option — not by the partition label. The label is documentary only.
:::

## Synthetic Partition Table for FMC Compatibility

FMC's firmware upload Lambda hard-requires a `.partitions.bin` file in every firmware ZIP and parses it using the ESP32 binary partition table format (32-byte entries, `0xAA 0x50` magic bytes) to extract flash offset data for storage in DynamoDB. The ESP8266 toolchain produces no such file — the partition layout is baked into the core at compile time via the `eesz` FQBN option.

To bridge this gap, the Client CI build synthesizes `Client.ino.partitions.bin` from the `partition_scheme` entries in `devices.yaml`, using the same binary format FMC expects. No changes to FMC are required. The manifest generation step discovers the file automatically and includes it in the manifest `files` array and the uploaded ZIP.
