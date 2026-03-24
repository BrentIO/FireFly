# func-api-appconfig-post

## Overview

Deploys the Lambda function that handles `POST /appconfig`. Powers the **Configuration** page "Add Application" action in the management UI. Creates a new AWS AppConfig application with a `logging` configuration profile, an environment matching the current deployment environment, an initial hosted configuration version, and immediately deploys it using the `AppConfig.AllAtOnce` deployment strategy. The route is authenticated via the Cognito JWT authorizer and restricted to super users.

## CloudFormation Stack

`firefly-func-api-appconfig-post`

## Dependencies

### Deploy Dependencies

| Workflow | Reason |
|---|---|
| [api-gateway](./api-gateway.md) | `ApiId` and `AuthorizerId` resolved from stack outputs |

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

## IAM Permissions

The Lambda execution role (`firefly-func-api-appconfig-post-role`) is granted the following AppConfig permissions on `*`:

- `appconfig:ListApplications`
- `appconfig:CreateApplication`
- `appconfig:CreateEnvironment`
- `appconfig:CreateConfigurationProfile`
- `appconfig:CreateHostedConfigurationVersion`
- `appconfig:StartDeployment`

No manual policy changes are required — the CloudFormation execution role already has `iam:PutRolePolicy` on `arn:aws:iam::*:role/firefly-func-*`, which covers creating this inline policy automatically during deployment.

## Deploy Workflow

### Description

Resolves the HTTP API Gateway ID and JWT Authorizer ID from the `firefly-api-gateway` stack outputs, then performs a SAM build and deploy.

### Steps

1. Configure AWS credentials.
2. Look up `ApiId` from the `firefly-api-gateway` stack output.
3. Look up `AuthorizerId` from the `firefly-api-gateway` stack output.
4. SAM deploy `firefly-func-api-appconfig-post` with parameters:
   - `ApiId`
   - `AuthorizerId`
   - `EnvironmentName`

### Sequence Diagram

[![Deploy Sequence](./images/deploy-func-api-appconfig-post.svg)](./images/deploy-func-api-appconfig-post.svg)

## Delete Workflow

### Description

Calls `sam delete` to remove the Lambda function and its associated IAM role and API Gateway route integration.

### Steps

1. Configure AWS credentials.
2. SAM delete `firefly-func-api-appconfig-post`.

### Sequence Diagram

[![Delete Sequence](./images/delete-func-api-appconfig-post.svg)](./images/delete-func-api-appconfig-post.svg)

## Failure Scenarios

| Scenario | Behavior |
|---|---|
| `firefly-api-gateway` stack not found | `describe-stacks` returns an error; workflow fails before SAM deploy is attempted. Deploy `api-gateway` first. |
| Authorizer ID lookup fails | Deploy fails; the JWT authorizer is created by the `api-gateway` stack — redeploy `api-gateway` to restore it. |
| Application name already exists in AppConfig | Lambda returns `409 Conflict`. |
| Invalid log level in request body | Lambda returns `400 Bad Request` with details. |
| Caller is not a super user | Lambda returns `403 Forbidden`. |
