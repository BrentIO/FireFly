# FireFly Controller

The hardware consists of a custom PCB with RJ45 inputs that connect to FireFly clients, an Ethernet controller, OLED display, front panel selection button, and outputs.  An ESP32 is the core computing module.  In a typical home, one FireFly Controller should be used per floor; in a small home a single controller may suffice.

FireFly Controller is designed to be operational all by itself.  The "other half" will appreciate this fail-safe, because it's as dependable as what they've used everywhere else:
- ✅ You still have local control of all circuits when your home automation is offline
- ✅ You still have local control of all circuits when your LAN or WiFi is having trouble
- ✅ You still have local control of all circuits when your Internet is offline
- 🚫 May not work during a zombie apocalypse 🧟

## Application Software
FireFly Controller features two applications contained within this repository, the Hardware Registration and Configuration application, and the main Controller application.

## Hardware Registration and Configuration Application
The Hardware Registration and Configuration is for use with new, unprogrammed boards -- essentially factory use.  The application provides both a web interface and underlying API calls used by the web interface.

The application's primary functions are:
- Set the device's [partition scheme](/controller/development_environment#partitions)
- Set the external EEPROM with identity information
- Hardware quality assurance
- Register the hardware with the cloud service for remote backup of configuration data <Badge type="warning" text="TODO" />

## Controller Application
The main application for production use that accepts input from a physical switch and can, optionally, send PWM voltage to an output.  It also supports HTTP <Badge type="warning" text="TODO" /> and MQTT <Badge type="warning" text="TODO" /> for inputs from external sources, such as a home automation system.  Inputs sensed will raise events via MQTT for use in a home automation system.  FireFly Controller is designed to be paired with FireFly Clients.