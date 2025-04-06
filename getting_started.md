# What is Project FireFly?

Project FireFly is a lighting control system for the home and small business.  It aims to democratize reliable, high-quality controls at an affordable pricepoint.

Using low-cost Arduino-based microcontrollers, Project FireFly makes software defined lighting controls available to the masses at a comparatively moderate premium to traditional lighting control costs, and a slight premium cost to "smart lighting" controls integrated with existing switches.  Similar commercial applications, while fancier, can add 5-10% to a new project cost compared to traditional lighting controls.  On a $300,000 new house build, that's $15,000 to $30,000...just for lighting controls! 🤯


### Open-Source Hardware and Software

Everything related to Project FireFly is open-source.  We provide the Gerber files to manufacture the hardware or design your own using ours as a reference.  You can also view and modify all of the source code.

We strongly believe that no for-profit company should ever decide they can "stop supporting" or "end of life" your technology in the interest of selling you something slightly newer, but with essentially the same capabilities you already have.

No fees.  Ever.

### Locally-Controlled and Offline Resilient

For over a hundred years, when people have flipped a switch the light just turned on, and it should be just as reliable with a smart lighting control system.  That's why FireFly was built offline-first. *No* Internet requried.  *No* local network required.  *No* home automation required.


### We ❤️ Home Assistant

FireFly was designed from the ground-up to work natively with Home Assistant.  Flash the firmware to the Controller, configure your inputs and outputs using the web interface, and upon reboot everything is added to Home Assistant for you via MQTT!  We took away all the complexity.  Sorry, you'll need to find more weekend projects.


## FireFly Controller and FireFly Client
There are two main hardware components to Project FireFly: the Controller and Client.


### FireFly Controller

FireFly Controller is the heart of the system.  It is the central hub for accepting inputs, usually from a human pushing a physical button.  It is also where all of the outputs connect to [high voltage relays](/controller/hardware/relays).

### FireFly Client <Badge type="tip" text="Coming Soon" />

FireFly Clients are devices that usually replace one or more lightswitches.  A Client can support multiple LED-illuminated buttons for feedback when they are pressed.  They communicate directly with the FireFly controller over a powered Ethernet cable but _do not_ use IP to communicate.