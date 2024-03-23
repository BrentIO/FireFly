# What is Project FireFly?

Project FireFly is a lighting control system for the home and small business.  It aims to democratize reliable, high-quality controls at an affordable pricepoint.  There are two main components to Project FireFly: the controller and client.

Using low-cost Arduino-based microcontrollers, Project FireFly makes software defined lighting controls available to the masses at a moderate premium cost to traditional lighting controls, and a slight premium cost to "smart lighting" controls integrated with existing switches.  Similar commercial applications, while fancier, can add 5-10% to a new project cost compared to traditional lighting controls.  On a $300,000 new house build, that's $15,000 to $30,000...just for lighting controls! 🤯

**Open-Source Hardware**
Project FireFly uses open-source hardware to build it yourself, manufacture it to spec, or design your own using ours as a reference.

**Open-Source, Locally-Controlled Software**
No for-profit company should ever decide they can "stop supporting" or "end of life" your technology in the interest of selling you something slightly newer, but with essentially the same capabilities you already have.  Sending data to _their_ cloud costs money and is unnecessary.

**Native API's**
HTTP and MQTT work right out of the box, so you can integrate lighting controls to almost any other system imaginable.  What's more is that state of health and configuration are all on-board -- no apps to install.

**We ❤️ Home Assistant**
FireFly was designed from the ground-up to work with Home Assistant and can be easily integrated into other home automation systems.  From self discovery <Badge type="warning" text="TODO" /> to daily operation via MQTT <Badge type="warning" text="TODO" />, you can make your lighting controls work 100% locally.

## FireFly Controller
FireFly Controller is the heart of the system.  It is the central hub for accepting inputs -- from a human touching a button to an automation signaling a change is necessary -- and processing outputs to the [high voltage relays](/controller/hardware/relays) that make our lives more enjoyable.


## FireFly Client <Badge type="tip" text="Coming Soon" />
FireFly Clients are devices that usually replace one or more lightswitches.  A Client can support multiple LED-illuminated buttons for feedback when they are pressed.  They communicate directly with the FireFly controller over Category 5 or Category 6 Ethernet cable but _do not_ use IP to communicate.  Clients connect to MQTT via WiFi and subscribe to certain messages to know when to provide visual feedback of a button press.  Because a blinking LED isn't essential to use the system, they still function even during those offline moments.

