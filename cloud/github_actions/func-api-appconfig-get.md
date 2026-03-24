# func-api-appconfig-get

## Overview

Deploys the Lambda function that handles `GET /appconfig`. Powers the **Configuration** page in the management UI. Returns the current logging rules for the shared `firefly` AppConfig application. Returns `{"logging": []}` if the application does not yet exist. The route is authenticated via the Cognito JWT authorizer and restricted to super users.

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

### Sequence Diagram

[![Deploy Sequence](./images/deploy-func-api-appconfig-get.svg)](./images/deploy-func-api-appconfig-get.svg)

## Delete Workflow

### Description

Calls `sam delete` to remove the Lambda function and its associated IAM role and API Gateway route integration.

### Steps

1. Configure AWS credentials.
2. SAM delete `firefly-func-api-appconfig-get`.

### Sequence Diagram

[![Delete Sequence](./images/delete-func-api-appconfig-get.svg)](./images/delete-func-api-appconfig-get.svg)

## Failure Scenarios

| Scenario | Behavior |
|---|---|
| `firefly-api-gateway` stack not found | `describe-stacks` returns an error; workflow fails before SAM deploy is attempted. Deploy `api-gateway` first. |
| Authorizer ID lookup fails | Deploy fails; the JWT authorizer is created by the `api-gateway` stack — redeploy `api-gateway` to restore it. |
| `firefly` AppConfig application does not exist | Lambda returns `{"logging": []}` with a 200 status. |
| Caller is not a super user | Lambda returns `403 Forbidden`. |
