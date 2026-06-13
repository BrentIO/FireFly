# Cloud Backup

Cloud backup allows you to store an encrypted copy of your Controller's configuration in FireFly Cloud and restore it to the same device at any time.  The backup is encrypted on-device before it leaves the hardware, and only the original device can decrypt it.

## Prerequisites

Cloud backup requires that the device has been provisioned — registered with and connected to FireFly Cloud.  See [Controller Provisioning](/controller/support/provisioning_mode#controller-provisioning) for details.  If the device is not provisioned, all cloud backup API calls return `409 Conflict`.

The device clock must also be synchronized.  If NTP has not completed, calls return `503 Service Unavailable`.

## What Is Backed Up

The backup source file is `/backup.json` on the device's `config` LittleFS partition.  This file is the plaintext Dexie (IndexedDB) export of the Controller UI's configuration database, and is written to the device by the Controller UI when you export or save your configuration.  It contains the full configuration dataset — inputs, outputs, circuits, areas, colors, icons, MQTT settings, OTA settings, and all other configured items.

The maximum supported backup file size is **512 KB**.

### Local Storage and ETag

The backup is stored as **plaintext** on the device's LittleFS partition at rest.  Alongside `/backup.json`, the device also stores a SHA-256 hash of the backup content in a sidecar file.  This hash is exposed as an `ETag` response header on `GET /backup` and `HEAD /backup` requests.

The ETag follows [RFC 7232](https://datatracker.ietf.org/doc/html/rfc7232) format (a quoted hex string) and represents the SHA-256 digest of the plaintext backup content.  The Controller UI uses the ETag to determine whether the backup stored on a device matches the current local database — if they differ, a **Deployment Required** indicator is shown for that controller.

This same plaintext SHA-256 ETag is sent to FireFly Cloud on every backup upload.  The cloud stores it alongside the encrypted blob and uses it for deduplication: if both the `ETag` and `If-None-Match` request headers are present and the value matches what is already stored, the cloud returns `304 Not Modified` and skips the write.

## Encryption Model

The local `/backup.json` file is stored as plaintext on the device.  Encryption applies only to cloud transit — the backup is encrypted on-device before being uploaded to FireFly Cloud, and decrypted on-device when retrieved.  The backup is never transmitted or stored in plaintext in the cloud.

| Property | Value |
| -------- | ----- |
| Algorithm | AES-256-GCM |
| Key derivation | HKDF-SHA256 from the device eFuse master key |
| HKDF label | `firefly-backup-v1` |
| Key source | eFuse BLOCK3 (burned during hardware provisioning; never transmitted) |

The eFuse master key is generated on-device at provisioning time using the hardware CSRNG and is never readable by firmware or exposed via any API.  See [Hardware Registration and Configuration](/controller/software/hardware_registration_and_configuration/) for details on eFuse storage.

::: danger Replacement board cannot restore your backup
Because the encryption key is derived from silicon-level eFuse registers unique to each physical chip, a replacement board has a different master key and **cannot decrypt backups created by the original board**.  Keep a local export of your configuration as an additional safeguard.
:::

## Using Cloud Backup from the Controller UI

The Controller UI provides three cloud backup actions accessible from the backup section of the interface.

### Push Backup to Cloud

Reads `/backup.json` from the device, encrypts it on-device, and uploads the ciphertext to FireFly Cloud.  The operation succeeds when the cloud returns `200`, `204`, or `304`.

If no `/backup.json` exists on the device, the request returns `404 Not Found`.  Export your configuration from the Controller UI first to create the local backup file before pushing to the cloud.

### Retrieve Backup from Cloud

Downloads the encrypted backup blob from FireFly Cloud, decrypts it on-device, writes the result back to `/backup.json` on the config partition, and returns the plaintext configuration JSON to the caller.  If the cloud response includes an ETag header, the ETag sidecar is also written so the **Deployment Required** indicator reflects the restored state.

If no backup exists in the cloud, the request returns `404 Not Found`.

### Delete Backup

Sends a delete request to FireFly Cloud to permanently remove the stored backup for the device.  If a local `/backup.json` also exists on the device, it and its ETag sidecar are removed as well.

A successful delete returns `204 No Content`.  If no backup exists in the cloud, the request returns `404 Not Found`.

## Automatic Backup

The device automatically attempts to push the cloud backup to FireFly Cloud once every 86,400 seconds (daily), beginning 30 seconds after boot.  The frequency can be overridden with the `CLOUD_BACKUP_INTERVAL_SECONDS` compile-time parameter.

An automatic upload only occurs if a `/backup.json` file exists on the device's config partition.  If no backup file is present, the upload is skipped silently until one is created.

## API Reference

The cloud backup endpoints are part of the Controller REST API and require a valid `visual-token` header.  See the [Controller API Reference](/controller/software/controller/api_reference) for full request and response schemas.

**Cloud backup** (operate on `/api/cloud-backup`):

| Method | Endpoint | Action |
| ------ | -------- | ------ |
| `POST` | `/api/cloud-backup` | Push local `/backup.json` to cloud |
| `GET` | `/api/cloud-backup` | Retrieve and decrypt backup from cloud |
| `DELETE` | `/api/cloud-backup` | Delete cloud backup (and local `/backup.json`) |

**Local backup** (operate on `/backup`):

| Method | Endpoint | Action |
| ------ | -------- | ------ |
| `HEAD` | `/backup` | Check whether a backup exists and retrieve its ETag without downloading the file |
| `GET` | `/backup` | Download the local backup; includes `ETag` response header |
| `PUT` | `/backup` | Write a new backup to the device; computes and stores the ETag sidecar |
| `DELETE` | `/backup` | Remove the local backup and its ETag sidecar |
