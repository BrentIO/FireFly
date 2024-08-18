# MQTT Auto Discovery Messages for Home Assistant

The integration to Home Assistant is done via MQTT Auto Discovery.  The benefit of Auto Discovery is that no additional software needs to be configured in Home Assistant for it to work.  


Home Assistant Auto Discovery is only provided with the output information, not input message events, like a button press.  However, because the input button press is broadcast over MQTT, the event can be read by other listeners, like Node Red.  This allows Node Red to perform multiple actions not known to the Controller when a button is pressed.  The controller will emit a message on an input port channel state change even if no output actions are defined.

For example, port 7 channel 2 is a normally open input button that is defiend in the controller's configuration file.  It has no output actions associated to the input channel.  When the button is pressed, the controller will raise an MQTT message to a pre-defined topic.  When the button is released, the controller will raise another MQTT message on the same topic.  Home Assistant (and optionally Node Red) can listen for the button press or release MQTT messages to perform multiple actions that are otherwise unknown to the controller, such as turning off all lights in the house, changing the HVAC temperature to a defined setting, and arming the alarm panel to night mode.

> The input port and channel must be configured on the controller for the controller to emit an MQTT message about its state chagne.  If no input is configured in the controller's configuration, the state change will not raise an MQTT message.


## Message Sequence during Boot

During the boot process, the controller will execute the following MQTT actions after making a connection to the broker:
- Controller is added
    - Update
    - Start Time
    - IP Address
- Availability for all controller entites is set to `ONLINE`
- Controller entity states are set to their current values
- Each output is created
    - Availability is set to `ONLINE`
    - State is updated to its current value
    - Command topic is subscribed
- Each input is created
    - Availability is set to `ONLINE`
    - State is updated to its current value


## Retained Messages and Last Will & Testament

Most entities are retrieved from MQTT because of the retained message flag being enabled, with few exceptions.  All outputs retrieve their last known status from MQTT.

In the event the controller loses connectivity, the MQTT Last Will & Testament will set the availability of all entities to unknown and their state to the default value of `OFF`


## Controller

Each controller will be defined as a device and will contain information about the status of the controller.  Examples are below for a controller with a UUID `673be2c4-87cc-41e1-bb4e-96367161b02f` and MAC address `DE:AD:BE:EF:FE:ED`.

### Firmware Updates
Indicates if a firmware update is available.  If so, the firmware update can be launched from MQTT by sending the `payload_install` value to the `command_topic`.

> Note: This does not retain the last value from MQTT.

Topic: 
```text
homeassistant/update/FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f/config
```

Example Payload:
```json
{
    "name": "Update",
    "unique_id": "FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-update",
    "object_id": "FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-update",
    "icon": "mdi:update",
    "device": {
        "identifiers": [
            "673be2c4-87cc-41e1-bb4e-96367161b02f",
            "DE:AD:BE:EF:FE:ED"
        ],
        "name": "FireFly Controller Upstairs",
        "manufacturer": "P5 Software, LLC",
        "model": "FF1235-9901",
        "hw_version": "FF1235-9901",
        "serial_number": "673be2c4-87cc-41e1-bb4e-96367161b02f",
        "sw_version": "2024.8.2",
        "suggested_area": "Tech Room"
    },
    "state_topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/update/state",
    "availability_topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/update/availability",
    "command_topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/update/set",
    "payload_install": "do-update"
}
```

Sample state topic for an update:
```json
{
    "installed_version": "2024.8.2",
    "latest_version":"2024.12.1",
    "title":"App Release 2024.12.1",
    "release_summary":"We added awesome new features!",
    "release_url": "https://github.com/BrentIO/FireFly-Controller/releases/tag/2024.12.1"
}
```


### Start Time

Start Time is the time the controller booted, in epoch seconds.  If NTP isn't available at boot time, the payload is updated when NTP is able to determine the approximate boot time.


Topic: 
```text
homeassistant/sensor/FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-start-time/config
```

Example Payload:
```json
{
    "name": "Start Time",
    "unique_id": "FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-time-start",
    "object_id": "FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-time-start",
    "icon": "mdi:clock",
    "retain": true,
    "entity_category": "diagnostic",
    "device": {
        "identifiers": [
            "673be2c4-87cc-41e1-bb4e-96367161b02f",
            "DE:AD:BE:EF:FE:ED"
        ],
        "name": "FireFly Controller Upstairs",
        "manufacturer": "P5 Software, LLC",
        "model": "FF1235-9901",
        "hw_version": "FF1235-9901",
        "serial_number": "673be2c4-87cc-41e1-bb4e-96367161b02f",
        "sw_version": "2024.8.2",
        "suggested_area": "Tech Room"
    },
    "state_topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/time-start/state",
    "value_template": "{{ ( value | int ) | timestamp_utc }}",
    "availability_topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/time-start/availability"
}
```


### IP Address
Current IP address in dot notation.

Topic: 
```text
homeassistant/sensor/FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-ip-address/config
```

Example Payload:
```json
{
    "name": "IP Address",
    "unique_id": "FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-ip-address",
    "object_id": "FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-ip-address",
    "icon": "mdi:ip",
    "retain": true,
    "entity_category": "diagnostic",
    "device": {
        "identifiers": [
            "673be2c4-87cc-41e1-bb4e-96367161b02f",
            "DE:AD:BE:EF:FE:ED"
        ],
        "name": "FireFly Controller Upstairs",
        "manufacturer": "P5 Software, LLC",
        "model": "FF1235-9901",
        "hw_version": "FF1235-9901",
        "serial_number": "673be2c4-87cc-41e1-bb4e-96367161b02f",
        "sw_version": "2024.8.2",
        "suggested_area": "Tech Room"
    },
    "state_topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/ip-address/state",
    "availability_topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/ip-address/availability"
}
```


### Error Count
The current number of errors in the error log.

> Note: This does not retain the last value from MQTT.

Topic: 
```text
homeassistant/sensor/FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-count-errors/config
```

Example Payload:
```json
{
    "name": "Error Count",
    "unique_id": "FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-count-errors",
    "object_id": "FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-count-errors",
    "icon": "mdi:alert",
    "entity_category": "diagnostic",
    "device": {
        "identifiers": [
            "673be2c4-87cc-41e1-bb4e-96367161b02f",
            "DE:AD:BE:EF:FE:ED"
        ],
        "name": "FireFly Controller Upstairs",
        "manufacturer": "P5 Software, LLC",
        "model": "FF1235-9901",
        "hw_version": "FF1235-9901",
        "serial_number": "673be2c4-87cc-41e1-bb4e-96367161b02f",
        "sw_version": "2024.8.2",
        "suggested_area": "Tech Room"
    },
    "state_topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/count-errors/state",
    "availability_topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/count-errors/availability"
}
```


## Outputs

Each output is defined as a separate device that is linked to the controller using the `via_device` attribute.  Note that the enttiy type is [determined by the icon](#home-assistant-device-types) selected.


### Binary Light

Circuit 999 is a binary light in the kitchen.  The controller's configuration JSON is configured as:
```json
{
    "outputs": {
        "5": {
            "id": "C999",
            "name": "Recessed Lights",
            "area": "Kitchen",
            "icon": "light-recessed"
        }
    }
}
```

Topic: 
```
homeassistant/light/C999/config
```

Payload:
```json
{
    "name": "Recessed Lights",
    "unique_id": "FireFly-C999",
    "object_id": "FireFly-C999",
    "icon": "mdi:light-recessed",
    "retain": true,
    "device": {
        "identifiers": [
            "FireFly-C999"
        ],
        "name": "Recessed Lights C999",
        "model": "DR2220D20U",
        "via_device": "673be2c4-87cc-41e1-bb4e-96367161b02f",
        "suggested_area": "Kitchen"
    },
    "command_topic": "FireFly/C999/set",
    "state_topic": "FireFly/C999/state",
    "availability_topic": "FireFly/C999/availability"
}
```



### Variable Brightness Light

Circuit 888 is a variable brightness light in the bedroom.  The controller's configuration JSON is configured as:
```json
{
    "outputs": {
        "12": {
            "id": "C888",
            "name": "Reading Lights",
            "area": "Bedroom",
            "type": "VARIABLE",
            "icon": "wall-sconce"
        }
    }
}
```

Topic: 
```
homeassistant/light/C888/config
```

Payload:
```json
{
    "name": "Reading Lights",
    "unique_id": "FireFly-C888",
    "object_id": "FireFly-C888",
    "icon": "mdi:wall-sconce",
    "retain": true,
    "on_command_type": "brightness",
    "brightness_scale": 100,
    "device": {
        "identifiers": [
            "FireFly-C888"
        ],
        "name": "Reading Lights C888",
        "model": "PMP2425W",
        "via_device": "673be2c4-87cc-41e1-bb4e-96367161b02f",
        "suggested_area": "Bedroom"
    },
    "command_topic": "FireFly/C888/set",
    "state_topic": "FireFly/C888/state",
    "state_value_template": "{% if value|int > 0 %}ON{% else %}OFF{% endif %}",
    "brightness_command_topic": "FireFly/C888/set",
    "brightness_state_topic": "FireFly/C888/state",
    "availability_topic": "FireFly/C888/availability"
}
```


| Field | Data Source |
| ----- | ----------- |
| `name` | Outputs -> `name` |
| `unqiue_id` | Concatenation of hard-coded "FireFly-" + Outputs -> `id` |
| `object_id` | `unique_id` |
| `device` -> `identifiers` | `unique_id` |
| `device` -> `model` | Linked relay's `model`.  If not set, this field is not populated |
| `device` -> `via_device` | Controller's UUID |
| `device` -> `name` | Concatenation of Outputs -> `name`, single space, and Outputs -> `id` |
| `device` -> `suggested_area` | Outputs -> `area` |
| `icon` | Concatenation of hard-coded "mdi:" + Outputs -> `icon`, which must be a valid MDI icon |
| `on_command_type` | Hard-coded `brightness` when the output `type` = `VARIABLE` |
| `state_value_template` | Hard-coded `{% if value\|int > 0 %}ON{% else %}OFF{% endif %}` when the output `type` = `VARIABLE` |
| `brightness_scale` | Hard-coded `100` when the output `type` = `VARIABLE` |
| Topic names | Concatenation of hard-coded "FireFly/",  Outputs -> `id`, and the topic |


## Home Assistant Device Types
Device types for outputs are determined based on the `icon` defined in the `outputs` section of the controller configuration.  Refer to the chart below for mapping of device types that will be used.

| Icon name contains | Device Type will be |
| ---- | ----------- |
| light | light |
| sconce | light |
| lamp | light |
| fan | fan |
| All else (including `null`) | switch |