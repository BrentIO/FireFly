# Home Assistant Auto Discovery

The integration to Home Assistant is done via MQTT auto discovery.  The benefit of auto discovery is that no additional software needs to be configured in Home Assistant for it to work.

::: info What entities are registered via auto discovery?
Auto discovery registers the following entities in Home Assistant for each client:

- **IP Address** — current WiFi IP address
- **MAC Address** — WiFi MAC address
- **Boot Time** — Unix epoch timestamp of the last boot
- **Error Count** — number of active errors on the device
- **Certificate Fingerprint** — SHA-256 fingerprint of the CA certificate stored on the device
- **Firmware Update** — OTA firmware update status and install control
:::

::: info What does FireFly use for the Home Assistant Auto Discovery topic?
FireFly uses the default topic root of `homeassistant` for auto discovery.  You can configure this inside the MQTT settings of Home Assistant.  It should _not_ include a trailing `/`.
:::


## MQTT Message Sequences

During the `connectMqtt()` process, the client will execute the following MQTT actions after making a connection to the broker:

[![MQTT Connection](./images/mqtt_connection.svg)](./images/mqtt_connection.svg)

[![MQTT Diagnostic Sensors & Certificate Fingerprint](./images/mqtt_diagnostics.svg)](./images/mqtt_diagnostics.svg)

[![MQTT Firmware Update](./images/mqtt_firmware_update.svg)](./images/mqtt_firmware_update.svg)


## Retained Messages and Last Will & Testament

All telemetry and auto-discovery payloads are published with the retained flag set.  This ensures that Home Assistant receives the current state immediately when it connects or restarts, without waiting for the next publish cycle.

In the event the client loses connectivity, the MQTT Last Will & Testament will set all entities to `Unavailable`.


## Client

Each client is registered as a single device in Home Assistant.  Because clients do not have a user-configured friendly name, the device `name` is set to the client's UUID.  Examples below use UUID `3fa85f64-5717-4562-b3fc-2c963f66afa6`.

::: info Device identifier prefix
The client device identifier is prefixed with `FireFly-` (e.g. `FireFly-3fa85f64-5717-4562-b3fc-2c963f66afa6`).  This differs from the Controller, which uses the bare UUID as its identifier.
:::

### IP Address

Current IPv4 address of the client's WiFi interface.

Example auto discovery topic:
```text
homeassistant/sensor/FireFly-3fa85f64-5717-4562-b3fc-2c963f66afa6-ip-address/config
```

Example auto discovery payload:
```json
{
    "unique_id": "FireFly-3fa85f64-5717-4562-b3fc-2c963f66afa6-ip-address",
    "name": "IP Address",
    "state_topic": "FireFly/3fa85f64-5717-4562-b3fc-2c963f66afa6/ip-address/state",
    "availability_topic": "FireFly/3fa85f64-5717-4562-b3fc-2c963f66afa6/availability",
    "icon": "mdi:ip",
    "device": {
        "identifiers": [
            "FireFly-3fa85f64-5717-4562-b3fc-2c963f66afa6"
        ],
        "name": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "manufacturer": "P5 Software LLC",
        "model": "FireFly Client",
        "model_id": "FFI0600-2011",
        "serial_number": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "sw_version": "2025.5.1"
    }
}
```

Example state topic:
```text
FireFly/3fa85f64-5717-4562-b3fc-2c963f66afa6/ip-address/state
```

Example state payload:
```text
192.168.10.101
```


### MAC Address

WiFi MAC address of the client in uppercase colon-delimited notation.

Example auto discovery topic:
```text
homeassistant/sensor/FireFly-3fa85f64-5717-4562-b3fc-2c963f66afa6-mac-address/config
```

Example auto discovery payload:
```json
{
    "unique_id": "FireFly-3fa85f64-5717-4562-b3fc-2c963f66afa6-mac-address",
    "name": "MAC Address",
    "state_topic": "FireFly/3fa85f64-5717-4562-b3fc-2c963f66afa6/mac-address/state",
    "availability_topic": "FireFly/3fa85f64-5717-4562-b3fc-2c963f66afa6/availability",
    "icon": "mdi:ethernet",
    "device": {
        "identifiers": [
            "FireFly-3fa85f64-5717-4562-b3fc-2c963f66afa6"
        ],
        "name": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "manufacturer": "P5 Software LLC",
        "model": "FireFly Client",
        "model_id": "FFI0600-2011",
        "serial_number": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "sw_version": "2025.5.1"
    }
}
```

Example state topic:
```text
FireFly/3fa85f64-5717-4562-b3fc-2c963f66afa6/mac-address/state
```

Example state payload:
```text
A1:B2:C3:D4:E5:F6
```


### Boot Time

Unix epoch timestamp (seconds) of when the client last booted.  Published once on MQTT connect.

Example auto discovery topic:
```text
homeassistant/sensor/FireFly-3fa85f64-5717-4562-b3fc-2c963f66afa6-time-start/config
```

Example auto discovery payload:
```json
{
    "unique_id": "FireFly-3fa85f64-5717-4562-b3fc-2c963f66afa6-time-start",
    "name": "Boot Time",
    "state_topic": "FireFly/3fa85f64-5717-4562-b3fc-2c963f66afa6/time-start/state",
    "availability_topic": "FireFly/3fa85f64-5717-4562-b3fc-2c963f66afa6/availability",
    "icon": "mdi:clock-start",
    "device": {
        "identifiers": [
            "FireFly-3fa85f64-5717-4562-b3fc-2c963f66afa6"
        ],
        "name": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "manufacturer": "P5 Software LLC",
        "model": "FireFly Client",
        "model_id": "FFI0600-2011",
        "serial_number": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "sw_version": "2025.5.1"
    }
}
```

Example state topic:
```text
FireFly/3fa85f64-5717-4562-b3fc-2c963f66afa6/time-start/state
```

Example state payload:
```text
1709398094
```


### Error Count

Current count of active errors on the device.  Published on MQTT connect and whenever the error count changes.

Example auto discovery topic:
```text
homeassistant/sensor/FireFly-3fa85f64-5717-4562-b3fc-2c963f66afa6-count-errors/config
```

Example auto discovery payload:
```json
{
    "unique_id": "FireFly-3fa85f64-5717-4562-b3fc-2c963f66afa6-count-errors",
    "name": "Error Count",
    "state_topic": "FireFly/3fa85f64-5717-4562-b3fc-2c963f66afa6/count-errors/state",
    "availability_topic": "FireFly/3fa85f64-5717-4562-b3fc-2c963f66afa6/availability",
    "icon": "mdi:alert-circle",
    "device": {
        "identifiers": [
            "FireFly-3fa85f64-5717-4562-b3fc-2c963f66afa6"
        ],
        "name": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "manufacturer": "P5 Software LLC",
        "model": "FireFly Client",
        "model_id": "FFI0600-2011",
        "serial_number": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "sw_version": "2025.5.1"
    }
}
```

Example state topic:
```text
FireFly/3fa85f64-5717-4562-b3fc-2c963f66afa6/count-errors/state
```

Example state payload:
```text
3
```


### Certificate Fingerprint

SHA-256 fingerprint of the CA certificate currently stored on the client.  Published on MQTT connect and whenever the certificate is updated via the broadcast rotation topic.  Operators can compare this value against the certificate fingerprint on the Controller to verify that certificate rotation has propagated to every device.

Example auto discovery topic:
```text
homeassistant/sensor/FireFly-3fa85f64-5717-4562-b3fc-2c963f66afa6-cert/config
```

Example auto discovery payload:
```json
{
    "unique_id": "FireFly-3fa85f64-5717-4562-b3fc-2c963f66afa6-cert",
    "name": "Certificate Fingerprint",
    "state_topic": "FireFly/3fa85f64-5717-4562-b3fc-2c963f66afa6/cert/state",
    "availability_topic": "FireFly/3fa85f64-5717-4562-b3fc-2c963f66afa6/availability",
    "icon": "mdi:certificate",
    "device": {
        "identifiers": [
            "FireFly-3fa85f64-5717-4562-b3fc-2c963f66afa6"
        ],
        "name": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "manufacturer": "P5 Software LLC",
        "model": "FireFly Client",
        "model_id": "FFI0600-2011",
        "serial_number": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "sw_version": "2025.5.1"
    }
}
```

Example state topic:
```text
FireFly/3fa85f64-5717-4562-b3fc-2c963f66afa6/cert/state
```

Example state payload:
```text
AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99
```


### Firmware Update

Indicates whether a firmware update is available.  If so, the update can be triggered from MQTT by sending the `payload_install` value to the `command_topic`.

The update entity uses the same device availability topic as all other client entities.

Example auto discovery topic:
```text
homeassistant/update/FireFly-3fa85f64-5717-4562-b3fc-2c963f66afa6-update/config
```

Example auto discovery payload:
```json
{
    "unique_id": "FireFly-3fa85f64-5717-4562-b3fc-2c963f66afa6-update",
    "name": "Firmware Update",
    "state_topic": "FireFly/3fa85f64-5717-4562-b3fc-2c963f66afa6/update/state",
    "command_topic": "FireFly/3fa85f64-5717-4562-b3fc-2c963f66afa6/update/set",
    "payload_install": "do-update",
    "availability_topic": "FireFly/3fa85f64-5717-4562-b3fc-2c963f66afa6/availability",
    "device": {
        "identifiers": [
            "FireFly-3fa85f64-5717-4562-b3fc-2c963f66afa6"
        ],
        "name": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "manufacturer": "P5 Software LLC",
        "model": "FireFly Client",
        "model_id": "FFI0600-2011",
        "serial_number": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "sw_version": "2025.5.1"
    }
}
```

Example state topic:
```text
FireFly/3fa85f64-5717-4562-b3fc-2c963f66afa6/update/state
```

Example state payload for `Update available`:
```json
{
    "installed_version": "2025.4.1",
    "latest_version": "2025.5.1",
    "in_progress": false
}
```

Example state payload for `Up-to-date`:
```json
{
    "installed_version": "2025.5.1",
    "latest_version": "2025.5.1",
    "in_progress": false
}
```

Example state payload while updating:
```json
{
    "in_progress": true
}
```

To trigger the update via MQTT:
```text
FireFly/3fa85f64-5717-4562-b3fc-2c963f66afa6/update/set
```
with payload:
```
do-update
```


## Auto Discovery Field Mapping

| Field | Data Source |
| ----- | ----------- |
| `unique_id` | Concatenation of hard-coded `"FireFly-"` + client UUID + `"-"` + entity ID |
| `name` | Hard-coded entity display name |
| `state_topic` | Concatenation of hard-coded `"FireFly/"` + client UUID + entity-specific path |
| `command_topic` | `FireFly/{UUID}/update/set` (update entity only) |
| `payload_install` | Hard-coded `"do-update"` (update entity only) |
| `availability_topic` | `FireFly/{UUID}/availability` |
| `icon` | Hard-coded MDI icon reference per entity |
| `device` → `identifiers` | Concatenation of hard-coded `"FireFly-"` + client UUID |
| `device` → `name` | Client UUID |
| `device` → `manufacturer` | Hard-coded `"P5 Software LLC"` |
| `device` → `model` | Hard-coded `"FireFly Client"` |
| `device` → `model_id` | Hardware model ID (e.g. `"FFI0600-2011"`) |
| `device` → `serial_number` | Client UUID |
| `device` → `sw_version` | Firmware version string |
