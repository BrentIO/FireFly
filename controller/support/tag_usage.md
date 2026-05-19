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
| Channel | Client subscribes to `FireFly/tag/{tag_name}/set` for each tag assigned to that channel. When a command is received, the LED animates (`snore`, `blink`, `blink-rapid`) or returns to its default brightness (`normal`). See [Configuration: Tags](/controller/software/controller/configuration/tags#how-tags-work-at-runtime) for the full MQTT payload reference. |