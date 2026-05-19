# Client Provisioning

Provisioning Mode allows unprovisioned Clients to connect to a Controller via WiFi and retrieve their full configuration automatically.  Enabling Provisioning Mode may take several seconds to enable the Controller's on-board WiFi radio and to prepare the Controller with the list of approved Clients.  Likewise, disabling Provisioning Mode will take a second or two in order to disconnect clients and shut down the SoftAP.

Only one Controller should have Provisioning Mode active at any given time.

When enabled, the Controller broadcasts a WPA2-protected WiFi SSID of `FireFly-Provisioning`.  The SoftAP accepts only one connected client at a time.  Provisioning Mode is automatically disabled after 30 minutes (configurable at compile time via `PROVISIONING_MODE_TTL`).

## Protocol

[![Provisioning Sequence Diagram](./images/provisioning-sequence.svg)](./images/provisioning-sequence.svg)

### Step 1 — Enable Provisioning Mode

The browser calls `PUT /api/provisioning`.  The Controller reads all registered client records, loads their MAC addresses into the allowlist, and starts the SoftAP with a device-unique WPA2 password.  TX power is reduced to approximately 2 dBm to limit the SoftAP range to 3–5 feet, preventing over-the-air eavesdropping from a distance.

### Step 2 — Client Scans and Connects

The Client firmware scans for the exact SSID `FireFly-Provisioning`, reads the BSSID from the scan result, and derives the WPA2 password using the nibble-interleave algorithm (see [SoftAP Password](#softap-password) below).  The Client also reduces its own TX power to minimum before associating.

If the connecting device's MAC address is not in the allowlist, Provisioning Mode is shut down automatically and a warning is shown on the OLED display.

### Step 3 — Nonce Exchange

The Client calls `GET /api/provisioning/nonce` (no authentication required) to obtain a single-use session nonce.

### Step 4 — Configuration Retrieval

The Client calls `GET /api/provisioning/client` with its MAC address in the `mac-address` header and the nonce in the `x-nonce` header.  The Controller validates the nonce, locates the matching client record, invalidates the nonce, and returns the full client configuration JSON.

### Step 5 — Client Stores Config and Reboots

The Client stores the received configuration to persistent storage (EEPROM or LittleFS) and reboots into normal operating mode (connect to WiFi → connect to MQTT → normal operation).

## SoftAP Password

The WPA2 password is derived deterministically from the Controller's SoftAP BSSID MAC address using a nibble-interleave algorithm.  This means each Controller device has a unique SoftAP password that neither requires pre-provisioning nor a label on the hardware.

**Algorithm:** For each index `i` from 0 to 5, take the upper nibble of `BSSID[i]` and the lower nibble of `BSSID[5-i]`, and concatenate as uppercase hex.

| BSSID | Password |
|-------|----------|
| `A1:B2:C3:D4:E5:F6` | `A6B5C4D3E2F1` |

The password is 12 uppercase hex characters (satisfies the WPA2 8-character minimum).  The same algorithm is implemented identically on the client firmware.  The current SoftAP SSID and password are returned in the `GET /api/provisioning` response when provisioning mode is active, so the browser UI can display them if needed.

## Security

:::info Security model
- **WPA2 (CCMP/AES)** encrypts all traffic between the Controller SoftAP and the connected Client, protecting WiFi credentials, MQTT credentials, and all other sensitive payload fields in transit
- **Single-use nonce** prevents replay attacks against the provisioning endpoint
- **SoftAP-only endpoints** — `GET /api/provisioning/nonce` and `GET /api/provisioning/client` reject requests (403) unless they originate from the SoftAP IP address (`192.168.4.1`), preventing Ethernet-connected clients from calling them
- **MAC allowlist** prevents unregistered devices from obtaining any configuration
- **2 dBm TX power** on both Controller and Client limits effective range to 3–5 feet
- **Single-client SoftAP** prevents two devices from provisioning simultaneously
:::

:::warning
The SoftAP password is derived from the BSSID, which is visible to any device performing a WiFi scan.  The algorithm is documented and embedded in the firmware.  Physical proximity is the primary barrier against unauthorized access during provisioning.  Provisioning sessions should be conducted in a controlled environment.
:::

MAC address spoofing remains a theoretical risk: a spoofed MAC will pass the allowlist check at WiFi association time.  However, the attacker would also need to know the correct nonce (freshly generated per session) and call the provisioning/client endpoint within the same session window.

See [API Reference](/controller/software/controller/api_reference.md) for the full endpoint documentation.
