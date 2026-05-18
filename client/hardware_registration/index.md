# Hardware Registration and Configuration

The Hardware Registration and Configuration application is intended to be used to perform the initial configuration of the device. This application is used at the factory to configure the device prior to being shipped, or by a developer building their own hardware.

## :white_check_mark: What this application does
- Sets up an HTTP server using on-board WiFi
- Provides a user interface to configure device identity, including UUID, `product_id`, and `product_hex`. The master cryptographic key is generated on-device and written to EEPROM — it never leaves the chip.
- Registers the device with the cloud service

## Device Identity EEPROM Storage

Unlike the Controller, which uses hardware one-time-programmable eFuse registers, the ESP8266 has no eFuse equivalent. Device identity is stored in EEPROM using software-enforced one-write semantics.

| Field | Size | EEPROM Offset |
|-------|------|---------------|
| UUID | 16 bytes | 2 |
| `product_hex` | 4 bytes | 18 |
| Master key | 32 bytes | 22 |
| `product_id` | 33 bytes | 54 |

See [ESP8266 Special Handling — Device Identity](/client/esp8266_special_handling/#device-identity-eeprom) for the complete EEPROM layout, magic bytes, one-write semantics, and security characteristics.

::: warning Software-enforced only
On the Controller, eFuse burns are permanent and hardware-protected. On the Client, EEPROM identity is enforced only in software — the `wipe()` method is available to the HW-Reg application to reset a device for re-registration.
:::

## Registration Flow

1. Flash the device with the Client HW-Reg application.
2. The operator submits UUID, `product_id`, and `product_hex` via the HW-Reg web UI.
3. HW-Reg generates the master key on-device — it is never transmitted.
4. HW-Reg calls `write()`, which persists all fields to EEPROM.
5. Flash the device with the production Client application firmware.
6. On every subsequent boot, `begin()` reads and validates the identity block from EEPROM.

## :no_entry_sign: What this application does not do
- Configure WiFi credentials, MQTT settings, or OTA URL — see [Provisioning](/client/provisioning/).
- Verify peripherals or functional hardware behavior.
