# func-api-appconfig-patch

## Overview

Deploys the Lambda function that handles three routes on the **Configuration** page:

- `PATCH /appconfig/{function_name}` — stage a new configuration version for a specific Lambda function (does **not** deploy automatically)
- `POST /appconfig/{function_name}/deploy` — deploy the latest staged version for a function to the current environment
- `DELETE /appconfig/{function_name}` — remove the AppConfig application entirely, reverting the function to the default WARNING log level

Each Lambda function has its own independent AppConfig application. Configuration is stored as a JSON object (`{"logging": "WARNING"}`) and can carry additional keys for future feature flags. All routes are authenticated via the Cognito JWT authorizer and restricted to super users.

## CloudFormation Stack

`firefly-func-api-appconfig-patch`

## CloudWatch Logs

| Setting | Value |
|---|---|
| Log group | `/aws/lambda/firefly-func-api-appconfig-patch` |
| Retention | 30 days |

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

The Lambda execution role (`firefly-func-api-appconfig-patch-role`) is granted the following permissions on `*`:

- `appconfig:ListApplications`
- `appconfig:ListEnvironments`
- `appconfig:ListConfigurationProfiles`
- `appconfig:ListHostedConfigurationVersions`
- `appconfig:CreateApplication`
- `appconfig:CreateEnvironment`
- `appconfig:CreateConfigurationProfile`
- `appconfig:CreateHostedConfigurationVersion`
- `appconfig:ListDeployments`
- `appconfig:StartDeployment`
- `appconfig:DeleteApplication`
- `appconfig:DeleteEnvironment`
- `appconfig:DeleteConfigurationProfile`
- `appconfig:DeleteHostedConfigurationVersion`
- `lambda:GetFunction`

> **IAM note:** `lambda:GetFunction` is required to validate that the target function exists before creating an AppConfig application for it.

## Deploy Workflow

### Description

Resolves the HTTP API Gateway ID and JWT Authorizer ID from the `firefly-api-gateway` stack outputs, then performs a SAM build and deploy.

### Steps

1. Configure AWS credentials.
2. Look up `ApiId` from the `firefly-api-gateway` stack output.
3. Look up `AuthorizerId` from the `firefly-api-gateway` stack output.
4. SAM deploy `firefly-func-api-appconfig-patch` with parameters:
   - `ApiId`
   - `AuthorizerId`
   - `EnvironmentName`

### Sequence Diagram

[![Deploy Sequence](./images/deploy-func-api-appconfig-patch.svg)](./images/deploy-func-api-appconfig-patch.svg)

## Delete Workflow

### Description

Calls `sam delete` to remove the Lambda function and its associated IAM role and API Gateway route integrations.

### Steps

1. Configure AWS credentials.
2. SAM delete `firefly-func-api-appconfig-patch`.

### Sequence Diagram

[![Delete Sequence](./images/delete-func-api-appconfig-patch.svg)](./images/delete-func-api-appconfig-patch.svg)

## Failure Scenarios

| Scenario | Behavior |
|---|---|
| `firefly-api-gateway` stack not found | `describe-stacks` returns an error; workflow fails before SAM deploy is attempted. Deploy `api-gateway` first. |
| Authorizer ID lookup fails | Deploy fails; the JWT authorizer is created by the `api-gateway` stack — redeploy `api-gateway` to restore it. |
| Function name not found (`PATCH`) | Lambda returns `404 Not Found`. |
| Function name does not start with `firefly-func-` | Lambda returns `400 Bad Request`. |
| Invalid log level in request body | Lambda returns `400 Bad Request` with details. |
| No staged version exists (`POST /deploy`) | Lambda returns `404 Not Found`. |
| AppConfig deployment already in progress (`POST /deploy`) | Lambda returns `409 Conflict`. Wait for the current deployment to complete before retrying. |
| AppConfig application not found (`DELETE`) | Lambda returns `404 Not Found`. |
| Deployment in progress (`DELETE`) | Lambda returns `409 Conflict`. Wait for the current deployment to complete before deleting. |
| Caller is not a super user | Lambda returns `403 Forbidden`. |
