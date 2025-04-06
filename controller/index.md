# FireFly Controller

## Hardware

The hardware consists of a custom PCB with RJ45 inputs that connect to FireFly Clients, an Ethernet network controller to communicate with other devices on your network, an OLED display, front panel selection button, and output ports.  An ESP32 is the core computing module.

In a typical home, one FireFly Controller should be used per floor; in a small home a single controller may suffice.

FireFly Controller is designed to be operational all by itself.  Others in your household will appreciate this fail-safe, because it's as dependable as what they've used everywhere else:
- ✅ You still have local control of all circuits when your home automation is offline
- ✅ You still have local control of all circuits when your LAN or WiFi is having trouble
- ✅ You still have local control of all circuits when your Internet is offline
- ✅ There is no dependency for any cloud-based service that can be deprecated or charged a fee
- 🚫 May not work during a zombie apocalypse 🧟


## Software

FireFly Controller features two applications contained within this repository, the Hardware Registration and Configuration application, and the main Controller application.

### Hardware Registration and Configuration Application

The [Hardware Registration and Configuration](/controller/software/hardware_registration_and_configuration/) is for use with new, unprogrammed boards -- essentially factory use.  The application provides both a web interface and underlying API calls used by the web interface.  You only need to use this application once after the board is manufactured.

### Controller Application

This is the main application for production use that accepts input from a physical switch or button.  It can be programmed to perform one or more actions based on an input, such as toggling a light on or off.  It also supports MQTT for inputs from external sources, such as a home automation system, to toggle lighting or to increase or decrease its brightness.