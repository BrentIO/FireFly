# Cloud Backup

Cloud backup allows you to store an encrypted copy of your Controller's configuration in FireFly Cloud and restore it to the same device at any time.  The backup is encrypted on-device before it leaves the hardware, and only the original device can decrypt it.

## Prerequisites

Cloud backup requires that the device has been provisioned — registered with and connected to FireFly Cloud.  See [Controller Provisioning](/controller/support/controller_provisioning) for details.  If the device is not provisioned, all cloud backup API calls return `409 Conflict`.

The device clock must also be synchronized.  If NTP has not completed, calls return `503 Service Unavailable`.

## What Is Backed Up

The backup source file is `/backup.json` on the device's `config` LittleFS partition.  This file is the plaintext Dexie (IndexedDB) export of the Controller UI's configuration database, and is written to the device by the Controller UI when you export or save your configuration.  It contains the full configuration dataset — inputs, outputs, circuits, areas, colors, icons, MQTT settings, OTA settings, and all other configured items.

The maximum supported backup file size is **512 KB**.

## Encryption Model

All encryption and decryption happen entirely on-device.  The backup is never transmitted or stored in plaintext outside the hardware.

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

Downloads the encrypted backup blob from FireFly Cloud, decrypts it on-device, writes the result back to `/backup.json` on the config partition, and returns the plaintext configuration JSON to the caller.

If no backup exists in the cloud, the request returns `404 Not Found`.

### Delete Backup

Sends a delete request to FireFly Cloud to permanently remove the stored backup for the device.  If a local `/backup.json` also exists on the device, it is removed as well.

A successful delete returns `204 No Content`.  If no backup exists in the cloud, the request returns `404 Not Found`.

## Automatic Backup on Firmware Update

The device automatically attempts to push the cloud backup before checking for firmware updates.  This ensures that an up-to-date backup is stored in the cloud before any firmware change is applied.

## API Reference

The cloud backup endpoints are part of the Controller REST API.  All three methods operate on `/api/cloud-backup` and require a valid `visual-token` header.  See the [Controller API Reference](/controller/software/controller/api_reference) for full request and response schemas.

| Method | Endpoint | Action |
| ------ | -------- | ------ |
| `POST` | `/api/cloud-backup` | Push local `/backup.json` to cloud |
| `GET` | `/api/cloud-backup` | Retrieve and decrypt backup from cloud |
| `DELETE` | `/api/cloud-backup` | Delete cloud backup (and local `/backup.json`) |
