# OLED and Event Log Abbreviations
Abbreviations that can be found in the event log or error display are documented here. Entries are sorted alphabetically by abbreviation.

| Abbreviation | Meaning |
| ------------ | ------- |
| !RC `MAC address` | A rogue client with `MAC address` attempted to connect during provisioning mode |
| App/UI ver mismatch | The application name, version, or commit hash of the UI (web interface) stored in the `ui` partition does not match the running firmware |
| Backup auth fail | Configuration backup upload was rejected due to an authentication failure |
| Backup enc fail | Configuration backup encryption failed |
| Backup upload start | A configuration backup upload has begun |
| Backup uploaded | Configuration backup was uploaded successfully |
| Client decrypt fail | A client configuration file on ConfigFS could not be decrypted; this typically means the file is corrupted or the eFuse master key does not match. The affected client will be skipped during provisioning scans |
| Config decrypt fail | A controller configuration file on ConfigFS could not be decrypted; this typically means the file is corrupted, was written by a different device, or the eFuse master key does not match. The affected function (I/O setup, MQTT, OTA, etc.) will not be configured |
| configFS mount fail | The `config` LittleFS partition could not be mounted; configuration reads and writes will fail |
| Ctlr decrypt fail | A controller configuration file on ConfigFS could not be decrypted |
| Enc init fail | File encryption initialization failed; the HKDF key derivation or AES context setup failed after reading the eFuse master secret. This indicates a firmware or eFuse provisioning problem. All configuration reads and writes will fail until the device is re-provisioned and rebooted |
| Err mkdir certs | The certificates directory does not exist on the config partition and it could not be created |
| Err mkdir clients | The clients directory does not exist on the config partition and it could not be created |
| Err mkdir ctlrs | The controllers directory does not exist on the config partition and it could not be created |
| Ethernet connected | Ethernet link is up |
| Ethernet disconnected | Ethernet link has gone down |
| Event log started | Informational — event log subsystem initialized successfully at boot |
| Factory reset done | Factory reset completed successfully |
| HTTP server started | The async HTTP server started successfully |
| HTTP server stopped | The async HTTP server has stopped |
| I/O setup read fail | The device's I/O configuration file could not be read or parsed |
| I/O setup read OK | The device's I/O configuration file was read and parsed successfully |
| In parse err `error` | There was an ArduinoJSON parsing failure when trying to read the controller's `ports` section of the configuration file with `error` specified |
| In prt `#` < 1 | The input port number specified is less than 1 |
| In prt `#` > max | The input port number specified in the controller's JSON is greater than the number of ports defined for the controller |
| In prt `#` ch `#` inv act | Input port `#` channel `#` has an invalid action and the action will be ignored |
| In prt `#` ch > max | The number of port channels defined on the port exceed the maximum (typically 4) |
| Inpt ctl | Input controller |
| MQTT bad creds | MQTT bad credentials |
| MQTT conn disconnect | MQTT connection disconnected |
| MQTT conn fail | MQTT connection failed |
| MQTT conn lost | MQTT connection lost |
| MQTT conn timeout | MQTT connection timeout |
| MQTT connected | MQTT broker connection established |
| MQTT disconnected | MQTT broker connection lost |
| MQTT `entity` missing | The configuration is missing the `entity` (host, user, or password) that is required |
| MQTT obj missing | An `mqtt` object is missing from the controller's configuration JSON |
| No cfg, scanning AP | No network configuration found; the device is scanning for a provisioning access point |
| No I/O ConfigFS offline | ConfigFS is not mounted |
| No I/O file to read | I/O cannot be configured because there is no file matching the controller's UUID in ConfigFS |
| No I/O setup (eFuse) | I/O cannot be configured because the device identity UUID is not provisioned in eFuse |
| No PSRAM found | The device did not detect PSRAM at startup; memory-intensive operations may fail |
| OTA app failed | The OTA application firmware update failed |
| OTA app update started | An OTA update of the application firmware has begun |
| OTA cfg inv proto | The protocol specified in the controller's OTA configuration does not start with either http or https |
| OTA cfg no cert | The controller's OTA configuration uses HTTPS but the certificate field is missing from the controller's configuration; OTA will not be enabled |
| OTA cfg no url | The URL field is missing from the OTA object on the controller's configuration; OTA will not be enabled |
| OTA firmware checked | OTA manifest was fetched and evaluated; no update was needed |
| OTA parse err `error` | There was an error while trying to parse the controller's configuration for OTA configuration; OTA will not be enabled |
| OTA ui failed | The OTA `ui` partition update failed |
| OTA ui finished | The OTA `ui` partition update completed successfully |
| OTA ui update started | An OTA update of the `ui` partition has begun |
| OTA update available | An OTA update is available |
| OTA update enabled | OTA updates have been enabled |
| Out ctl | Output controller |
| Out parse err `error` | There was an ArduinoJSON parsing failure when trying to read the controller's `outputs` section of the configuration file with `error` specified |
| Out prt `#` < 1 | The output number specified is less than 1 |
| Out prt `#` > max | The output number specified in the controller's JSON is greater than the number of outputs defined for the controller |
| Out prt `#` no id | The output number specified is missing the required `id` field in the JSON configuration |
| Prov cfg written | A provisioning configuration was successfully written to ConfigFS |
| Prov client write fail | Failed to write a client configuration file during provisioning |
| Prov ctlr write fail | Failed to write a controller configuration file during provisioning |
| Provisioning active | The device has entered provisioning mode |
| Provisioning inactive | The device has exited provisioning mode |
| Rebooting... | Device is about to reboot |
| Release button now | Informational — displayed during factory reset sequence prompting the user to release the button |
| Temp sen | Temperature sensor |
| uiFS mount fail | The `ui` LittleFS partition could not be mounted; the web UI will not be served until a valid `ui.bin` is flashed |

## Hardware Registration and Configuration

The following abbreviations are specific to the Hardware Registration and Configuration firmware.

| Abbreviation | Meaning |
| ------------ | ------- |
| Cloud reg check | Hardware Registration and Configuration attempted to verify cloud registration status at boot |
| Cloud reg fail | Cloud registration or verification request failed; cloud may be unreachable, key invalid, or returned an unexpected error |
| Cloud reg sig vf fail | Cloud registration signature verification failure — the cloud rejected the device's authentication signature during the periodic registration check |
| Cloud registered | Device confirmed as registered with FireFly-Cloud |
| Firmware list failed | Failed to fetch the available firmware list from FireFly-Cloud |
| Firmware list fetched | Successfully fetched the available firmware list from FireFly-Cloud |
| OTA app finished, rebooting... | The OTA application firmware update completed; device is rebooting |
| Web server started | The Hardware Registration and Configuration web server started successfully |
| Wrote device identity | Device identity was successfully written to NVS |
