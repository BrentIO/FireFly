# func-api-users-patch

## Overview

Deploys the Lambda function that handles `PATCH /users/{user_id}`. Manages Cognito group membership (e.g., adding or removing a user from the `super_users` group). The route is authenticated via the Cognito JWT authorizer.

## CloudFormation Stack

`firefly-func-api-users-patch`

## Dependencies

### Deploy Dependencies

| Workflow | Reason |
|---|---|
| [api-gateway](./api-gateway.md) | `ApiId` and `AuthorizerId` resolved from stack outputs |
| [cognito](./cognito.md) | Authorizer is created as part of the api-gateway stack, which depends on Cognito; function requires Cognito User Pool access |

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

Resolves the HTTP API Gateway ID and JWT Authorizer ID from the `firefly-api-gateway` stack outputs, then performs a SAM build and deploy. The function is granted `cognito-idp:AdminAddUserToGroup` and `cognito-idp:AdminRemoveUserFromGroup` on the Cognito User Pool.

### Steps

1. Configure AWS credentials.
2. Look up `ApiId` from the `firefly-api-gateway` stack output.
3. Look up `AuthorizerId` from the `firefly-api-gateway` stack output.
4. SAM build.
5. SAM deploy `firefly-func-api-users-patch` with parameters:
   - `ApiId`
   - `AuthorizerId`

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
| Cognito User Pool not deployed | Function deploys successfully but cannot manage group membership at runtime. Deploy `cognito` first. |
