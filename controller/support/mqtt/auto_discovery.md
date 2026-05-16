# Home Assistant Auto Discovery

The integration to Home Assistant is done via MQTT auto discovery.  The benefit of auto discovery is that no additional software needs to be configured in Home Assistant for it to work.

::: info Why aren't inputs included in auto discovery?
Home Assistant auto discovery is only provided with the output information, not input message events, like a button press.  You can [read more about automating with inputs using MQTT](./inputs).
:::


::: info What does FireFly use for the Home Assistant Auto Discovery topic?
FireFly uses the default topic root of `homeassistant` for auto discovery.  You can configure this inside the MQTT settings.  There is a maximum length of 24 for the topic root.  It should _not_ include a trailing `/`.
:::

## MQTT Message Sequences
During the `setup()` process (and eventually `loop()` process), the controller will execute the following MQTT actions after making a connection to the broker:

[![MQTT Connection](./images/mqtt_connection.svg)](./images/mqtt_connection.svg)

[![MQTT Firmware Update](./images/mqtt_firmware_update.svg)](./images/mqtt_firmware_update.svg)

[![MQTT Temperature Sensors](./images/mqtt_temperature.svg)](./images/mqtt_temperature.svg)

[![MQTT Outputs](./images/mqtt_outputs.svg)](./images/mqtt_outputs.svg)

[![MQTT Diagnostics](./images/mqtt_diagnostics.svg)](./images/mqtt_diagnostics.svg)

[![MQTT Debug](./images/mqtt_debug.svg)](./images/mqtt_debug.svg)


## Retained Messages and Last Will & Testament

Most entities are retrieved from MQTT because of the retained message flag being enabled, with few exceptions.  All outputs retrieve their last known status from MQTT.

In the event the controller loses connectivity, the MQTT Last Will & Testament will set the entities to `Unavailable`.


## Controller

Each controller will be defined as a device and will contain information about the status of the controller.  Examples are below for a controller with a UUID `673be2c4-87cc-41e1-bb4e-96367161b02f`.

### Firmware Updates
Indicates if a firmware update is available.  If so, the firmware update can be launched from MQTT by sending the `payload_install` value to the `command_topic`.

::: info Availability topic is different for this entity
The availability topic is different for the `Firmware Update` entity than for other entities.  For the update entity to not be marked `unavailable`, both the standard controller availability _and_ the update's availability must be `online`.  This allows for the `Firmware Update` entity to indicate if the update availability service is operational.
:::

Example auto discovery topic: 
```text
homeassistant/update/FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-update/config
```

Example auto discovery payload:
```json
{
    "name": "Firmware",
    "unique_id": "FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-update",
    "object_id": "FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-update",
    "icon": "mdi:update",
    "device": {
        "identifiers": [
            "673be2c4-87cc-41e1-bb4e-96367161b02f"
        ],
        "name": "Upstairs",
        "manufacturer": "P5 Software LLC",
        "model": "FireFly Controller",
        "model_id": "FFC0806-2305",
        "serial_number": "673be2c4-87cc-41e1-bb4e-96367161b02f",
        "sw_version": "2025.4.1",
        "suggested_area": "Tech Room"
    },
    "availability": [
        {
            "topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/update/availability"
        },
        {
            "topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/availability"
        }
    ],
    "availability_mode": "all",
    "state_topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/update/state",
    "command_topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/update/set",
    "payload_install": "do-update"
}
```

Example state topic: 
```text
FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/update/state
```

Example state payload for `Update available`:
```json
{
    "installed_version": "2024.8.2",
    "latest_version":"2024.12.1",
    "title":"App Release 2024.12.1",
    "release_summary":"We added awesome new features!",
    "release_url": "https://github.com/BrentIO/FireFly-Controller/releases/tag/2024.12.1",
    "in_progress": false,
    "update_percentage": 0
}
```

Example state payload for `Up-to-date`:
```json
{
    "installed_version": "2024.8.2",
    "latest_version":"2024.8.2",
    "title":"App Release 2024.8.2",
    "release_summary":"An early version that was still awesome!",
    "release_url": "https://github.com/BrentIO/FireFly-Controller/releases/tag/2024.8.2",
    "in_progress": false,
    "update_percentage": 0
}
```

When the device is updating, the `in_progress` will be set to `true` and the `update_percentage` will be updated with the current progress, which will be reflected in Home Assistant UI.

To perform the update:
```text
FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/update/set
```
with payload:
```
do-update
```


### Start Time

Start Time is the time the controller booted, in epoch seconds.  If NTP isn't available at boot time, the payload is updated when NTP is able to determine the approximate boot time.


Example auto discovery topic:
```text
homeassistant/sensor/FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-time-start/config
```

Example auto discovery payload:
```json
{
    "name": "Start Time",
    "unique_id": "FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-time-start",
    "object_id": "FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-time-start",
    "icon": "mdi:clock",
    "entity_category": "diagnostic",
    "device": {
        "identifiers": [
            "673be2c4-87cc-41e1-bb4e-96367161b02f"
        ],
        "name": "Upstairs",
        "manufacturer": "P5 Software LLC",
        "model": "FireFly Controller",
        "model_id": "FFC0806-2305",
        "serial_number": "673be2c4-87cc-41e1-bb4e-96367161b02f",
        "sw_version": "2025.4.1",
        "suggested_area": "Tech Room"
    },
    "state_topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/time-start/state",
    "value_template": "{{ ( value | int ) | timestamp_utc }}",
    "availability_topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/availability"
}
```

Example state topic:
```text
FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/time-start/state
```

Example state payload:
```text
379090920
```


### IP Address

Current IP address in dot notation.

Example auto discovery topic:
```text
homeassistant/sensor/FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-ip-address/config
```

Example auto discovery payload:
```json
{
    "name": "IP Address",
    "unique_id": "FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-ip-address",
    "object_id": "FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-ip-address",
    "icon": "mdi:ip",
    "entity_category": "diagnostic",
    "device": {
        "identifiers": [
            "673be2c4-87cc-41e1-bb4e-96367161b02f"
        ],
        "name": "Upstairs",
        "manufacturer": "P5 Software LLC",
        "model": "FireFly Controller",
        "model_id": "FFC0806-2305",
        "serial_number": "673be2c4-87cc-41e1-bb4e-96367161b02f",
        "sw_version": "2025.4.1",
        "suggested_area": "Tech Room"
    },
    "state_topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/ip-address/state",
    "availability_topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/availability"
}
```

Example state topic:
```text
FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/ip-address/state
```

Example state payload:
```text
192.168.100.20
```


### MAC Address

Current ethernet MAC address in colon notation.

Example auto discovery topic:
```text
homeassistant/sensor/FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-mac-address/config
```

Example auto discovery payload:
```json
{
    "name": "MAC Address",
    "unique_id": "FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-mac-address",
    "object_id": "FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-mac-address",
    "icon": "mdi:ethernet",
    "entity_category": "diagnostic",
    "device": {
        "identifiers": [
            "673be2c4-87cc-41e1-bb4e-96367161b02f"
        ],
        "name": "Upstairs",
        "manufacturer": "P5 Software LLC",
        "model": "FireFly Controller",
        "model_id": "FFC0806-2305",
        "serial_number": "673be2c4-87cc-41e1-bb4e-96367161b02f",
        "sw_version": "2025.4.1",
        "suggested_area": "Tech Room"
    },
    "state_topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/mac-address/state",
    "availability_topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/availability"
}
```

Example state topic:
```text
FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/mac-address/state
```

Example state payload:
```text
DE:AD:BE:EF:FE:ED
```


### Error Count
The current number of errors in the error log.

Example auto discovery topic: 
```text
homeassistant/sensor/FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-count-errors/config
```

Example auto discovery payload:
```json
{
    "name": "Error Count",
    "unique_id": "FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-count-errors",
    "object_id": "FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-count-errors",
    "icon": "mdi:alert",
    "entity_category": "diagnostic",
    "device": {
        "identifiers": [
            "673be2c4-87cc-41e1-bb4e-96367161b02f"
        ],
        "name": "Upstairs",
        "manufacturer": "P5 Software LLC",
        "model": "FireFly Controller",
        "model_id": "FFC0806-2305",
        "serial_number": "673be2c4-87cc-41e1-bb4e-96367161b02f",
        "sw_version": "2025.4.1",
        "suggested_area": "Tech Room"
    },
    "state_topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/count-errors/state",
    "availability_topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/availability"
}
```

Example state topic:
```text
FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/count-errors/state
```

Example state payload:
```text
3
```




### HTTP Server

The HTTP Server switch allows you to enable or disable the built-in HTTP server on the controller.

::: info Auto-disable on inactivity
The HTTP server automatically stops after **300 seconds (5 minutes)** of inactivity. The inactivity timer resets each time the HTTP server responds to a request. Sending `OFF` to the command topic also stops the server immediately.
:::

Example auto discovery topic:
```text
homeassistant/switch/FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-http-server/config
```

Example auto discovery payload:
```json
{
    "name": "HTTP Server",
    "unique_id": "FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-http-server",
    "default_entity_id": "switch.FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-http_server",
    "icon": "mdi:web",
    "device": {
        "identifiers": [
            "673be2c4-87cc-41e1-bb4e-96367161b02f"
        ],
        "name": "Upstairs",
        "manufacturer": "P5 Software LLC",
        "model": "FireFly Controller",
        "model_id": "FFC0806-2305",
        "serial_number": "673be2c4-87cc-41e1-bb4e-96367161b02f",
        "sw_version": "2025.4.1",
        "suggested_area": "Tech Room"
    },
    "state_topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/http-server/state",
    "command_topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/http-server/set",
    "availability_topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/availability",
    "payload_on": "ON",
    "payload_off": "OFF",
    "state_on": "ON",
    "state_off": "OFF"
}
```

Example state topic:
```text
FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/http-server/state
```

Example state payloads:
```text
ON
```
```text
OFF
```

Example command topic:
```text
FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/http-server/set
```

Example command payloads:
```text
ON
```
```text
OFF
```

### Temperature
The current temperature reading from one of the sensors on the controller.  Each sensor is added as its own entry, if the controller features one or more temperature sensors.

Example auto discovery topic for the `Center` temperature sensor:
```text
homeassistant/sensor/FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-temperature-Center/config
```

Example auto discovery payload for the `Center` temperature sensor:
```json
{
    "name": "Center",
    "unique_id": "FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-temperature-Center",
    "object_id": "FireFly-673be2c4-87cc-41e1-bb4e-96367161b02f-temperature-Center",
    "icon": "mdi:thermometer",
    "device_class": "temperature",
    "unit_of_measurement": "°C",
    "device": {
        "identifiers": [
            "673be2c4-87cc-41e1-bb4e-96367161b02f"
        ],
        "name": "Upstairs",
        "manufacturer": "P5 Software LLC",
        "model": "FireFly Controller",
        "model_id": "FFC0806-2305",
        "serial_number": "673be2c4-87cc-41e1-bb4e-96367161b02f",
        "sw_version": "2025.4.1",
        "suggested_area": "Tech Room"
    },
    "state_topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/temperature/Center/state",
    "availability_topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/availability"
}
```

Example state topic for the `Center` temperature sensor:
```text
FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/temperature/Center/state
```

Example state payload:
```text
26.73
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

Example auto discovery topic:
```
homeassistant/light/FireFly-circuits-C999/config
```

Example auto discovery payload:
```json
{
    "name": null,
    "unique_id": "FireFly-C999",
    "object_id": "FireFly-C999",
    "icon": "mdi:light-recessed",
    "state_value_template": "{% if value|int > 0 %}ON{% else %}OFF{% endif %}",
    "device": {
        "identifiers": [
            "FireFly-C999"
        ],
        "name": "Recessed Lights C999",
        "via_device": "673be2c4-87cc-41e1-bb4e-96367161b02f",
        "suggested_area": "Kitchen"
    },
    "command_topic": "FireFly/circuits/C999/set",
    "state_topic": "FireFly/circuits/C999/state",
    "availability_topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/availability"
}
```

Example state topic:
```text
FireFly/circuits/C999/state
```

Example state payload:
```text
ON
```

Example state payload:
```text
OFF
```

Example command topic:
```text
FireFly/circuits/C999/set
```

Example command payload:
```text
ON
```

Example command payload:
```text
OFF
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

Example auto discovery topic:
```
homeassistant/light/FireFly-circuits-C888/config
```

Example auto discovery payload:
```json
{
    "name": null,
    "unique_id": "FireFly-C888",
    "object_id": "FireFly-C888",
    "icon": "mdi:wall-sconce",
    "on_command_type": "brightness",
    "brightness_scale": 100,
    "brightness_command_topic": "FireFly/circuits/C888/set",
    "brightness_state_topic": "FireFly/circuits/C888/state",
    "state_value_template": "{% if value|int > 0 %}ON{% else %}OFF{% endif %}",
    "device": {
        "identifiers": [
            "FireFly-C888"
        ],
        "name": "Reading Lights C888",
        "via_device": "673be2c4-87cc-41e1-bb4e-96367161b02f",
        "suggested_area": "Bedroom"
    },
    "state_topic": "FireFly/circuits/C888/state",
    "command_topic": "FireFly/circuits/C888/set",
    "availability_topic": "FireFly/673be2c4-87cc-41e1-bb4e-96367161b02f/availability"
}
```

Example state topic:
```text
FireFly/circuits/C888/state
```

Example state payload:
```text
25
```

Example state payload:
```text
0
```

Example command topic:
```text
FireFly/circuits/C888/set
```

Example command payload:
```text
25
```

Example command payload:
```text
OFF
```


### Output Auto Discovery Field Mapping

> Note: If not set in the controller's configuration JSON, the field is not sent to MQTT


| Field | Data Source |
| ----- | ----------- |
| `name` | `null`, hard-coded |
| `unqiue_id` | Concatenation of hard-coded "FireFly-" + Outputs -> `id` |
| `object_id` | `unique_id` |
| `device` -> `identifiers` | `unique_id` |
| `device` -> `via_device` | Controller's UUID |
| `device` -> `name` | Outputs -> `name`|
| `device` -> `suggested_area` | Outputs -> `area` |
| `icon` | Concatenation of hard-coded "mdi:" + Outputs -> `icon`, which must be a valid MDI icon |
| `on_command_type` | Hard-coded `brightness` when the output `type` = `VARIABLE` |
| `state_value_template` | Hard-coded `{% if value\|int > 0 %}ON{% else %}OFF{% endif %}` when the output `type` = `VARIABLE` |
| `brightness_scale` | Hard-coded `100` when the output `type` = `VARIABLE` |
| Topic names | Concatenation of hard-coded "FireFly/circuits/",  Outputs -> `id` |


## Home Assistant Device Types
Device types for outputs are determined based on the `icon` defined in the `outputs` section of the controller configuration.  Refer to the chart below for mapping of device types that will be used.

| Icon name contains | Device Type will be |
| ---- | ----------- |
| light | light |
| sconce | light |
| lamp | light |
| fan | fan |
| All else (including `null`) | switch |