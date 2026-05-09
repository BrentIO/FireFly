# s3-device-backups

## Overview

Provisions the S3 bucket used to store encrypted per-device configuration backups. The bucket is private, versioned, and KMS-encrypted. Objects are keyed as `{uuid}/backup.ffce` — one FFCE-format AES-256-GCM encrypted blob per device. The bucket name is passed to the three backup Lambda stacks as `BackupBucketName`.

## CloudFormation Stack

`firefly-s3-device-backups`

## Dependencies

### Deploy

None — this workflow has no prerequisites.

### Delete

- `delete-func-api-devices-backup-post` — IAM permissions referencing the bucket must be removed first
- `delete-func-api-devices-backup-get` — IAM permissions referencing the bucket must be removed first
- `delete-func-api-devices-backup-delete` — IAM permissions referencing the bucket must be removed first

## Required By

### Deploy

- `func-api-devices-backup-post` — `BackupBucketName` passed as parameter
- `func-api-devices-backup-get` — `BackupBucketName` passed as parameter
- `func-api-devices-backup-delete` — `BackupBucketName` passed as parameter

### Delete

None.

---

## Deploy Workflow

### Description

Deploys the `firefly-s3-device-backups` CloudFormation stack. The bucket has `DeletionPolicy: Retain` so it is preserved if the stack is deleted.

### Steps

1. Checkout repository
2. Configure AWS credentials
3. Install SAM CLI
4. `sam deploy` — stack: `firefly-s3-device-backups`; params: `BucketName` (from secrets `S3_DEVICE_BACKUPS_BUCKET_NAME`)

---

## Delete Workflow

### Description

Empties all object versions and delete markers from the bucket (with a production guard that refuses to proceed if the bucket is non-empty), then deletes the CloudFormation stack.

### Steps

1. Configure AWS credentials
2. Install SAM CLI
3. Empty all versioned objects and delete markers from the bucket
4. Abort any incomplete multipart uploads
5. `sam delete --stack-name firefly-s3-device-backups --no-prompts`

---

## Failure Scenarios

| Scenario | Cause | Resolution |
|---|---|---|
| Bucket non-empty at stack deletion time (production) | Production guard triggered | Investigate before emptying; the guard prevents accidental data loss |
| `DELETE_FAILED` — Lambda IAM role still references bucket | Backup Lambda stacks not yet deleted | Delete all three backup Lambda stacks first, then re-run |
