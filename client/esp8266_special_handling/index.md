# ESP8266 Special Handling

The FireFly Client uses an ESP8266, which lacks several hardware capabilities present on the ESP32 Controller. This page documents the platform-specific constraints and workarounds in one place — useful as a reference when sunsetting the ESP8266 platform.

## Device Identity EEPROM

The ESP8266 has no eFuse equivalent, so device identity is stored in EEPROM rather than one-time-programmable silicon. The identity block occupies 87 bytes beginning at EEPROM offset 0:

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

On ESP32, eFuse BLOCK3 is hardware write-once and can be made hardware read-protected. On ESP8266, EEPROM is flash-backed and enforced only in software — a device with physical access and the ability to run arbitrary code could read or overwrite the identity block.

### One-Write Semantics

Once identity is written by the HW-Reg application, the `write()` method returns `false` on any subsequent call (guarded by an internal `enabled` flag). The `wipe()` method is available exclusively to the HW-Reg application to reset a device for re-registration.

## CA Certificate

CA certificate handling differs between the two Client applications:

- **HW-Reg application** — The CA certificate is compiled directly into firmware and cannot be changed without reflashing.
- **Client application** — Uses BearSSL, which supports a single CA. The CA can be updated via MQTT without reflashing.

This contrasts with the Controller (ESP32), where CA certificates are managed at runtime through the configuration system.

### Rotating the CA Certificate

Cert rotation is needed when the CA certificate is approaching expiry or has been compromised. Because the ESP8266 cannot manage certificates through the Controller's runtime configuration system, a dedicated one-shot Docker tool is used to broadcast the updated certificate to all provisioned clients.

**How clients receive the update:** The tool fetches the current TLS certificate chain from the FireFly Cloud API, selects the most stable CA cert, computes its SHA-256 fingerprint, and publishes a retained JSON message to `FireFly/clients/cert/state`. Clients that are online receive it immediately; offline clients pick it up automatically on their next reconnect and write the new PEM to LittleFS.

Clone the FireFly-Client repository and build the Docker image:

```bash
git clone https://github.com/BrentIO/FireFly-Client.git
cd FireFly-Client
docker build -t firefly-cert-rotation tools/cert-rotation/
```

Run the container to publish the updated certificate to all clients:

```bash
docker run --rm \
  -e FIREFLY_CLOUD_API_ROOT=https://api.fireflylx.com \
  -e MQTT_HOST=<broker-ip> \
  -e MQTT_USERNAME=<username> \
  -e MQTT_PASSWORD=<password> \
  firefly-cert-rotation
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `FIREFLY_CLOUD_API_ROOT` | Yes | — | HTTPS URL to fetch the TLS certificate chain from |
| `MQTT_HOST` | Yes | — | MQTT broker hostname or IP address |
| `MQTT_PORT` | No | `1883` | MQTT broker port |
| `MQTT_USERNAME` | No | — | MQTT credentials |
| `MQTT_PASSWORD` | No | — | MQTT credentials |
| `MQTT_TOPIC` | No | `FireFly/clients/cert/state` | Retained topic the cert is published to |

**Verifying the update:** After running the tool, each client logs the cert update and publishes its new fingerprint as a retained message to `FireFly/{UUID}/cert/state`. Confirm the fingerprint on that topic matches the CA cert you expected to rotate in.

## Partition Scheme

The ESP8266 does not use a generated `partitions.csv`. The memory layout is baked into the FQBN board options and managed by the ESP8266 Arduino core. Board options are sourced from `devices.yaml`.

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
