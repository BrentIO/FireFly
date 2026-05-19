# Configuration: Tags

Tags are arbitrary labels that can be applied to a HID input channel on a Client.  They allow any MQTT publisher — such as Home Assistant — to address a *group* of HID LEDs by tag name, without needing to know which specific clients or channels are involved.  For example, publishing a `blink` command to `FireFly/tag/Security/set` will cause every LED on every Client that has the `Security` tag to blink continuously.

Tags can be up to 20 characters in length, per the [API Documentation](/controller/software/controller/api_reference).  Multiple tags can be applied to a [button or switch](/controller/software/controller/configuration/clients).

[![Tags](./tags.png)](./tags.png)

## How Tags Work at Runtime

The Controller assigns tags during configuration but plays no role in tag events at runtime — it does not publish to or subscribe from tag topics.

When a Client boots and connects to MQTT, it reads the tag assignments from its configuration and subscribes to one topic per unique tag:

```
FireFly/tag/{tag_name}/set
```

Any MQTT publisher can then send a command to that topic to control all LEDs carrying that tag simultaneously.

## MQTT Command

**Topic:** `FireFly/tag/{tag_name}/set`

**Payload:**
```json
{ "state": "blink", "brightness": 100 }
```

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `state` | string | Yes | One of `snore`, `blink`, `blink-rapid`, `normal` |
| `brightness` | integer (0–100) | No | Brightness level during the animation. If omitted, the channel's default brightness is used. |

### States

All animation states run continuously until a subsequent command changes the state.

| State | Behavior |
| ----- | -------- |
| `snore` | Slow continuous pulse |
| `blink` | Standard continuous blink |
| `blink-rapid` | Fast continuous blink |
| `normal` | Stop animation and restore the LED to its default brightness |

`normal` ignores the `brightness` field.  To turn LEDs off without a dedicated off state, send `{"state": "blink", "brightness": 0}`.

::: info Implementation status
Tag MQTT subscription is tracked in [FireFly-Client #54](https://github.com/BrentIO/FireFly-Client/issues/54).
:::
