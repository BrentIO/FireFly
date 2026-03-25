# Firmware Management UI

The firmware management UI is a Vue 3 single-page application (SPA) that provides a web interface for managing the firmware lifecycle.  It is served from a private S3 bucket via a CloudFront distribution.

## Features

- **Firmware list** — paginated table of all firmware records with sortable columns, text search across file name, product ID, version, and notes, and toggle filters for deleted and released firmware
- **Firmware detail** — modal view accessible directly via URL (`/firmware/:zip_name`) with all record fields, status transition controls, a lazy pre-signed download link, manifest file disclosure, and a delete button
- **Flash via USB** — browser-based firmware flashing over Web Serial directly from the firmware detail view (Chrome only; see [Flash via USB](#flash-via-usb))
- **Dark / light mode** — respects the system preference by default; user override is persisted in `localStorage`
- **Toast notifications** — success toasts auto-dismiss after 5 seconds; error toasts require manual dismissal
- **Confirmation dialogs** — destructive actions (delete, transition to RELEASED or REVOKED) require explicit confirmation

## Firmware Status

Firmware moves through a defined state machine.  The table below shows the display label for each status value.

| API Value | Display Label |
|---|---|
| `PROCESSING` | Processing |
| `ERROR` | Error |
| `READY_TO_TEST` | Ready to Test |
| `TESTING` | Testing |
| `RELEASED` | Released |
| `REVOKED` | Revoked |
| `DELETED` | Deleted |

### Valid Transitions

| From | To |
|---|---|
| `READY_TO_TEST` | `TESTING` |
| `TESTING` | `READY_TO_TEST`, `RELEASED` |
| `RELEASED` | `REVOKED` |

Transitions to `RELEASED` and `REVOKED` require confirmation.

## Default List View

The list defaults to showing only actionable firmware — records in `PROCESSING`, `ERROR`, `READY_TO_TEST`, or `TESTING` states.  **Show Deleted** and **Show Released** toggles are off by default and must be enabled explicitly to include those records.

## Flash via USB

The **Flash via USB** button appears in the firmware detail modal for any firmware record that has not been deleted. It is only visible in browsers that support the [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API) (Chrome and Chromium-based browsers). It is hidden in Safari, Firefox, and mobile browsers.

Clicking the button opens the flash dialog, which:

1. Downloads the firmware ZIP from the pre-signed S3 URL.
2. Extracts all flashable binary files from the ZIP.
3. Prompts the browser to open a port picker so you can select the device's serial port.
4. Connects to the ESP32 via esptool-js and detects the chip.
5. Writes each binary file to the device at its correct flash address.
6. Resets the device when complete.

### Flash Address Mapping

Each binary file is written to its partition address. The partition table is fixed for all FireFly controller hardware.

| File pattern | Flash address | Notes |
|---|---|---|
| `*.bootloader.bin` | `0x01000` | ESP32 bootloader |
| `*.partitions.bin` | `0x08000` | Partition table |
| `*.bin` (application) | `0x10000` | `app0` partition |
| `config.bin` | `0xC90000` | Config partition |
| `www.bin` | `0xD10000` | Web UI / LittleFS partition |
| `*.elf`, `*.map`, `manifest.json` | — | Skipped — debug/metadata files |

### Requirements

- **Chrome or a Chromium-based browser** — the Web Serial API is not available in other browsers.
- **USB connection** — the controller must be connected via USB.
- **Bootloader mode** — most FireFly boards auto-reset into bootloader mode via DTR/RTS when the serial connection opens. If your board does not reset automatically, hold the **BOOT** button while pressing **EN** before clicking **Connect & Flash**.

### Deleted Firmware

The **Flash via USB** button is not shown for firmware with a `DELETED` status. Deleted firmware has been removed from S3 and cannot be downloaded or flashed.

## Pre-signed Download URL

The download link in the firmware detail modal is lazy — the pre-signed URL is not fetched when the modal opens.  It is requested only when the user clicks **Download**, and it expires after 15 minutes.  See [func-api-firmware-download-get](./lambdas/func-api-firmware-download-get) for details.

## Infrastructure

The UI is hosted on AWS using two CloudFormation stacks:

| Stack | Description |
|---|---|
| `firefly-s3-ui` | Private S3 bucket for UI static files; no public access |
| `firefly-cloudfront-ui` | CloudFront OAC distribution with custom domain, HTTPS, and SPA routing (403/404 → `index.html`) |

## Deploying

The UI is built and deployed by the `deploy-ui-app` GitHub Actions workflow.  It requires the `firefly-s3-ui` and `firefly-cloudfront-ui` stacks to already exist.

The workflow:
1. Installs Node 20 dependencies (`npm ci`)
2. Builds the app with Vite, injecting `VITE_API_URL` from the `API_URL` GitHub variable
3. Syncs the build output to the private S3 bucket (`aws s3 sync --delete`)
4. Invalidates the CloudFront cache (`/*`)

For first-time setup, use **Deploy All** (`deploy-all`), which handles the correct dependency order.

## Authentication

The login page is a stub — credentials are not validated against any backend.  Submitting the form sets a `firefly_authenticated` key in `sessionStorage` and redirects to `/firmware`.  The session is destroyed on logout (accessible from the hamburger menu) or when the browser tab is closed.
