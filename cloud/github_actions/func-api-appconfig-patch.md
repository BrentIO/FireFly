# func-api-appconfig-patch

## Overview

Deploys the Lambda function that handles `PATCH /appconfig/{application}`. Accepts a replacement logging rules array for the named AppConfig application, creates a new hosted configuration version, and immediately deploys it using the `AppConfig.AllAtOnce` deployment strategy. The route is authenticated via the Cognito JWT authorizer and restricted to super users.

## CloudFormation Stack

`firefly-func-api-appconfig-patch`

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

The Lambda execution role (`firefly-func-api-appconfig-patch-role`) is granted the following AppConfig write permissions on `*`:

- `appconfig:ListApplications`
- `appconfig:ListEnvironments`
- `appconfig:ListConfigurationProfiles`
- `appconfig:CreateHostedConfigurationVersion`
- `appconfig:StartDeployment`

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

## Delete Workflow

### Description

Runs `sam delete` to remove the `firefly-func-api-appconfig-patch` stack.

### Steps

1. Configure AWS credentials.
2. `sam delete --stack-name firefly-func-api-appconfig-patch --no-prompts`
