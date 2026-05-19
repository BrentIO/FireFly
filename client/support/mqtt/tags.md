# Automating with Tag Commands using MQTT

Tags are labels assigned to HID input channels in the Controller configuration.  At runtime any MQTT publisher — such as Home Assistant — can send a command to a tag topic to control the LEDs on every Client channel carrying that tag simultaneously.  The Controller plays no active role at runtime; it assigns tags during configuration but does not publish to or subscribe from tag topics.

On every MQTT connect (and reconnect), the Client reads its configuration, collects the unique tags across all configured HID channels, and subscribes to one topic per tag:

```
FireFly/tag/{tag_name}/set
```

::: info Topic casing
Tag names in MQTT topic paths are **lowercase** regardless of how the tag was entered in the Configurator.  For example, a tag named `Security` subscribes as `firefly/tag/security/set`.
:::


## Payload

```json
{ "state": "blink", "brightness": 75 }
```

| Field | Type | Required | Description |
|---|---|---|---|
| `state` | string | Yes | Animation state to apply. See [States](#states) below. |
| `brightness` | integer (0–100) | No | LED brightness during the animation. Omit to use each channel's configured `defaultBrightness`. |


## States

All animation states run **continuously** until a subsequent command changes them.

| State | Behavior |
|---|---|
| `snore` | Smooth continuous pulse (slow fade in and out) |
| `blink` | Hard on/off at 750 ms intervals |
| `blink-rapid` | Hard on/off at 375 ms intervals |
| `normal` | Cancels any active animation; restores the LED to the channel's `defaultBrightness` |

::: info
`normal` ignores the `brightness` field.  There is no dedicated `off` state — to turn LEDs off, send `{"state":"blink","brightness":0}`.
:::


## MQTT Message Sequence

[![MQTT Tag Command](./images/tags_mqtt.svg)](./images/tags_mqtt.svg)


## Full Specification

For the complete topic structure, payload schemas, and field-level documentation see the [MQTT Reference](/client/software/client/mqtt_reference).
