# func-s3-firmware-uploaded

## Overview

Manages the Lambda function that processes firmware ZIPs uploaded to the private S3 bucket. Triggered by S3 ObjectCreated events on the `incoming/*.zip` prefix. Validates the manifest, computes SHA256, writes DynamoDB metadata, and moves the ZIP to `processed/` or `errors/`.

## CloudFormation Stack

`firefly-func-s3-firmware-uploaded`

## Dependencies

### Deploy Dependencies

| Workflow | Reason |
|---|---|
| [shared-layer](./shared-layer.md) | Lambda layer ARN must be resolvable at SAM build/deploy time |

### Delete Dependencies

| Workflow | Reason |
|---|---|
| [s3-firmware](./s3-firmware.md) | S3 event notification and resource-based policy must be removed before the function can be deleted |

## Required By

### Required By Deploy

| Workflow | Reason |
|---|---|
| [s3-firmware](./s3-firmware.md) | Needs the Lambda ARN to configure S3 event notifications |

### Required By Delete

| Workflow | Reason |
|---|---|
| [shared-layer](./shared-layer.md) | Layer cannot be deleted while functions still reference it |

## Deploy Workflow

### Description

Builds and deploys the function using SAM. The function receives the firmware bucket name (to move ZIPs between prefixes), the DynamoDB firmware table name (to write metadata), and the environment name (for AppConfig lookups).

### Steps

1. Configure AWS credentials.
2. SAM build `lambdas/func-s3-firmware-uploaded/template.yaml`.
3. SAM deploy with parameters:
   - `FirmwareBucketName` (from secrets)
   - `DynamoDbFirmwareTableName` (from vars)
   - `EnvironmentName` (target environment)

### Sequence Diagram

[![Deploy Sequence](./images/deploy-func-s3-firmware-uploaded.svg)](./images/deploy-func-s3-firmware-uploaded.svg)

## Delete Workflow

### Description

Runs `sam delete` to remove the CloudFormation stack and the Lambda function. The `s3-firmware` stack must be deleted first so the S3 event notification and resource-based policy are gone before this function is removed.

### Steps

1. Configure AWS credentials.
2. SAM delete `firefly-func-s3-firmware-uploaded`.

### Sequence Diagram

[![Delete Sequence](./images/delete-func-s3-firmware-uploaded.svg)](./images/delete-func-s3-firmware-uploaded.svg)

## Failure Scenarios

| Scenario | Behavior |
|---|---|
| Shared layer not yet deployed | SAM build or deploy fails if the layer ARN cannot be resolved. Deploy `shared-layer` first. |
| S3 bucket still sending events | If `s3-firmware` is not deleted first, the resource-based policy attached to this function may prevent deletion. Run `delete-s3-firmware` before this workflow. |
