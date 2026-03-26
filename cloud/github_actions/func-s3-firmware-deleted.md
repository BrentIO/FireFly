# func-s3-firmware-deleted

## Overview

Manages the Lambda function that responds to firmware ZIPs deleted from the private S3 bucket. Triggered by S3 ObjectRemoved events on the `processed/` and `errors/` prefixes. Marks non-RELEASED/REVOKED DynamoDB records as `DELETED` with a 10-day TTL.

## CloudFormation Stack

`firefly-func-s3-firmware-deleted`

## CloudWatch Logs

| Setting | Value |
|---|---|
| Log group | `/aws/lambda/firefly-func-s3-firmware-deleted` |
| Retention | 30 days |

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

Builds and deploys the function using SAM. The function receives the firmware bucket name, DynamoDB firmware table name, and environment name.

### Steps

1. Configure AWS credentials.
2. SAM build `lambdas/func-s3-firmware-deleted/template.yaml`.
3. SAM deploy with parameters:
   - `FirmwareBucketName` (from secrets)
   - `EnvironmentName` (target environment)

### Sequence Diagram

[![Deploy Sequence](./images/deploy-func-s3-firmware-deleted.svg)](./images/deploy-func-s3-firmware-deleted.svg)

## Delete Workflow

### Description

Runs `sam delete` to remove the CloudFormation stack and the Lambda function. The `s3-firmware` stack must be deleted first so the S3 event notification and resource-based policy are removed before this function is deleted.

### Steps

1. Configure AWS credentials.
2. SAM delete `firefly-func-s3-firmware-deleted`.

### Sequence Diagram

[![Delete Sequence](./images/delete-func-s3-firmware-deleted.svg)](./images/delete-func-s3-firmware-deleted.svg)

## Failure Scenarios

| Scenario | Behavior |
|---|---|
| Shared layer not yet deployed | SAM build or deploy fails if the layer ARN cannot be resolved. Deploy `shared-layer` first. |
| S3 bucket still sending events | If `s3-firmware` is not deleted first, the resource-based policy attached to this function may prevent deletion. Run `delete-s3-firmware` before this workflow. |
