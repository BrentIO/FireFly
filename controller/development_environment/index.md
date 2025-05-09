# Controller Development Environment
This guide will explain how to install and configure VSCode for use with arduino-cli. It assumes the Arduino plug-in has already been installed in VSCode.

## Installing and Configuring arduino-cli

Using arduino-cli is more flexible and reliable than the IDE.

### Install Arduino CLI

Instructions are available at https://arduino.github.io/arduino-cli/latest/. Essentially:
```bash
brew update
brew install arduino-cli
```

### Post Installation

Initialize the installation:
```bash
arduino-cli config init
```


Enable unsafe installation so that local zip files can be installed:
```bash
arduino-cli config set library.enable_unsafe_install true
```

### Updating Arduino CLI

To update an existing installation of Arduino CLI:
```bash
brew update
brew upgrade arduino-cli
```


## Installing and Updating ESP Core

### Install

Add the ESP32 board manager packages:
```bash
arduino-cli config set board_manager.additional_urls https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
```

Update the index:
```bash
arduino-cli core update-index
```

Install ESP32 core, version 2.0.11:
```bash
arduino-cli core install esp32:esp32@2.0.11
```

Verify the installation was successful, and optionally remove any other cores:
```bash
arduino-cli core list
```

Expect:


| ID | Installed | Latest | Name |
| --- | --- | --- | --- |
| esp32:esp32 | 2.0.11 | 2.0.11 | esp32 |


### Updating
 Uninstall the current ESP core:
 ```bash
 arduino-cli core uninstall esp32:esp32
 ```

Specify the version number to upgrade the ESP to 2.0.11:
```bash
arduino-cli core install esp32:esp32@2.0.11
```

## Installing and Configuring Libraries
Check the libraries to ensure no libraries are installed:
```bash
arduino-cli lib list
```

Expect:
```
No libraries installed.
```
If there are any installed libraries, uninstall them before proceeding.
  

#### Download required libraries
Download each library below as a zip file or download from GitHub.

| Library | Version | URL |
|---------|---------|-----|
| Adafruit_BusIO | 1.14.1 | https://github.com/adafruit/Adafruit_BusIO |
| Adafruit-GFX-Library | 1.11.5 | https://github.com/adafruit/Adafruit-GFX-Library |
| Adafruit_SSD1306 | 2.5.7 | https://github.com/adafruit/Adafruit_SSD1306 |
| ArduinoJson | 6.21.5 | https://github.com/bblanchon/ArduinoJson |
| ArduinoStreamUtils | 1.9.0 | https://github.com/bblanchon/ArduinoStreamUtils |
| BrentIO_AsyncTCP | 2024.2.1 | https://github.com/BrentIO/AsyncTCP |
| BrentIO_AsyncWebServer_ESP32_W5500 | 2025.5.1 | https://github.com/BrentIO/AsyncWebServer_ESP32_W5500 |
| BrentIO_ESP Async WebServer | 2024.7.1 | https://github.com/BrentIO/ESPAsyncWebServer |
| BrentIO_esp32FOTA | 2025.4.1 | https://github.com/BrentIO/esp32FOTA |
| BrentIO_PCA95x5 | 2023.10.2 | https://github.com/BrentIO/PCA95x5 |
| BrentIO_PCT2075 | 2023.10.3 | https://github.com/BrentIO/PCT2075 |
| BrentIO_PubSubClient | 2025.4.1 | https://github.com/BrentIO/pubsubclient |
| Ethernet | 2.0.2 | https://github.com/arduino-libraries/Ethernet |
| I2C_EEPROM | 1.7.1 | https://github.com/RobTillaart/I2C_EEPROM |
| LinkedList | 1.3.3 | https://github.com/ivanseidel/LinkedList |
| NTPClient | 3.2.1 | https://github.com/arduino-libraries/NTPClient |
| PCA9685_RT | 0.4.1 | https://github.com/RobTillaart/PCA9685_RT |
| Regexp | 0.1.1 | https://github.com/nickgammon/Regexp |

Install each library above using the following command:
```bash
arduino-cli lib install --zip-path /my/downloads/directory/library_name.zip
```

> [!INFO]  
> Versions must also be changed in the GitHub actions.

## Add Symlink for boards.local.txt

The boards.local.txt file must be placed adjacent to the other boards.txt file provided by ESP32 core.

Steps:

1. Close Visual Studio Code

2. Create a symlink adjacent to the main boards file. Example for ESP Core version 2.0.11:
```bash
ln -s ./FireFly-Controller/boards.local.txt ~/Library/Arduino15/packages/esp32/hardware/esp32/2.0.11/boards.local.txt
```

3. Open Visual Studio Code. Select the board labeled `ESP32 Wrover Module` and select the 16MB partition scheme.  This will allow the solution to compile.  However, the partitions will not be respected and may inaccurately reflect the amount of space remaining.

4. For new boards only, ensure the option `Hardware-Registration-and-Configuration` is set to `Enabled`. Subsequent flashes of that chip should be set to `Disabled`.

5. Flash the Hardware-Registration-and-Configuration.ino project.


## Visual Studio IDE Configuration

 To use Visual Studio Code to compile FireFly-Controller, several files must be modified, all of which are located in `/.vscode/`. The folder may be hidden, but the file should be created automatically by VSCode.

### c_cpp_properties.json
No changes should be required for this file, as it is generated automatically.

### settings.json
```json
{
	"arduino.commandPath": "arduino-cli",
	"arduino.useArduinoCli": true,
	"arduino.path": "/usr/local/bin/",
	"arduino.logLevel": "info",
	"arduino.defaultTimestampFormat": "%H:%m:%S.%L "
}
```

### arduino.json
Contents of this file control the data sent to the compiler, and *do not* affect IntelliSense. IntelliSense is updated automatically from the compiler's output.

Example File Contents:
```json
{
	"sketch": "Hardware-Registration-and-Configuration.ino",
	"configuration": "FlashFreq=80,PartitionScheme=default,UploadSpeed=921600,DebugLevel=none,EraseFlash=none",
	"board": "esp32:esp32:firefly_controller",
	"buildPreferences": [
		[
			"build.extra_flags",
			"-DASYNCWEBSERVER_REGEX -DPRODUCT_HEX=0x08062305 -DESP32 -DCORE_DEBUG_LEVEL=3 -DDISABLE_ALL_LIBRARY_WARNINGS -I~/GitHub/P5Software/FireFly-Controller"
		]
	],
	"port": "/dev/tty.SLAB_USBtoUART",
	"output": "../.cache",
	"programmer": "esptool"
}
```

#### board
Defines the custom board configured in the Custom Boards section, above: 
`esp32:esp32:firefly_controller`


#### build.extra_flags
**`ASYNCWEBSERVER_REGEX`** Allows regex paths in the URL.

**`PRODUCT_HEX`** This configuration indicates the hardware product ID expressed as a hexadecimal and is required. If it is not included, the compiler will trigger an error. Change the `0x08062305` value in the example shown above to match the actual hardware product ID, with `0x` prefixed. This allows for a product ID beginning with zero.

**`ESP32`** The hardware type must also be set for the Adafruit libraries to be configured correctly. Use `-DESP32` flag to set the hardware to ESP32. Without it, you can expect to receive errors such as ```fatal error: util/delay.h: No such file or directory```

**`CORE_DEBUG_LEVEL`** To show or quiet the debug outputs.  Additional libraries are slaved to these values in hardware.h:
- `0` = None
- `1` = Error
- `2` = Warn
- `3` = Info
- `4` = Debug
- `5` = Verbose

**`DISABLE_ALL_LIBRARY_WARNINGS`** Will quiet progra messages from the FOTA library.

You must also include the parent directory of FireFly-Controller using the `-I/my/path/to/project/FireFly-Controller` parameter. Note that abbreviated file paths using `~` (for instance, `~/project/FireFly-Controller`) will **not** work properly.

The folder structure should look like this:

```
/my/path/to/project/FireFly-Controller
-> .vscode
-> boards.local.txt
-> Controller
	---> Controller.ino
	---> ...
-> Hardware-Registration-and-Configuration
	---> www
		-----> auxillary_data.json
		-----> ...
	---> Hardware-Registration-and-Configuration.ino

	---> swagger.yaml
	---> ...
-> common
	---> hardware.h
	---> externalEEPROM.h
	---> ...
```

### Troubleshooting

#### Uploads won't work

If the upload function does not work, but the application compiles correctly, re-select the port on the bottom right side of the screen.


## Partitions
FireFly Controller uses  a custom partition, `partitions.csv`, adjacent to the .ino file.

See more information about [partitions](/controller/support/partitions).


#### Flashing `www` partition with 16MB Chip

Size (see table above) = `0x2E0000`.  To create the image:

```bash
~/Library/Arduino15/packages/esp32/tools/mklittlefs/3.0.0-gnu12-dc7f933/mklittlefs -s 0x2E0000 -c ~/GitHub/P5Software/FireFly-Controller/Hardware-Registration-and-Configuration/www ~/GitHub/P5Software/FireFly-Controller/Hardware-Registration-and-Configuration/www.bin
```


Location (see table above) = `0xD10000`.  To flash the image:

```bash
~/Library/Arduino15/packages/esp32/tools/esptool_py/4.5.1/esptool --chip esp32 --port "/dev/tty.SLAB_USBtoUART" --baud 921600 --before default_reset --after hard_reset write_flash -z --flash_mode dio --flash_freq 80m --flash_size 16MB 0xD10000 ~/GitHub/P5Software/FireFly-Controller/Hardware-Registration-and-Configuration/www.bin
```


#### Flashing `config` partition with 16MB Chip

::: danger DATA LOSS MAY OCCUR
This will destory any user-defined configuration!
:::

Size (see table above) = `0x80000`.  To create the image:

```bash
~/Library/Arduino15/packages/esp32/tools/mklittlefs/3.0.0-gnu12-dc7f933/mklittlefs -s 0x80000 -c ~/GitHub/P5Software/FireFly-Controller/Hardware-Registration-and-Configuration/config ~/GitHub/P5Software/FireFly-Controller/Hardware-Registration-and-Configuration/config.bin
```

Location (see table above) = `0xC90000`.  To flash the image:

```bash
~/Library/Arduino15/packages/esp32/tools/esptool_py/4.5.1/esptool --chip esp32 --port "/dev/tty.SLAB_USBtoUART" --baud 921600 --before default_reset --after hard_reset write_flash -z --flash_mode dio --flash_freq 80m --flash_size 16MB 0xC90000 ~/GitHub/P5Software/FireFly-Controller/Hardware-Registration-and-Configuration/config.bin
```

## Adding a new hardware version
Hardware configurationsk are abstracted from the main applications to allow for compilation with minimal hardware-specific design considerations.  Each hardware model is defined in `hardware.h`.

Additionally, the peripheral information must be added to `./www/auxillary_data.json` file.  Adding the product HEX and the product ID to the auxillary_data.json file will add it to the Product ID drop down in the Identification area of the configuration.

## Filter Large JSON documents

The Controller [filters large JSON documents](./configuration_json_filtering.md) in order to conserve memory and protect future upgradeability.