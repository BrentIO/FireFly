# Provisioning Mode

Provisioning Mode allows unprovisioned Clients to connect to a Controller via WiFi.  Enabling Provisioning Mode may take several seconds to enable the Controller's on-board WiFi radio and to prepare the Controller with the list of approved Clients that can connect to the WiFi access point.  Likewise, disabling Provisioning Mode will take a second or two in order to disconnect the clients and disable the soft access point on the Controller.

Only one Controller should have Provisioning Mode active at any given time.

When enabled, the Controller will broadcast a WiFi SSID of `FireFly-Provisioning` without security.

Provisioning Mode will be enabled for a maximum of 30 minutes until it is disabled (as set at compile time with the parameter `PROVISIONING_MODE_TTL`).

## Security

:::danger There is minimal security with Provisioning Mode
- Data sent over WiFi is not encrypted
- Sensitive data is shared in Provisioning Mode, including URL's, usernames, passwords, and WiFi credentials
:::

Provisioning Mode uses MAC addresses to validate connectivity to the Controller's WiFi access point.  If an unknown MAC address attempts to connect, Provisioning Mode will be turned off automatically by the Controller and a warning message is displayed on the OLED.

If a MAC address is spoofed, the device will be allowed to Connect, however the user will still need to know the UUID of the matching device that is being spoofed.  MAC address `ff:ff:ff:ff:ff:ff` is _not_ added to the "Allow List" when Provisioning Mode is enabled.

During Provisioning Mode, all endpoints are available (and secured), but certain endpoints available by simply passing a header `mac-address` with the value of the Client's MAC address (see [API Reference](/controller/software/controller/api_reference.md)).  If an invalid MAC address is passed, Provisioning Mode will be turned off automatically by the Controller and a warning message is displayed on the OLED.