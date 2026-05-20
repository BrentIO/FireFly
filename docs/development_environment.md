# Docs Development Environment

This guide covers local testing for the FireFly documentation site. Production builds run via GitHub Actions.

## Dockerfile for ACT

The Dockerfile is maintained in the FireFly-Docs repository at [`.act/dockerfile`](https://github.com/BrentIO/FireFly-Docs/blob/main/.act/dockerfile). Build the image from the **repo root**:

Usage for Intel CPU:
```bash
docker build --no-cache --platform=linux/amd64 -t act-docs-ubuntu-24-04:latest -f .act/dockerfile .
```

Usage for Apple Silicon:
```bash
docker build --no-cache --platform=linux/arm64 -t act-docs-ubuntu-24-04:latest -f .act/dockerfile .
```

## Local Preview

To build and locally preview the docs site, run the following from the **repo root**. The container will build the site, then serve it on `http://localhost:4173`. Kill the container to stop; restart it to do a clean rebuild.

Usage for Intel CPU:
```bash
docker run --rm --platform linux/amd64 -p 4173:4173 -v $(pwd):/docs:ro act-docs-ubuntu-24-04:latest bash /docs/.act/preview-entrypoint.sh
```

Usage for Apple Silicon:
```bash
docker run --rm --platform linux/arm64 -p 4173:4173 -v $(pwd):/docs:ro act-docs-ubuntu-24-04:latest bash /docs/.act/preview-entrypoint.sh
```

## Configure ACT for Visual Studio Code

To run the ACT docker image through Visual Studio Code, use the [GitHub Local Actions](https://marketplace.visualstudio.com/items?itemName=SanjulaGanepola.github-local-actions) plug-in. The following settings must be applied:

| Section | Setting | Value | Notes |
| ------- | ------- | ----- | ----- |
| Runners | ubuntu-latest | `act-docs-ubuntu-24-04` | |
| Options | artifact-server-path | `./artifacts` | |
| Options | pull | `false` | |
| Options | container-architecture | `linux/arm64` | For Apple Silicon only |
| Options | container-architecture | `linux/amd64` | For Apple Intel chips |

::: info AWS Steps
The `Configure AWS credentials`, `Sync to S3`, and `Invalidate CloudFront cache` steps require OIDC credentials that are not available locally and will fail. All other steps — PlantUML generation, OpenAPI/AsyncAPI download, AsyncAPI HTML generation, and VitePress build — run normally.
:::

## Capturing Configurator Screenshots

The `tools/capture-screenshots.js` script automates updating the UI screenshots under `controller/software/controller/configuration/`. It opens a real browser window, imports a configuration backup to populate the UI with data, navigates each page, and saves PNGs directly into the correct directory.

### Prerequisites

Node.js is required (already present if you have run `npm install` at the repo root). Install the tool dependencies and Playwright's browser once:

```bash
cd tools
npm install
npx playwright install chromium
```

### Getting a Backup File

The script requires a Dexie export from the configurator as its data source. In your regular browser session at [configurator.fireflylx.com](https://configurator.fireflylx.com), navigate to **Import / Export** and click **Download Backup**. Save the resulting `.json` file somewhere accessible.

### Running the Script

```bash
cd tools
node capture-screenshots.js --db /path/to/FireFlyConfig_backup.json
```

A Chrome window will open, import the backup, then navigate all 18 pages automatically. Screenshots are saved directly to `controller/software/controller/configuration/`.

### Interactive Screenshots

Five screenshots require specific UI state that the script cannot fully automate:

| File | State required |
| ---- | -------------- |
| `circuit_new.png` | Add New Circuit dialog open |
| `controllers_add.png` | Add Controller dialog open |
| `controller_added.png` | At least one controller present in data |
| `controller_authenticated.png` | Controller authenticated (requires real hardware) |
| `clients-buttons.png` | Client detail view with buttons expanded |

These are stubbed as commented-out code at the bottom of `capture-screenshots.js`. Once the Vue component selectors are known, uncomment and adjust them to automate those captures as well.
