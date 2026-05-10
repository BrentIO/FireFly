# func-api-devices-backup-get

## Overview

Deploys the Lambda function that handles `GET /devices/{uuid}/backup`. Called by the Controller firmware to download an encrypted configuration backup from S3 for on-device decryption and restoration. Authenticates the request by verifying an ECDSA P-256 signature over SHA-256(nonce || timestamp). This route has **no** Cognito JWT authorizer — it is authenticated solely by the device's cryptographic signature.

## CloudFormation Stack

`firefly-func-api-devices-backup-get`

## CloudWatch Logs

| Setting | Value |
|---|---|
| Log group | `/aws/lambda/firefly-func-api-devices-backup-get` |
| Retention | 30 days |

## Dependencies

### Deploy Dependencies

| Workflow | Reason |
|---|---|
| [api-gateway](./api-gateway.md) | `ApiId` resolved from stack outputs |
| [dynamodb-devices](./dynamodb-devices.md) | Table must exist before the function is deployed and granted read access |
| [shared-layer](./shared-layer.md) | Lambda layer must exist before function deployment |
| [s3-device-backups](./s3-device-backups.md) | S3 bucket must exist before the function is deployed and granted get access |

### Delete Dependencies

None — this workflow has no prerequisites.

## Required By

### Required By Deploy

| Workflow | Reason |
|---|---|
| [run-integration-tests](./integration-tests.md) | Endpoint must be live before integration tests run |

### Required By Delete

| Workflow | Reason |
|---|---|
| [delete-api-gateway](./api-gateway.md) | Route registration must be removed before the API Gateway stack is deleted |
| [delete-dynamodb-devices](./dynamodb-devices.md) | IAM permissions referencing the table must be removed first |
| [delete-shared-layer](./shared-layer.md) | Layer reference must be removed before the layer stack is deleted |
| [delete-s3-device-backups](./s3-device-backups.md) | IAM permissions referencing the bucket must be removed first |

## IAM Permissions

The Lambda execution role (`firefly-func-api-devices-backup-get-role`) is granted:

- `dynamodb:GetItem` on `firefly-devices`
- `s3:GetObject` on the device backups bucket
- `appconfig:StartConfigurationSession`, `appconfig:GetLatestConfiguration` on `*`

## Deploy Workflow

### Description

Resolves the HTTP API Gateway ID, shared layer ARN, and AppConfig extension layer ARN from CloudFormation stack outputs. Installs `cryptography`, `cffi`, and `pycparser` as arm64 binary dependencies alongside the Lambda source, then performs a SAM deploy.

### Steps

1. Configure AWS credentials.
2. Look up `ApiId` from the `firefly-api-gateway` stack output.
3. Look up `SharedLayerArn` from the `firefly-shared-layer` stack output.
4. Look up `AppConfigExtensionLayerArn` from the `firefly-shared-layer` stack output.
5. Install Python arm64 dependencies into `lambdas/func-api-devices-backup-get/`.
6. SAM deploy `firefly-func-api-devices-backup-get` with parameters:
   - `ApiId`
   - `SharedLayerArn`
   - `AppConfigExtensionLayerArn`
   - `BackupBucketName`

## Delete Workflow

### Description

Calls `sam delete` to remove the Lambda function, its IAM role, and the API Gateway route integration. Also deletes the CloudWatch log group.

### Steps

1. Configure AWS credentials.
2. SAM delete `firefly-func-api-devices-backup-get`.
3. Delete CloudWatch log group `/aws/lambda/firefly-func-api-devices-backup-get`.

## Failure Scenarios

| Scenario | Behavior |
|---|---|
| `firefly-api-gateway` stack not found | `describe-stacks` returns an error; workflow fails before SAM deploy. Deploy `api-gateway` first. |
| `firefly-dynamodb-devices` stack not deployed | Function deploys but returns errors at runtime. Deploy `dynamodb-devices` first. |
| `firefly-shared-layer` stack not found | Layer ARN lookup fails; SAM deploy is not attempted. Deploy `shared-layer` first. |
| `firefly-s3-device-backups` stack not deployed | Function deploys but S3 operations fail at runtime. Deploy `s3-device-backups` first. |
| Device UUID not found | Lambda returns `401 Unauthorized`. |
| Timestamp outside ±500 ms window | Lambda returns `401 Unauthorized`. |
| Invalid or mismatched signature | Lambda returns `401 Unauthorized`. |
| No backup stored for device | Lambda returns `404 Not Found`. |
