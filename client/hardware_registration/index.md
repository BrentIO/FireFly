# Client Hardware Registration

FireFly Clients use an ESP8266, which has no hardware one-time-programmable storage (eFuse). Device identity is instead stored in EEPROM (flash-backed, software-enforced one-write semantics) by the HW-Reg application before production firmware is flashed.

## Storage Comparison

The following table shows where each identity field lives on the Controller (ESP32) versus the Client (ESP8266):

| Field | Size | Controller (ESP32) | Client (ESP8266) |
|-------|------|--------------------|------------------|
| UUID | 16 bytes | eFuse BLOCK1, bits 0–127 | EEPROM offset 2 |
| `product_hex` | 4 bytes | eFuse BLOCK1, bits 128–159 | EEPROM offset 18 |
| Master key | 32 bytes | eFuse BLOCK3, bits 0–255 | EEPROM offset 22 |
| `product_id` | 33 bytes | NVS namespace `device`, key `pid` | EEPROM offset 54 |

## EEPROM Layout

The identity block occupies 87 bytes beginning at EEPROM offset 0:

| Offset | Size | Field |
|--------|------|-------|
| 0 | 1 byte | Magic byte `0x1E` (ASCII Record Separator) |
| 1 | 1 byte | Magic byte `0x04` (ASCII End of Transmission) |
| 2 | 16 bytes | UUID |
| 18 | 4 bytes | `product_hex` |
| 22 | 32 bytes | Master key |
| 54 | 33 bytes | `product_id` |

### Magic Bytes

Bytes 0 and 1 are sentinel values that indicate a valid identity block. On boot, `begin()` checks these two bytes first. If they are absent — all-zero EEPROM, old SPIFFS data, or any other unrecognized content — the device treats itself as unregistered and halts with [flash code 1](../support/failure_led_patterns.md).

## Security Characteristics

On ESP32, eFuse BLOCK3 is hardware write-once and can be made hardware read-protected, making it resistant to extraction even under arbitrary code execution. On ESP8266, EEPROM is flash-backed and enforced only in software. A device with physical access and the ability to run arbitrary code could read or overwrite the identity block. This is an inherent limitation of the ESP8266 platform.

## One-Write Semantics

Once identity is written by the HW-Reg application, the `write()` method returns `false` on any subsequent call (guarded by an internal `enabled` flag). Identity cannot be overwritten through the normal firmware API.

The `wipe()` method is available exclusively to the HW-Reg application to reset a device for re-registration. It clears the EEPROM block and re-enables `write()`.

## Registration Flow

1. Flash the device with the Client HW-Reg application.
2. The operator submits UUID, `product_id`, and `product_hex` via the HW-Reg web UI.
3. HW-Reg generates the master key on-device — it is never transmitted.
4. HW-Reg calls `write()`, which persists all fields to EEPROM.
5. Flash the device with the production Client application firmware.
6. On every subsequent boot, `begin()` reads and validates the identity block from EEPROM.
