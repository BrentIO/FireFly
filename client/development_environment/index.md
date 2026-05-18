# Client Development Environment

This guide covers core information about local testing for development. Production and test builds are built using GitHub Actions.

## Dockerfile for ACT

The Dockerfile is maintained in the FireFly-Client repository at [`.act/dockerfile`](https://github.com/BrentIO/FireFly-Client/blob/main/.act/dockerfile). Build the image from the **repo root** (not from `.act/`) so that `libraries.yaml` is available in the build context:

Usage for Intel CPU:
```bash
docker build --no-cache --platform=linux/amd64 -t act-arduino-ubuntu-24-04:latest -f .act/dockerfile .
```

Usage for Apple Silicon:
```bash
docker build --no-cache --platform=linux/arm64 -t act-arduino-ubuntu-24-04:latest -f .act/dockerfile .
```

## Configure ACT for Visual Studio Code

To run the ACT docker image through Visual Studio Code, use [GitHub Local Actions](https://marketplace.visualstudio.com/items?itemName=SanjulaGanepola.github-local-actions) plug-in for Visual Studio. The following settings must be applied:

| Section | Setting | Value | Notes |
| ------- | ------- | ----- | ----- |
| Runners | ubuntu-24.04 | `act-arduino-ubuntu-24-04` | |
| Options | artifact-server-path | `./artifacts` | |
| Options | pull | `false` | |
| Options | container-architecture | `linux/arm64` | For Apple Silicon only |
| Options | container-architecture | `linux/amd64` | For Apple Intel chips |

## Core Versions

The following ESP8266 Arduino core version is used with this solution. This version is configured in [`libraries.yaml`](https://github.com/BrentIO/FireFly-Client/blob/main/libraries.yaml) in the FireFly-Client repository and is automatically updated on each production build.

<!-- CORE-TABLE-START -->
| Core | Version |
| ---- | ------- |
| [esp8266:esp8266](https://github.com/esp8266/Arduino) | 3.1.2 |
<!-- CORE-TABLE-END -->

## Library Versions

The following library versions are used with this solution. This table is automatically updated on each production build from [`libraries.yaml`](https://github.com/BrentIO/FireFly-Client/blob/main/libraries.yaml) in the FireFly-Client repository.

<!-- LIBRARY-TABLE-START -->
| Library | Version |
| ------- | ------- |
| [ArduinoJson](https://github.com/bblanchon/ArduinoJson) | v7.4.3 |
| [TBPubSubClient](https://github.com/thingsboard/pubsubclient) | v2.12.1 |
<!-- LIBRARY-TABLE-END -->

## Compile Flags

The following flags must be passed to the compiler regardless of build method (CI or local):

**`PRODUCT_HEX`** The hardware product ID expressed as a hexadecimal. Required — the compiler will error if omitted. Use the `0x`-prefixed value from `devices.yaml` for the target hardware (e.g. `-DPRODUCT_HEX=0x06002011`).

**`CORE_DEBUG_LEVEL`** Controls debug output verbosity:
- `0` = None
- `1` = Error
- `2` = Warn
- `3` = Info
- `4` = Debug
- `5` = Verbose

**`DISABLE_ALL_LIBRARY_WARNINGS`** Suppresses diagnostic messages from dependent libraries.

**`VERSION`** The firmware version string, set to the tag name on release builds (e.g. `2026.05.01`). Omit for debug builds.

**`COMMIT_HASH`** The short (7-character) git SHA of the build commit. Omit for debug builds.

The repo root must also be added to the include path (e.g. `-I/path/to/FireFly-Client`) so that headers in `common/` can be resolved. Abbreviated paths using `~` will not work.

## Partitions

Unlike the Controller, the ESP8266 does not use a generated `partitions.csv`. The memory layout is baked into the FQBN board options and managed by the ESP8266 Arduino core. Board options are sourced from `devices.yaml`.

The following partition layout applies to FFI0600-2011:

| Label | Address | Size |
| ----- | ------- | ---- |
| eboot | 0x000000 | 0x001000 |
| app0 | 0x001000 | 0x100000 |
| app1 | 0x101000 | 0x100000 |
| config | 0x200000 | 0x1FB000 |
| rf_cal | 0x3FB000 | 0x001000 |
| phy_init | 0x3FC000 | 0x001000 |
| sdk_config | 0x3FE000 | 0x002000 |

::: info
On ESP8266, `LittleFS.begin()` locates the filesystem by the address baked into the core at compile time via the `eesz` board option — not by the partition label. The label is documentary only.
:::

## Adding a new hardware version

Hardware configurations are abstracted from the main application to allow compilation with minimal hardware-specific design considerations. Each hardware model's pin mappings and hardware constants are defined in a dedicated header file.

1. Create a device header in `common/devices/` following the pattern of `FFI0600-2011.h`. Define `SUPPORTED_HARDWARE`, all GPIO pin assignments, `LED_CHANNEL_COUNT`, `LED_PWM_MAX`, `FACTORY_RESET_PIN`, `PRODUCT_ID`, and the `ledWrite()` inline function.

2. Update `common/hardware.h` to add a `#if PRODUCT_HEX == 0xXXXXXXXX` block that includes the new header.

3. Add an entry to `devices.yaml` at the repository root with the `product_hex`, `product_id`, `status`, `inputs_count`, `outputs_count`, `board_fqbn`, `board_options`, `bootloader_addr`, and `partition_scheme` fields. Setting `status` to `ACTIVE` will include the model in the CI build matrix.

## Repository Secrets

Some CI workflows require secrets to be configured across repositories. Each secret is created once and then installed into the repository whose CI workflow uses it.

### `FIREFLY_DOCS_TOKEN`

**Installed in:** `BrentIO/FireFly-Client` → Settings → Environments → **production** → Environment secrets

**Purpose:** Allows the FireFly-Client production CI workflow to automatically open a pull request on `BrentIO/FireFly-Docs` when the library list changes.

**No new token needed** — reuse the existing fine-grained PAT created for [FireFly-Controller](/controller/development_environment/#firefly-docs-token). The same token covers both repositories because it already has Contents and Pull requests read/write access to `BrentIO/FireFly-Docs`.

**To install the token in `BrentIO/FireFly-Client`:**

1. Go to `BrentIO/FireFly-Client` → **Settings** → **Environments** → **production**
2. Under **Environment secrets**, click **Add secret**
3. Name: `FIREFLY_DOCS_TOKEN`
4. Value: paste the existing token

### `AWS_ROLE_ARN`

**Installed in:** `BrentIO/FireFly-Client` → Settings → Environments → **production** → Environment secrets

**Purpose:** IAM role ARN assumed via OIDC to authenticate to AWS during production firmware builds. Required to upload compiled firmware artifacts to S3.

### `AWS_REGION`

**Installed in:** `BrentIO/FireFly-Client` → Settings → Environments → **production** → Environment secrets

**Purpose:** AWS region where the firmware S3 bucket is located.

### `S3_FIRMWARE_BUCKET_NAME`

**Installed in:** `BrentIO/FireFly-Client` → Settings → Environments → **production** → Environment secrets

**Purpose:** Name of the S3 bucket where compiled firmware ZIP archives are uploaded during production builds.
