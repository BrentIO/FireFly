# Migrating from v1.14 Firmware

Production units running v1.14 firmware can be migrated to the current firmware without physical access. After the firmware update, each device must be re-provisioned from the Controller.

## How v1.14 Stores Configuration

All v1.14 configuration (WiFi credentials, MQTT settings, LED config) is stored in **EEPROM**, not SPIFFS. The SPIFFS partition contains only the provisioning web UI assets. Pushing new firmware leaves all existing EEPROM configuration intact — it survives OTA completely.

The v1.14 EEPROM config format is incompatible with the new firmware's provisioning model, so re-provisioning is required after the update.

## OTA Paths

### Provisioned devices (connected to the network)

Publish the firmware binary URL to the device's MQTT topic:

```
Topic:   aveo/client/{Device ID}/firmware/set
Payload: https://your-server.com/path/to/Client.ino.bin
```

### Unprovisioned devices (showing the `FireFly-{MAC}` hotspot)

Connect to the hotspot, navigate to `http://192.168.1.1/update`, and upload the compiled `.bin` via the Firmware tab.

## Discovering v1.14 Devices via MQTT

v1.14 devices publish a retained status LWT on every boot. To discover all devices, subscribe to:

```
aveo/client/#
```

To request an immediate health update from a specific device:

```
Topic:   aveo/client/{Device ID}/health/get
Payload: (any value)
```

The device responds on the following topics:

| Topic | Payload |
|-------|---------|
| `aveo/client/{Device ID}/status` | `ONLINE` |
| `aveo/client/{Device ID}/ip` | Device IP address |
| `aveo/client/{Device ID}/firmware` | Firmware version (e.g. `1.14`) |
| `aveo/client/{Device ID}/deviceName` | MAC-derived device name |
| `aveo/client/{Device ID}/name` | Friendly name |
| `aveo/client/{Device ID}/uptime` | Milliseconds since last boot |
| `aveo/client/{Device ID}/errorMessage` | Empty if healthy |

## Helper Script

The [`scripts/migrate_v114.py`](https://github.com/BrentIO/FireFly-Client/blob/main/scripts/migrate_v114.py) script in the FireFly-Client repository automates discovery and bulk firmware dispatch. It defaults to a dry run — pass `--no-dry-run` to execute. Requires `paho-mqtt`.

## Re-Provisioning After Migration

On first boot, the new firmware detects no valid configuration and enters provisioning mode automatically (rotating LEDs). For each device, bring the Controller within 3–5 feet and trigger provisioning from the Controller's web UI. See [Client Provisioning](/client/provisioning/) for details.

## Migration Checklist

1. Obtain a compiled firmware binary for the target hardware
2. Push firmware via MQTT (`scripts/migrate_v114.py`) or via the device hotspot upload page
3. Device reboots, detects no valid config, enters provisioning mode (rotating LEDs)
4. Bring the Controller within range and provision via the Controller web UI
5. Confirm the device connects to WiFi, MQTT, and begins checking the Cloud OTA endpoint
