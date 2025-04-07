# Configuration

To configure the Controller, open a browser and go to the Controller's IP address.  You will be greeted with a web user interface.

::: warning Configurations are Stored in the Browser
All configurations are stored within your device's browser, and are limited to the IP (or domain name) where the configurations were made.  When you are done making configuration changes, it is recommended to either deploy the configuration changes or export the configuation to your device in the event the IP address changes.
:::


## The System is Flexible
Even if you don't know every detail, you should start configuring with what you do know and continue to refine it.  The system is extremely flexible.  Not sure how many Controllers you need, or what the MAC address is of a Client?  Doesn't matter.  Create it anyway.  You can go back and edit the fields later with the real data.

One exception is that the controller model **cannot be changed** once set.  Be sure to select the correct Controller model prior to configuring.


## Getting Started
There is a (rough) sequence that must be followed in order to configure FireFly Controller:
1. Add at least one breaker
2. Add [areas](./areas.md) that are specific to your location
3.  Add [icons](./icons.md) that are needed
4.  Although probably not necessary, add [colors](./colors.md) if you have any special button colors
5. Circuits must be assigned to an output prior to 



## Troubleshooting

| Problem | Solution |
| ------ | --------- |
| Configuration changes I made, but did not push, were lost and the website is blank. | Configurations are stored in your device's browser.  Only when you deploy a configuration are the changes written to the devices.  Use the same Controller IP, or export the configuration before closing the browser window. |
| I am unable to assign circuits to outputs or clients to inputs on my Android tablet | As of Chrome 134, Android does not have the ability to drag-and-drop, which limits your ability to make circuit and Client assignments.  Use a different device or browser. |