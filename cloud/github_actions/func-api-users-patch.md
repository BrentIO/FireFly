# func-api-users-patch

## Overview

Deploys the Lambda function that handles `PATCH /users/{email}`. Updates a user's super user status (Cognito group membership) and/or environment access (DynamoDB record). The route is authenticated via the Cognito JWT authorizer.

## CloudFormation Stack

`firefly-func-api-users-patch`

## CloudWatch Logs

| Setting | Value |
|---|---|
| Log group | `/aws/lambda/firefly-func-api-users-patch` |
| Retention | 30 days |

## Dependencies

### Deploy Dependencies

| Workflow | Reason |
|---|---|
| [api-gateway](./api-gateway.md) | `ApiId` and `AuthorizerId` resolved from stack outputs |
| [cognito](./cognito.md) | Authorizer is created as part of the api-gateway stack, which depends on Cognito; function requires Cognito User Pool access |
| [dynamodb-users](./dynamodb-users.md) | `DynamoDbUsersTableName` resolved from stack outputs; function reads and updates the users table |

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

## Deploy Workflow

### Description

Resolves the HTTP API Gateway ID, JWT Authorizer ID, Cognito User Pool ID, and DynamoDB Users table name from their respective stack outputs, then performs a SAM build and deploy. The function is granted Cognito group management permissions and DynamoDB `GetItem`/`UpdateItem` on the users table.

### Steps

1. Configure AWS credentials.
2. Look up `ApiId` from the `firefly-api-gateway` stack output.
3. Look up `AuthorizerId` from the `firefly-api-gateway` stack output.
4. Look up `UserPoolId` from the `firefly-cognito` stack output.
5. Look up `UsersTableName` from the `firefly-dynamodb-users` stack output.
6. SAM build.
7. SAM deploy `firefly-func-api-users-patch` with parameters:
   - `ApiId`
   - `AuthorizerId`
   - `CognitoUserPoolId`
   - `DynamoDbUsersTableName`
   - `EnvironmentName`

### Sequence Diagram

[![Deploy Sequence](./images/deploy-func-api-users-patch.svg)](./images/deploy-func-api-users-patch.svg)

## Delete Workflow

### Description

Calls `sam delete` to remove the Lambda function and its associated IAM role and API Gateway route integration.

### Steps

1. Configure AWS credentials.
2. SAM delete `firefly-func-api-users-patch`.

### Sequence Diagram

[![Delete Sequence](./images/delete-func-api-users-patch.svg)](./images/delete-func-api-users-patch.svg)

## Failure Scenarios

| Scenario | Behavior |
|---|---|
| `firefly-api-gateway` stack not found | `describe-stacks` returns an error; workflow fails before SAM deploy is attempted. Deploy `api-gateway` first. |
| Authorizer ID lookup fails | Deploy fails; the JWT authorizer is created by the `api-gateway` stack — redeploy `api-gateway` to restore it. |
| `firefly-dynamodb-users` stack not found | `describe-stacks` returns an error; workflow fails before SAM deploy is attempted. Deploy `dynamodb-users` first. |
| Cognito User Pool not deployed | Function deploys successfully but cannot manage group membership at runtime. Deploy `cognito` first. |
