# Controller Development Environment
This guide covers core information about local testing for development.  Production and test builds are built using GitHub actions.

## Dockerfile for ACT

The Dockerfile is maintained in the FireFly-Controller repository at [`.act/dockerfile`](https://github.com/BrentIO/FireFly-Controller/blob/main/.act/dockerfile). Build the image from the **repo root** (not from `.act/`) so that `libraries.yaml` is available in the build context:

Usage for Intel CPU: 
```bash
docker build --no-cache --platform=linux/amd64 -t act-arduino-ubuntu-24-04:latest -f .act/dockerfile .
```

Usage for Apple Silicon: 
```bash
docker build --no-cache --platform=linux/arm64 -t act-arduino-ubuntu-24-04:latest -f .act/dockerfile .
```

## Configure ACT for Visual Studio Code

To run the ACT docker image through Visual Studio Code, use [GitHub Local Actions](https://marketplace.visualstudio.com/items?itemName=SanjulaGanepola.github-local-actions) plug-in for Visual Studio.  The following settings must be applied:

| Section | Setting | Value | Notes |
| ------- | ------- | ----- | ----- |
| Runners | ubuntu-24.04 | `act-arduino-ubuntu-24-04` | |
| Options | artifact-server-path | `./artifacts` | |
| Options | pull | `false` | |
| Options | container-architecture | `linux/arm64` | For Apple Silicon only |
| Options | container-architecture | `linux/amd64` | For Apple Intel chips |

## Core Versions
The following ESP32 Arduino core version is used with this solution. This version is configured in [`libraries.yaml`](https://github.com/BrentIO/FireFly-Controller/blob/main/libraries.yaml) in the FireFly-Controller repository and is automatically updated on each production build.

<!-- CORE-TABLE-START -->
| Core | Version |
| ---- | ------- |
| [esp32:esp32](https://github.com/espressif/arduino-esp32) | 3.3.10 |
<!-- CORE-TABLE-END -->

## Library Versions
The following library versions are used with this solution. This table is automatically updated on each production build from [`libraries.yaml`](https://github.com/BrentIO/FireFly-Controller/blob/main/libraries.yaml) in the FireFly-Controller repository.

<!-- LIBRARY-TABLE-START -->
| Library | Version |
| ------- | ------- |
| [Adafruit-GFX-Library](https://github.com/adafruit/Adafruit-GFX-Library) | 1.12.6 |
| [Adafruit_BusIO](https://github.com/adafruit/Adafruit_BusIO) | 1.17.4 |
| [Adafruit_SSD1306](https://github.com/adafruit/Adafruit_SSD1306) | 2.5.17 |
| [ArduinoJson](https://github.com/bblanchon/ArduinoJson) | v7.4.3 |
| [ArduinoStreamUtils](https://github.com/bblanchon/ArduinoStreamUtils) | v1.9.2 |
| [AsyncTCP](https://github.com/ESP32Async/AsyncTCP) | v3.4.10 |
| [BrentIO_PCA95x5](https://github.com/BrentIO/PCA95x5) | 2023.10.2 |
| [BrentIO_PCT2075](https://github.com/BrentIO/PCT2075) | 2023.10.3 |
| [BrentIO_esp32OTA](https://github.com/BrentIO/esp32OTA) | 2026.06.01 |
| [ESPAsyncWebServer](https://github.com/ESP32Async/ESPAsyncWebServer) | v3.11.1 |
| [Ethernet](https://github.com/arduino-libraries/Ethernet) | 2.0.2 |
| [LinkedList](https://github.com/ivanseidel/LinkedList) | v1.3.3 |
| [NTPClient](https://github.com/arduino-libraries/NTPClient) | 3.2.1 |
| [PCA9685_RT](https://github.com/RobTillaart/PCA9685_RT) | 0.7.3 |
| [Regexp](https://github.com/nickgammon/Regexp) | 0.1.1 |
| [TBPubSubClient](https://github.com/thingsboard/pubsubclient) | v2.12.1 |
<!-- LIBRARY-TABLE-END -->

## Symlink for boards.local.txt

The `boards.local.txt` file must be placed adjacent to the other `boards.txt` file provided by the ESP32 core. It is generated from `boards.local.txt.template` at CI build time, but for local development you must create it manually first.

1. Generate `boards.local.txt` from the template, substituting the bootloader address and app partition size for your target hardware (values are in `devices.yaml`):
```bash
sed \
  -e "s|{{BOOTLOADER_ADDR}}|0x1000|g" \
  -e "s|{{APP_PARTITION_MAX_SIZE}}|6553600|g" \
  ./FireFly-Controller/boards.local.txt.template \
  > ./FireFly-Controller/boards.local.txt
```

2. Create a symlink adjacent to the main boards file, substituting the current core version from [Core Versions](#core-versions) above:
```bash
ln -s ./FireFly-Controller/boards.local.txt ~/Library/Arduino15/packages/esp32/hardware/esp32/<VERSION>/boards.local.txt
```


## Compile Flags

The following flags must be passed to the compiler regardless of build method (CI or local):

**`ASYNCWEBSERVER_REGEX`** Enables regex path matching in the async web server. Required for the URL routing patterns used throughout the application; must be set as a compile flag (not just a header define) so the library's own source files are also compiled with regex support enabled.

**`PRODUCT_HEX`** The hardware product ID expressed as a hexadecimal. Required — the compiler will error if omitted. Use the `0x`-prefixed value from `devices.yaml` for the target hardware (e.g. `-DPRODUCT_HEX=0x08062305`).

**`ESP32`** Required for Adafruit libraries to configure correctly. Without it, expect errors such as `fatal error: util/delay.h: No such file or directory`.

**`CORE_DEBUG_LEVEL`** Controls debug output verbosity:
- `0` = None
- `1` = Error
- `2` = Warn
- `3` = Info
- `4` = Debug
- `5` = Verbose

When set to `1` or higher, a [telnet debug log server](./telnet_debug_log.md) is available on port 23.

**`DISABLE_ALL_LIBRARY_WARNINGS`** Suppresses diagnostic messages from the FOTA library.

**`FIREFLY_CLOUD_API_ROOT`** The FireFly Cloud API root URL used for all cloud operations (OTA, device registration, backup). Required — the compiler will error if omitted. Set as a full URL including protocol with no trailing slash (e.g., `-DFIREFLY_CLOUD_API_ROOT="https://api.fireflylx.com"`). In CI this value is injected from the `FIREFLY_CLOUD_API_ROOT` [environment variable](#environment-variables).

The repo root must also be added to the include path (e.g. `-I/path/to/FireFly-Controller`) so that headers in `common/` can be resolved. Abbreviated paths using `~` will not work.

## Partitions

Each hardware model has its own partition layout defined in `devices.yaml`. The `partitions.csv` file is generated automatically at CI build time — there is no static file committed to the repository.

See [Partitions](/controller/support/partitions) for the full partition layout and details on how the table is generated.

## Adding a new hardware version

Hardware configurations are abstracted from the main applications to allow for compilation with minimal hardware-specific design considerations. Each hardware model's pin mappings and hardware constants are defined in `hardware.h`.

Peripheral information and build metadata are defined in `devices.yaml` at the repository root. Adding the product HEX, product ID, `inputs_count`, `outputs_count`, `bootloader_addr`, and `partition_scheme` to `devices.yaml` will include the model in the CI build matrix when its status is `ACTIVE`, and will populate the Product ID drop-down in the Hardware Registration and Configuration application.

## Filter Large JSON documents

The Controller [filters large JSON documents](./configuration_json_filtering.md) in order to conserve memory and protect future upgradeability.

## Telnet Debug Log

When built with `CORE_DEBUG_LEVEL` set to `1` or higher, the Controller exposes a [telnet debug log server](./telnet_debug_log.md) on port 23 that streams live ESP32 log output to connected clients — the same output visible on the serial UART.

## Environment Variables

Some CI workflows require environment variables to be configured on each GitHub Environment (`dev` and `production`). Each variable is set once per environment under repo Settings → Environments → *environment name* → Environment variables.

### `FIREFLY_CLOUD_API_ROOT`

**Installed in:** `BrentIO/FireFly-Controller` → Settings → Environments → **dev** and **production** → Environment variables

**Purpose:** Specifies the FireFly Cloud API root URL used by both the Controller and Hardware Registration and Configuration firmware. The value is injected as a compile-time define (`-DFIREFLY_CLOUD_API_ROOT=...`). If this variable is not set, the build will fail with a compile-time error.

**Format:** Full URL including protocol, no trailing slash (e.g., `https://api.fireflylx.com`).

## Repository Secrets

Some CI workflows require secrets to be configured across repositories. Each secret is created once as a personal access token and then installed into the repository whose CI workflow uses it.

### `FIREFLY_DOCS_TOKEN`

**Installed in:** `BrentIO/FireFly-Controller` → Settings → Environments → **production** → Environment secrets

**Purpose:** Allows the FireFly-Controller production CI workflow to automatically open a pull request on `BrentIO/FireFly-Docs` when the library list changes.

**To create the token:**

1. Go to GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
2. Click **Generate new token**
3. Set the resource owner to `BrentIO`
4. Under **Repository access**, select **Only select repositories** and choose `BrentIO/FireFly-Docs`
5. Under **Permissions → Repository permissions**, grant:
   - **Contents**: Read and write
   - **Pull requests**: Read and write
6. Generate the token and copy it immediately

**To install the token in `BrentIO/FireFly-Controller`:**

1. Go to `BrentIO/FireFly-Controller` → **Settings** → **Environments** → **production**
2. Under **Environment secrets**, click **Add secret**
3. Name: `FIREFLY_DOCS_TOKEN`
4. Value: paste the token generated above

### `FIREFLY_CLOUD_TOKEN`

**Installed in:** `BrentIO/FireFly-Controller` → Settings → Secrets and variables → Actions → **Repository secrets**

**Purpose:** Allows the FireFly-Controller CI workflow to trigger the configurator UI deployment workflow in `BrentIO/FireFly-Cloud` via `repository_dispatch` after a successful firmware build.

**To create the token:**

1. Go to GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
2. Click **Generate new token**
3. Set the resource owner to `BrentIO`
4. Under **Repository access**, select **Only select repositories** and choose `BrentIO/FireFly-Cloud`
5. Under **Permissions → Repository permissions**, grant:
   - **Contents**: Read and write
6. Generate the token and copy it immediately

**To install the token in `BrentIO/FireFly-Controller`:**

1. Go to `BrentIO/FireFly-Controller` → **Settings** → **Secrets and variables** → **Actions**
2. Under **Repository secrets**, click **New repository secret**
3. Name: `FIREFLY_CLOUD_TOKEN`
4. Value: paste the token generated above