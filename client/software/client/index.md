# Client Application

The Client software is the application which runs on the Client hardware for production use.  It controls human interface device (HID) LEDs in response to input events from the Controller and communicates device status over MQTT.

## Network Connectivity

All network connectivity is over WiFi.  WiFi credentials are configured during [Provisioning Mode](/client/provisioning/).


## :white_check_mark: What this application does

- Connects to the configured WiFi network and MQTT broker
- Subscribes to input channel state events from the Controller and adjusts the corresponding LEDs:
  - `NORMAL` — restores the LED to its retained brightness (button at rest or released)
  - `SHORT` — turns the LED off for the duration of the press
  - `LONG` — turns the LED off while held
  - `EXCESSIVE` — flashes the LED three times at 100 ms on / 100 ms off, then restores retained brightness
- Accepts LED brightness commands over MQTT and persists the brightness level across button events
- Publishes device telemetry and [Home Assistant auto-discovery](/client/support/mqtt/auto_discovery) payloads over MQTT on connect
- Handles CA certificate rotation broadcasts and updates the stored certificate without rebooting
- Periodically checks for OTA firmware updates and performs them on demand


## :no_entry_sign: What this application does not do

- Configure device identity — see [Hardware Registration and Configuration](/client/hardware_registration/)
- Configure WiFi credentials, MQTT settings, or OTA URL — see [Provisioning Mode](/client/provisioning/)
