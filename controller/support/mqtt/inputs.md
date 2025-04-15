# Automating with Input Events using MQTT

Unlike with Controller sensors and outputs, button presses are not included in MQTT auto discovery.

However, because the button press is broadcast over MQTT, the event can be read by subscribers such as Home Assistant.  This allows the subscriber to perform multiple actions not known to the Controller when a button changes state, such as setting a lighting scene, turning on a water feature, and starting music.  The Controller will emit a message even if no output actions are defined.

The Client must be configured with the button or switch in order for the Controller to emit an MQTT message about its state change.

## Input Events Topics and Payloads

Below are the four event topics that can be raised by the Controller. Note that Extended Clients will raise events on Channel 5 or Channel 6 if configured.

For all examples below, the Client ID is S17 and the second button is being exercised (Channel 2).  


### Short State Change

Example Topic:
```text
FireFly/inputs/S17/channels/2
```

State Payload:
```text
SHORT
```

### Long State Change
Example Topic:
```text
FireFly/inputs/S17/channels/2
```

State Payload:
```text
LONG
```

:::info 
The transition to `LONG` will be directly after `SHORT`.
:::

### Excessive State Change
Excessive state changes indicate the output is already at its maximum or minimum and further requests are unnecessarily excessive.

Example Topic:
```text
FireFly/inputs/S17/channels/2
```

State Payload:
```text
EXCESSIVE
```

:::info 
`EXCESSIVE` can occur after either `SHORT` or `LONG` events.
:::

### Returned to Normal State
A  normal state indicates the button or switch has returned to its normal state.  For example, if the button is normally open, the button is open. If the button is normally closed, the button has returned to its normal state of being closed.

Example Topic:
```text
FireFly/inputs/S17/channels/2
```

State Payload:
```text
NORMAL
```