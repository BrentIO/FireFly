# Over-the-Air (OTA) Updates

Client firmware is updated over-the-air without physical access. The OTA URL is provisioned to the device by the Controller during provisioning and is not configured directly on the client.

The `config` partition (WiFi credentials, MQTT settings, CA certificate) is never touched by OTA. Configuration survives all firmware updates.

::: info No filesystem OTA on ESP8266
The OTA manifest may include a `littlefs` field, but ESP8266 Client firmware intentionally ignores it. Only the application (sketch) slot is updated via OTA. Filesystem updates are not supported over the air on ESP8266 — this is by design. Future ESP32-based client variants may handle filesystem OTA differently.
:::

## Update Schedule

The client checks for a firmware update:

- 30 seconds after boot
- Every 24 hours thereafter

## How It Works

The client calls `GET {otaUrl}?current_version={VERSION}` using the URL provisioned in its configuration. The server returns the next available version; see the [OTA Update Flow](/cloud/ota_update_flow) for server-side behavior, response codes, and version sequencing details.

The client reads only two fields from the response:

| Field | Required | Description |
|-------|----------|-------------|
| `version` | Yes | Version string of the available firmware |
| `url` | Yes | Direct URL to the firmware binary |

If `version` matches the running firmware or `url` is empty, no update is performed.

## TLS Certificate Handling

If a CA certificate was provisioned to the device, that certificate is used to validate the OTA server. If no certificate is present, TLS validation is skipped.

## Update Process

When a newer version is found:

1. The device publishes its current and available versions to its MQTT update state topic.
2. `ESPhttpUpdate` downloads and flashes the firmware binary to the application OTA slot.
3. On success, the device reboots automatically into the new firmware.
4. On failure, the error count is incremented.

## Triggering an Immediate Check

An OTA check can be triggered on demand by publishing `do-update` to the device's MQTT update command topic.

## Home Assistant Integration

On each MQTT connection, the client publishes a Home Assistant MQTT discovery payload for an `update` entity. This exposes the installed and available firmware versions in Home Assistant and allows updates to be triggered from the HA UI.
