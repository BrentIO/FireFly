# func-api-firmware-status-patch

## Overview

Manages the Lambda function that handles authenticated firmware status transitions via `PATCH /firmware/{zip_name}/status`. Drives the release state machine: `READY_TO_TEST` → `TESTING` → `RELEASED` → `REVOKED`. When transitioning to `RELEASED`, the function copies binaries to the public S3 bucket. When transitioning to `REVOKED`, it moves the public-bucket object to the `revoked/` prefix and sets a TTL.

## CloudFormation Stack

`firefly-func-api-firmware-status-patch`

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
| run-integration-tests | Status-patch endpoint must exist before integration tests run |

### Required By Delete

| Workflow | Reason |
|---|---|
| [api-gateway](./api-gateway.md) | All Lambda integrations must be removed before the API Gateway stack can be deleted |
| [shared-layer](./shared-layer.md) | Layer cannot be deleted while functions still reference it |

## Deploy Workflow

### Description

Looks up the API Gateway ID and the Cognito JWT Authorizer ID from the `firefly-api-gateway` stack outputs, then builds and deploys the function. The route is protected by the Cognito JWT authorizer.

### Steps

1. Configure AWS credentials.
2. Look up `ApiId` and `AuthorizerId` from the `firefly-api-gateway` stack outputs.
3. SAM build.
4. SAM deploy with parameters:
   - `ApiId`
   - `AuthorizerId`
   - `DynamoDbFirmwareTableName` (from vars)
   - `FirmwarePrivateBucketName` (from secrets)
   - `FirmwarePublicBucketName` (from secrets)
   - `EnvironmentName` (target environment)

**State machine transitions handled:**

| Transition | Side Effect |
|---|---|
| → `RELEASED` | Copies firmware binaries to public S3 bucket |
| → `REVOKED` | Moves public S3 object to `revoked/` prefix; sets DynamoDB TTL |

### Sequence Diagram

[![Deploy Sequence](./images/deploy-func-api-firmware-status-patch.svg)](./images/deploy-func-api-firmware-status-patch.svg)

## Delete Workflow

### Description

Runs `sam delete` to remove the CloudFormation stack and the Lambda function.

### Steps

1. Configure AWS credentials.
2. SAM delete `firefly-func-api-firmware-status-patch`.

### Sequence Diagram

[![Delete Sequence](./images/delete-func-api-firmware-status-patch.svg)](./images/delete-func-api-firmware-status-patch.svg)

## Failure Scenarios

| Scenario | Behavior |
|---|---|
| Authorizer ID lookup fails | `describe-stacks` returns an error or the output key is absent; workflow fails. The `api-gateway` stack must be fully deployed with the Cognito JWT authorizer before this workflow runs. |
| Public S3 bucket secret missing | Function deploys successfully but the `RELEASED` transition fails at runtime when attempting to copy to the public bucket. |
