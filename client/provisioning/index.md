# Client Provisioning

An unprovisioned client has no WiFi credentials, MQTT configuration, or OTA URL. It enters provisioning mode automatically on boot when no valid configuration is found, indicated by rotating LEDs.

The Controller must be within approximately 3–5 feet of the client during provisioning. The Controller's provisioning SoftAP transmits at 2 dBm.

## Overview

The client scans for a WPA2 SoftAP named `FireFly-Provisioning` broadcast by the Controller. The WPA2 password is derived deterministically from the Controller's BSSID. Once connected, the client exchanges a token with the Controller, fetches its configuration, then reboots into normal operating mode.

The client scans for the SoftAP every 10 seconds until provisioning succeeds.

## Password Derivation

The WPA2 password is a 12-character uppercase hex string derived from the Controller's BSSID using a nibble-interleave algorithm.

For each index `i` (0–5):
- Take the **upper nibble** of `BSSID[i]`
- Take the **lower nibble** of `BSSID[5-i]`
- Concatenate as two uppercase hex digits

**Example:** BSSID `A1:B2:C3:D4:E5:F6` → Password `A6B5C4D3E2F1`

| i | BSSID[i] | Upper nibble | BSSID[5-i] | Lower nibble | Pair |
|---|----------|--------------|------------|--------------|------|
| 0 | A1 | A | F6 | 6 | A6 |
| 1 | B2 | B | E5 | 5 | B5 |
| 2 | C3 | C | D4 | 4 | C4 |
| 3 | D4 | D | C3 | 3 | D3 |
| 4 | E5 | E | B2 | 2 | E2 |
| 5 | F6 | F | A1 | 1 | F1 |

## Provisioning Sequence

Once connected to the SoftAP (Controller IP `192.168.4.1`), the client makes two HTTP requests:

### 1. Token exchange

```
POST http://192.168.4.1/api/provisioning/token
Body: {"uuid": "<device UUID>", "mac_address": "<device MAC>"}
```

Returns a short-lived bearer token bound to the device's MAC address. The token is used to authenticate all subsequent provisioning requests via the `provisioning-token` header. Only accepted over the SoftAP interface (HTTP 403 on Ethernet). If the UUID is unknown, the Controller returns HTTP 404 and the client retries on the next scan cycle.

### 2. Fetch configuration

```
GET http://192.168.4.1/api/clients/{uuid}
Headers:
  provisioning-token: <token from step 1>
```

On success (`200 OK`), the response is a JSON object saved to `/config.json` on the `config` partition. The configuration includes:

| Field | Description |
|-------|-------------|
| `uuid` | Device UUID assigned by the Controller |
| `wifi.ssid` | WiFi network SSID |
| `wifi.password` | WiFi password |
| `mqtt.host` | MQTT broker hostname |
| `mqtt.port` | MQTT broker port (default: 1883) |
| `mqtt.username` | MQTT username |
| `mqtt.password` | MQTT password |
| `ota.url` | OTA firmware update endpoint URL |
| `hids` | Input channel mappings |

### 3. Reboot

After saving configuration, the client disconnects from the SoftAP and reboots into normal operating mode.
