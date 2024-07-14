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
| Err parse ports JSON | There was an ArduinoJSON parsing failure when trying to read the controller's `ports` section of the configuration file |
| Err parse outputs JSON | There was an ArduinoJSON parsing failure when trying to read the controller's `outputs` section of the configuration file |
| Err prt `#` > max | The input port number specified in the controller's JSON is greater than the number of ports defined for the controller |
| Err prt `#` ch > max | The number of port channels defined on the port exceed the maximum (typically 4) |
| Err prt `#` < 1 | The port number specified is less than 1 |
| Err out `#` > max | The output number specified in the controller's JSON is greater than the number of outputs defined for the controller |
| Err out `#` < 1 | The output number specified is less than 1 |
| In prt `#` ch `#` inv act | Input port `#` channel `#` has an invalid action and the action will be ignored |