# Tag Application and Usage

Tags are designed to help during the configuration process to logically group and segment controllers, clients, inputs, and outputs.  However, the usage of the tag varies by where it is applied.  The chart below explains the application versus production usage of the applied tag.


## Controllers
| Application | Usage |
| ----------- | ----- |
| Controller | None; Tag is not imported from the JSON |
| Port->Channel | None; Tag is not imported from the JSON |
| Outputs | None; Tag is not imported from the JSON |


## Clients
| Application | Usage |
| ----------- | ----- |
| Channel | Client subscribes to the tag and applies the LED brightness based on tag.  For example, when the "SECURITY" tag is broadcast across MQTT, the LED will illuminate, extinguish, or animate |