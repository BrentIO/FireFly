# func-api-health-get

## Overview

Manages the Lambda function that serves the `GET /health` endpoint. Returns `200 OK` unconditionally. Used by monitoring and integration test suites to confirm the API Gateway and Lambda integration are operational.

## CloudFormation Stack

`firefly-func-api-health-get`

## CloudWatch Logs

| Setting | Value |
|---|---|
| Log group | `/aws/lambda/firefly-func-api-health-get` |
| Retention | 30 days |

## Dependencies

### Deploy Dependencies

| Workflow | Reason |
|---|---|
| [api-gateway](./api-gateway.md) | API Gateway ID required as SAM parameter |

### Delete Dependencies

None — this workflow has no prerequisites.

## Required By

### Required By Deploy

| Workflow | Reason |
|---|---|
| run-integration-tests | Health endpoint must exist before integration tests run |

### Required By Delete

| Workflow | Reason |
|---|---|
| [api-gateway](./api-gateway.md) | All Lambda integrations must be removed before the API Gateway stack can be deleted |

## Deploy Workflow

### Description

Looks up the API Gateway ID from the `firefly-api-gateway` stack output, then builds and deploys the function. The function is wired to the `GET /health` route with no authorizer.

### Steps

1. Configure AWS credentials.
2. Look up `ApiId` from the `firefly-api-gateway` stack output.
3. SAM build.
4. SAM deploy with parameters:
   - `ApiId`

### Sequence Diagram

[![Deploy Sequence](./images/deploy-func-api-health-get.svg)](./images/deploy-func-api-health-get.svg)

## Delete Workflow

### Description

Runs `sam delete` to remove the CloudFormation stack and the Lambda function.

### Steps

1. Configure AWS credentials.
2. SAM delete `firefly-func-api-health-get`.

### Sequence Diagram

[![Delete Sequence](./images/delete-func-api-health-get.svg)](./images/delete-func-api-health-get.svg)

## Failure Scenarios

| Scenario | Behavior |
|---|---|
| API Gateway stack not deployed | `describe-stacks` call fails; workflow fails before SAM deploy is attempted. Deploy `api-gateway` first. |
| Route already registered by another function | CloudFormation fails to create the `GET /health` route integration. Verify no other stack owns this route. |
