# func-api-firmware-get

## Overview

Manages the Lambda function that handles read operations against the firmware DynamoDB table. Serves two routes: `GET /firmware` (list all records, optional filters) and `GET /firmware/{zip_name}` (single full record). No authentication required.

## CloudFormation Stack

`firefly-func-api-firmware-get`

## CloudWatch Logs

| Setting | Value |
|---|---|
| Log group | `/aws/lambda/firefly-func-api-firmware-get` |
| Retention | 40 days |

## Dependencies

### Deploy Dependencies

| Workflow | Reason |
|---|---|
| [api-gateway](./api-gateway.md) | API Gateway ID required as SAM parameter |
| [shared-layer](./shared-layer.md) | Lambda layer ARN must be resolvable at SAM build/deploy time |

### Delete Dependencies

None — this workflow has no prerequisites.

## Required By

### Required By Deploy

| Workflow | Reason |
|---|---|
| run-integration-tests | Firmware list/get endpoints must exist before integration tests run |

### Required By Delete

| Workflow | Reason |
|---|---|
| [api-gateway](./api-gateway.md) | All Lambda integrations must be removed before the API Gateway stack can be deleted |
| [shared-layer](./shared-layer.md) | Layer cannot be deleted while functions still reference it |

## Deploy Workflow

### Description

Looks up the API Gateway ID from the `firefly-api-gateway` stack output, then builds and deploys the function. The function is wired to `GET /firmware` and `GET /firmware/{zip_name}` with no authorizer.

### Steps

1. Configure AWS credentials.
2. Look up `ApiId` from the `firefly-api-gateway` stack output.
3. SAM build.
4. SAM deploy with parameters:
   - `ApiId`
   - `DynamoDbFirmwareTableName` (from vars)

### Sequence Diagram

[![Deploy Sequence](./images/deploy-func-api-firmware-get.svg)](./images/deploy-func-api-firmware-get.svg)

## Delete Workflow

### Description

Runs `sam delete` to remove the CloudFormation stack and the Lambda function.

### Steps

1. Configure AWS credentials.
2. SAM delete `firefly-func-api-firmware-get`.

### Sequence Diagram

[![Delete Sequence](./images/delete-func-api-firmware-get.svg)](./images/delete-func-api-firmware-get.svg)

## Failure Scenarios

| Scenario | Behavior |
|---|---|
| API Gateway stack not deployed | `describe-stacks` call fails; workflow fails before SAM deploy is attempted. Deploy `api-gateway` first. |
| DynamoDB firmware table not deployed | Function deploys successfully but returns `500` at runtime when the table name resolves to a non-existent table. |
