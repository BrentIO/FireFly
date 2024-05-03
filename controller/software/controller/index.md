# Controller

The Controller software is the application which runs on the controller hardware for production use.

## :white_check_mark: What this application does
- <Badge type="warning" text="TODO" /> Sets up an HTTP server using the on-board Ethernet or WiFi (depending on hardware compile options)
- <Badge type="warning" text="TODO" /> Sets up the [OLED display](/controller/support/OLED_screens/) (where supported by the hardware) to display basic information and provide a user interface button
- <Badge type="warning" text="TODO" /> Configures the user-programmable logic for high voltage switching
- <Badge type="warning" text="TODO" /> Exposes the port and channel configuration
- <Badge type="warning" text="TODO" /> Executes actions based on inputs from physical buttons or API/MQTT requests

## :no_entry_sign: What this application does not do
- Configure device identity.  See [Hardware Registration and Configuration](/controller/software/hardware_registration_and_configuration/).