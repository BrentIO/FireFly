# Firmware Management UI

The firmware management UI is a Vue 3 single-page application (SPA) that provides a web interface for managing the firmware lifecycle.  It is served from a private S3 bucket via a CloudFront distribution.

## Features

- **Firmware list** — paginated table of all firmware records with sortable columns, text search across file name, product ID, version, and notes, and toggle filters for deleted and released firmware
- **Firmware detail** — modal view accessible directly via URL (`/firmware/:zip_name`) with all record fields, status transition controls, a lazy pre-signed download link, manifest file disclosure, and a delete button
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
