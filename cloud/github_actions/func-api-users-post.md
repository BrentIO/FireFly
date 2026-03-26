# func-api-users-post

## Overview

Deploys the Lambda function that handles `POST /users`. Adds a user to the DynamoDB allowlist table as an invitation, permitting that email address through the Cognito pre-signup check. The route is authenticated via the Cognito JWT authorizer.

## CloudFormation Stack

`firefly-func-api-users-post`

## CloudWatch Logs

| Setting | Value |
|---|---|
| Log group | `/aws/lambda/firefly-func-api-users-post` |
| Retention | 30 days |

## Dependencies

### Deploy Dependencies

| Workflow | Reason |
|---|---|
| [api-gateway](./api-gateway.md) | `ApiId` and `AuthorizerId` resolved from stack outputs |
| [dynamodb-users](./dynamodb-users.md) | Table must exist before function is deployed and granted write access |

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

Resolves the HTTP API Gateway ID and JWT Authorizer ID from the `firefly-api-gateway` stack outputs, then performs a SAM build and deploy. The function is granted write access to the DynamoDB users table.

### Steps

1. Configure AWS credentials.
2. Look up `ApiId` from the `firefly-api-gateway` stack output.
3. Look up `AuthorizerId` from the `firefly-api-gateway` stack output.
4. SAM build.
5. SAM deploy `firefly-func-api-users-post` with parameters:
   - `ApiId`
   - `AuthorizerId`

### Sequence Diagram

[![Deploy Sequence](./images/deploy-func-api-users-post.svg)](./images/deploy-func-api-users-post.svg)

## Delete Workflow

### Description

Calls `sam delete` to remove the Lambda function and its associated IAM role and API Gateway route integration.

### Steps

1. Configure AWS credentials.
2. SAM delete `firefly-func-api-users-post`.

### Sequence Diagram

[![Delete Sequence](./images/delete-func-api-users-post.svg)](./images/delete-func-api-users-post.svg)

## Failure Scenarios

| Scenario | Behavior |
|---|---|
| `firefly-api-gateway` stack not found | `describe-stacks` returns an error; workflow fails before SAM deploy is attempted. Deploy `api-gateway` first. |
| Authorizer ID lookup fails | Deploy fails; the JWT authorizer is created by the `api-gateway` stack — redeploy `api-gateway` to restore it. |
| DynamoDB users table not deployed | Function deploys successfully but returns errors at runtime when writing to the table. Deploy `dynamodb-users` first. |
