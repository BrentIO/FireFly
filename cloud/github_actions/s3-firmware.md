# s3-firmware

## Overview

Manages the private S3 bucket that drives the firmware ZIP processing pipeline. The bucket receives uploaded ZIPs in `incoming/`, routes them through `processing/`, and routes final artifacts to `processed/` or `errors/`. S3 event notifications connect the bucket to the two firmware Lambda functions.

## CloudFormation Stack

`firefly-s3-firmware`

## Dependencies

### Deploy Dependencies

| Workflow | Reason |
|---|---|
| [func-s3-firmware-uploaded](./func-s3-firmware-uploaded.md) | Lambda ARN required as SAM parameter |
| [func-s3-firmware-deleted](./func-s3-firmware-deleted.md) | Lambda ARN required as SAM parameter |

### Delete Dependencies

None — this workflow has no prerequisites.

## Required By

### Required By Deploy

| Workflow | Reason |
|---|---|
| [func-api-firmware-download-get](./func-api-firmware-download-get.md) | Bucket must exist before function can generate pre-signed URLs |

### Required By Delete

| Workflow | Reason |
|---|---|
| [func-s3-firmware-uploaded](./func-s3-firmware-uploaded.md) | S3 event notification (resource-based policy) must be removed before function can be deleted |
| [func-s3-firmware-deleted](./func-s3-firmware-deleted.md) | S3 event notification (resource-based policy) must be removed before function can be deleted |

## Deploy Workflow

### Description

Before deploying, the workflow resolves the ARNs of both S3-triggered Lambda functions by querying their CloudFormation stacks. These ARNs are passed as SAM parameters so CloudFormation can wire the S3 event notifications. The bucket is private with four lifecycle rules to limit storage costs during each pipeline stage.

### Steps

1. Configure AWS credentials.
2. Look up `FirmwareUploadLambdaArn` from the `firefly-func-s3-firmware-uploaded` stack output.
3. Look up `FirmwareDeleteLambdaArn` from the `firefly-func-s3-firmware-deleted` stack output.
4. SAM deploy `templates/s3-firmware.yaml` with parameters:
   - `BucketName` (from secrets)
   - `FirmwareUploadLambdaArn`
   - `FirmwareDeleteLambdaArn`
5. CloudFormation creates the bucket, S3 event notifications, and lifecycle rules.

**Bucket configuration:**
- Private (no public access)
- S3 event notification: `incoming/*.zip` ObjectCreated → `func-s3-firmware-uploaded`
- S3 event notification: `processed/` and `errors/` ObjectRemoved → `func-s3-firmware-deleted`
- Lifecycle rules: `incoming/` 1 day, `processing/` 1 day, `errors/` 7 days, `processed/` 30 days

### Sequence Diagram

[![Deploy Sequence](./images/deploy-s3-firmware.svg)](./images/deploy-s3-firmware.svg)

## Delete Workflow

### Description

Empties the bucket before calling `sam delete` so CloudFormation is not blocked by a non-empty bucket.

### Steps

1. Configure AWS credentials.
2. Empty the bucket: `aws s3 rm s3://{BucketName} --recursive`.
3. SAM delete `firefly-s3-firmware`.

### Sequence Diagram

[![Delete Sequence](./images/delete-s3-firmware.svg)](./images/delete-s3-firmware.svg)

## Failure Scenarios

| Scenario | Behavior |
|---|---|
| Lambda ARN lookup fails (function stack not deployed) | `describe-stacks` call returns an error; workflow fails before SAM deploy is attempted. Deploy `func-s3-firmware-uploaded` and `func-s3-firmware-deleted` first. |
| Bucket non-empty at delete time | Workflow empties the bucket with `aws s3 rm --recursive` before calling `sam delete`, so CloudFormation never sees a non-empty bucket. |
| S3 event notification already exists | SAM handles idempotently via CloudFormation update; existing notifications are replaced in-place. |
