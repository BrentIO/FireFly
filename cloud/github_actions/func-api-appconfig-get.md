# func-api-appconfig-get

## Overview

Deploys the Lambda function that handles `GET /appconfig`. Returns all AppConfig applications that have a `logging` configuration profile in the current environment, along with each application's current logging rules. The route is authenticated via the Cognito JWT authorizer and restricted to super users.

## CloudFormation Stack

`firefly-func-api-appconfig-get`

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

The Lambda execution role (`firefly-func-api-appconfig-get-role`) is granted the following AppConfig read permissions on `*`:

- `appconfig:ListApplications`
- `appconfig:ListEnvironments`
- `appconfig:ListConfigurationProfiles`
- `appconfig:ListHostedConfigurationVersions`
- `appconfig:GetHostedConfigurationVersion`

## Deploy Workflow

### Description

Resolves the HTTP API Gateway ID and JWT Authorizer ID from the `firefly-api-gateway` stack outputs, then performs a SAM build and deploy.

### Steps

1. Configure AWS credentials.
2. Look up `ApiId` from the `firefly-api-gateway` stack output.
3. Look up `AuthorizerId` from the `firefly-api-gateway` stack output.
4. SAM deploy `firefly-func-api-appconfig-get` with parameters:
   - `ApiId`
   - `AuthorizerId`
   - `EnvironmentName`

## Delete Workflow

### Description

Runs `sam delete` to remove the `firefly-func-api-appconfig-get` stack.

### Steps

1. Configure AWS credentials.
2. `sam delete --stack-name firefly-func-api-appconfig-get --no-prompts`
