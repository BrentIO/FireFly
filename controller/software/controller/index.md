# Controller

The Controller software is the application which runs on the Controller hardware for production use.  It monitors inputs and will perform defined actions (if any) to outputs.

## Network Connectivity
All network connectivity is expected to be over Ethernet.  For security reasons, WiFi is not permitted for production use, except when [Provisioning Mode](/controller/software/controller/provisioning_mode.md) is active.


## :white_check_mark: What this application does
- Sets up an HTTP server using the on-board Ethernet
- Sets up the [OLED display](/controller/support/OLED_screens/) (where supported by the hardware) to display basic information and provide a user interface button
- Exposes a web interface for configuring inputs, outputs, and actions
- Communicates input and output statuses over MQTT
- Accepts output changes over MQTT


## :no_entry_sign: What this application does not do
- Configure device identity.  See [Hardware Registration and Configuration](/controller/software/hardware_registration_and_configuration/).