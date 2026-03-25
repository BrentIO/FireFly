# func-api-users-delete

## Overview

Deploys the Lambda function that handles `DELETE /users/{user_id}`. Removes a user from the DynamoDB allowlist table. The route is authenticated via the Cognito JWT authorizer.

## CloudFormation Stack

`firefly-func-api-users-delete`

## CloudWatch Logs

| Setting | Value |
|---|---|
| Log group | `/aws/lambda/firefly-func-api-users-delete` |
| Retention | 30 days |

## Dependencies

### Deploy Dependencies

| Workflow | Reason |
|---|---|
| [api-gateway](./api-gateway.md) | `ApiId` and `AuthorizerId` resolved from stack outputs |
| [cognito](./cognito.md) | Authorizer is created as part of the api-gateway stack, which depends on Cognito |
| [dynamodb-users](./dynamodb-users.md) | Table must exist before function is deployed and granted delete access |

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
| [delete-dynamodb-users](./dynamodb-users.md) | Resource-based permissions referencing the table must be removed first |

## Deploy Workflow

### Description

Resolves the HTTP API Gateway ID and JWT Authorizer ID from the `firefly-api-gateway` stack outputs, then performs a SAM build and deploy. The function is granted delete access to the DynamoDB users table.

### Steps

1. Configure AWS credentials.
2. Look up `ApiId` from the `firefly-api-gateway` stack output.
3. Look up `AuthorizerId` from the `firefly-api-gateway` stack output.
4. SAM build.
5. SAM deploy `firefly-func-api-users-delete` with parameters:
   - `ApiId`
   - `AuthorizerId`
   - `DynamoDbUsersTableName` (from secrets)

### Sequence Diagram

[![Deploy Sequence](./images/deploy-func-api-users-delete.svg)](./images/deploy-func-api-users-delete.svg)

## Delete Workflow

### Description

Calls `sam delete` to remove the Lambda function and its associated IAM role and API Gateway route integration.

### Steps

1. Configure AWS credentials.
2. SAM delete `firefly-func-api-users-delete`.

### Sequence Diagram

[![Delete Sequence](./images/delete-func-api-users-delete.svg)](./images/delete-func-api-users-delete.svg)

## Failure Scenarios

| Scenario | Behavior |
|---|---|
| `firefly-api-gateway` stack not found | `describe-stacks` returns an error; workflow fails before SAM deploy is attempted. Deploy `api-gateway` first. |
| Authorizer ID lookup fails | Deploy fails; the JWT authorizer is created by the `api-gateway` stack — redeploy `api-gateway` to restore it. |
| DynamoDB users table not deployed | Function deploys successfully but returns errors at runtime when attempting to delete from the table. Deploy `dynamodb-users` first. |
