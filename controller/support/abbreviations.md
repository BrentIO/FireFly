# OLED and Event Log Abbreviations
Abbreviations that can be found in the event log or error display are documented here.

| Abbreviation | Meaning |
| ------------ | ------- |
| Inpt ctl | Input controller |
| Out ctl | Output controller |
| Temp sen | Temperature sensor |
| No I/O setup (EEPROM) | I/O cannot be configured because the EEPROM UUID is empty |
| No I/O file to read | I/O cannot be configured because there is no file matching the controller's UUID in ConfigFS |
| No I/O ConfigFS offline | ConfigFS is not mounted |
| In parse err `error` | There was an ArduinoJSON parsing failure when trying to read the controller's `ports` section of the configuration file with `error` specified |
| In prt `#` > max | The input port number specified in the controller's JSON is greater than the number of ports defined for the controller |
| In prt `#` ch > max | The number of port channels defined on the port exceed the maximum (typically 4) |
| In prt `#` < 1 | The input port number specified is less than 1 |
| In prt `#` ch `#` inv act | Input port `#` channel `#` has an invalid action and the action will be ignored |
| Out prt `#` > max | The output number specified in the controller's JSON is greater than the number of outputs defined for the controller |
| Out prt `#` < 1 | The output number specified is less than 1 |
| Out prt `#` no id | The output number specified is missing the required `id` field in the JSON configuration |
| Out parse err `error`| There was an ArduinoJSON parsing failure when trying to read the controller's `outputs` section of the configuration file with `error` specified |
| MQTT conn timeout | MQTT connection timeout |
| MQTT conn lost | MQTT connection lost |
| MQTT conn fail | MQTT connection failed |
| MQTT conn disconnect | MQTT connection disconnected |
| MQTT bad creds | MQTT bad credentials |
| !RC `MAC address` | A rogue client with `MAC address` attempted to connect during provisioning mode |
| MQTT obj missing | An `mqtt` object is missing from the controller's configuration JSON |
| MQTT `entity` missing | The configuration is missing the `entity` (host, user, or password) that is required |
| OTA parse err `error` | There was an error while trying to parse the controller's configuration for OTA configuration; OTA will not be enabled |
| OTA cfg no url | The URL field is missing from the OTA object on the controller's configuration; OTA will not be enabled |
| OTA cfg no cert | The controller's OTA configuration uses HTTPS but the certificate field is missing from the controller's configuration; OTA will not be enabled |
| OTA cfg inv proto | The protocol specified in the controller's OTA configuration does not start with either http or https |
| Err mkdir certs | The certificates directory does not exist on the config partition and it could not be created |
| Err mkdir ctlrs | The controllers directory does not exist on the config partition and it could not be created |
| Err mkdir clients | The clients directory does not exist on the config partition and it could not be created |