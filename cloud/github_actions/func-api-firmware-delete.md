# func-api-firmware-delete

## Overview

Manages the Lambda function that handles authenticated firmware deletion via `DELETE /firmware/{zip_name}`. Returns `409 Conflict` if the record's `release_status` is `RELEASED` (must be revoked first). Deletes the object from the private S3 bucket, which asynchronously triggers `func-s3-firmware-deleted` to mark the DynamoDB record `DELETED`.

## CloudFormation Stack

`firefly-func-api-firmware-delete`

## CloudWatch Logs

| Setting | Value |
|---|---|
| Log group | `/aws/lambda/firefly-func-api-firmware-delete` |
| Retention | 30 days |

## Dependencies

### Deploy Dependencies

| Workflow | Reason |
|---|---|
| [api-gateway](./api-gateway.md) | API Gateway ID and Cognito JWT Authorizer ID required as SAM parameters |
| [shared-layer](./shared-layer.md) | Lambda layer ARN must be resolvable at SAM build/deploy time |

### Delete Dependencies

None — this workflow has no prerequisites.

## Required By

### Required By Deploy

| Workflow | Reason |
|---|---|
| run-integration-tests | Firmware delete endpoint must exist before integration tests run |

### Required By Delete

| Workflow | Reason |
|---|---|
| [api-gateway](./api-gateway.md) | All Lambda integrations must be removed before the API Gateway stack can be deleted |
| [shared-layer](./shared-layer.md) | Layer cannot be deleted while functions still reference it |

## Deploy Workflow

### Description

Looks up the API Gateway ID and Cognito JWT Authorizer ID from the `firefly-api-gateway` stack outputs, then builds and deploys the function. The route is protected by the Cognito JWT authorizer.

### Steps

1. Configure AWS credentials.
2. Look up `ApiId` and `AuthorizerId` from the `firefly-api-gateway` stack outputs.
3. SAM build.
4. SAM deploy with parameters:
   - `ApiId`
   - `AuthorizerId`
   - `FirmwarePrivateBucketName` (from secrets)
   - `FirmwarePublicBucketName` (from secrets)

### Sequence Diagram

[![Deploy Sequence](./images/deploy-func-api-firmware-delete.svg)](./images/deploy-func-api-firmware-delete.svg)

## Delete Workflow

### Description

Runs `sam delete` to remove the CloudFormation stack and the Lambda function.

### Steps

1. Configure AWS credentials.
2. SAM delete `firefly-func-api-firmware-delete`.

### Sequence Diagram

[![Delete Sequence](./images/delete-func-api-firmware-delete.svg)](./images/delete-func-api-firmware-delete.svg)

## Failure Scenarios

| Scenario | Behavior |
|---|---|
| Authorizer ID lookup fails | `describe-stacks` returns an error or the output key is absent; workflow fails. The `api-gateway` stack must be fully deployed with the Cognito JWT authorizer before this workflow runs. |
| Public S3 bucket secret missing | Function deploys successfully but S3 operations on the public bucket fail at runtime when processing `RELEASED` firmware. |
