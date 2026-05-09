# Controller Provisioning

Controller Provisioning allows an unconfigured Controller to automatically receive its full configuration — including all controller and client records — from a source Controller over a short-range WiFi connection at boot time, with no user interaction on the target device.

## Prerequisites

- The target Controller's MAC address must already be registered in the source Controller's configuration. This is done during manufacturing via the Hardware Registration and Configuration application.
- The source Controller must have Provisioning Mode active before the target boots. See [Provisioning Mode](/controller/support/provisioning_mode) for how to enable it.

## Protocol

[![Controller Provisioning Sequence Diagram](./images/controller-provisioning-sequence.svg)](./images/controller-provisioning-sequence.svg)

### Step 1 — Enable Provisioning Mode on Source

Enable Provisioning Mode on the source Controller via the Configurator UI or by calling `PUT /api/provisioning`. The source starts its SoftAP with SSID `FireFly-Provisioning` and a device-unique WPA2 password derived from its BSSID.

### Step 2 — Target Boots and Scans

On boot, the target Controller checks whether its own configuration file exists in its file system. If it does not, the target scans for the exact SSID `FireFly-Provisioning`.

If no matching AP is found, the target continues booting without configuration and will retry on the next reboot.

### Step 3 — Target Derives Password and Connects

The target reads the BSSID from the scan result and computes the WPA2 password using the same nibble-interleave algorithm (see [SoftAP Password](#softap-password) below). It then attempts to connect, with a 10-second timeout.

If the target's MAC address is not in the source's allowlist, the source shuts down the SoftAP and logs a warning. The target continues unprovisioned.

### Step 4 — Nonce Exchange

The target calls `GET /api/provisioning/nonce` to obtain a single-use session nonce.

### Step 5 — Bundle Retrieval

The target calls `GET /api/provisioning/controller` with its own WiFi MAC address in the `mac-address` header and the nonce in the `x-nonce` header. The source validates the nonce, finds the matching controller record, invalidates the nonce, and returns the full provisioning bundle containing all controller and client records.

If no controller record matches the MAC address, the source returns HTTP 404 and the target continues unprovisioned.

### Step 6 — Target Writes Config and Reboots

The target encrypts and writes each controller and client record to its file system, then reboots into normal operating mode.

## SoftAP Password

The WPA2 password is derived deterministically from the source Controller's SoftAP BSSID using the same nibble-interleave algorithm used for client provisioning. See [Provisioning Mode — SoftAP Password](/controller/support/provisioning_mode#softap-password) for the full algorithm description and example.

## Security

:::info Security model
- **WPA2 (CCMP/AES)** encrypts all traffic between the source SoftAP and the connecting target
- **Single-use nonce** prevents replay attacks against the provisioning endpoint
- **SoftAP-only endpoint** — `GET /api/provisioning/controller` rejects requests (403) unless they originate from the SoftAP interface, preventing any Ethernet-connected device from calling it
- **MAC allowlist** — only a target whose MAC address is already registered in the source's configuration can receive a bundle; all others receive HTTP 404
- **Provisioning mode required** — the endpoint returns HTTP 409 if provisioning mode is not active, ensuring the source is never passively serving configuration
- **2 dBm TX power** limits effective range to 3–5 feet, preventing over-the-air interception from a distance
:::

:::warning
The SoftAP password is derived from the BSSID, which is visible to any device performing a WiFi scan. Physical proximity is the primary barrier against unauthorized access during provisioning. Provisioning sessions should be conducted in a controlled environment.
:::

See [API Reference](/controller/software/controller/api_reference.md) for the full `GET /api/provisioning/controller` endpoint documentation.
