# api-gateway

## Overview

Provisions the HTTP API Gateway with a custom domain, a Cognito JWT authorizer, and CORS configuration. All `func-api-*` Lambda functions are integrated into this API. A post-deploy step configures CORS via the API Gateway v2 `update-api` call since SAM does not expose all CORS parameters.

## CloudFormation Stack

`firefly-api-gateway`

## Dependencies

### Deploy

- `acm` — provides `CertificateArn` for the custom domain
- `cognito` — provides `CognitoUserPoolId` and `CognitoUserPoolClientId` for the JWT authorizer

### Delete

- All `delete-func-api-*` jobs (10 total) — all Lambda function integrations must be removed before the API Gateway stack can be deleted

## Required By

### Deploy

All `func-api-*` workflows (11 functions): `func-api-health-get`, `func-api-users-get`, `func-api-users-post`, `func-api-users-delete`, `func-api-users-patch`, `func-api-firmware-get`, `func-api-firmware-status-patch`, `func-api-firmware-delete`, `func-api-ota-get`, `func-api-firmware-download-get`

### Delete

- `delete-acm`
- `delete-cognito`

---

## Deploy Workflow

### Description

Looks up the `CertificateArn` from `firefly-acm` and the Cognito pool outputs from `firefly-cognito`, then deploys the `firefly-api-gateway` CloudFormation stack. After the stack reaches `CREATE_COMPLETE` or `UPDATE_COMPLETE`, a separate step calls `aws apigatewayv2 update-api` to configure CORS. These two steps are not atomic — a CORS update failure leaves the API deployed but misconfigured.

### Steps

1. Checkout repository
2. Configure AWS credentials
3. Install SAM CLI
4. Lookup `CertificateArn` from `firefly-acm` stack output
5. Lookup `CognitoUserPoolId` and `CognitoUserPoolClientId` from `firefly-cognito` stack outputs
6. `sam build` — template: `templates/api-gateway.yaml`
7. `sam deploy` — stack: `firefly-api-gateway`; params: `ApiDomainName`, `CertificateArn`, `HostedZoneId`, `UiOrigin`, `CognitoUserPoolId`, `CognitoUserPoolClientId`; capabilities: `CAPABILITY_IAM CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND`
8. `aws apigatewayv2 update-api` — CORS config: `AllowOrigins` (UI domain), `AllowMethods` (GET/POST/PUT/PATCH/DELETE/OPTIONS), `AllowHeaders` (Content-Type, Authorization), `MaxAge` 300

### Sequence Diagram

[![Deploy api-gateway sequence](./images/deploy-api-gateway.svg)](./images/deploy-api-gateway.svg)

---

## Delete Workflow

### Description

Deletes the `firefly-api-gateway` CloudFormation stack, removing the HTTP API, custom domain, and Route 53 alias record. All Lambda function stacks that integrate with this API must be deleted first.

### Steps

1. Configure AWS credentials
2. Install SAM CLI
3. `sam delete --stack-name firefly-api-gateway --no-prompts --region`

### Sequence Diagram

[![Delete api-gateway sequence](./images/delete-api-gateway.svg)](./images/delete-api-gateway.svg)

---

## Failure Scenarios

| Scenario | Cause | Resolution |
|---|---|---|
| Cognito stack not deployed or outputs missing | `firefly-cognito` stack not present; lookup returns empty values | Deploy `cognito` first |
| CORS update fails after successful SAM deploy | `aws apigatewayv2 update-api` call fails; API is deployed but CORS is not configured | Re-run the workflow — SAM deploy is idempotent and the CORS step will retry |
| `DELETE_FAILED` — Lambda integrations still exist | One or more `delete-func-api-*` jobs did not complete before this job ran | Verify all dependent function stacks are deleted, then re-run |
| `ROLLBACK_COMPLETE` on deploy | Template error or invalid parameter | Check CloudFormation stack events for the root cause; delete the stack manually if necessary, then re-run |

## CloudWatch Logs

The `firefly-func-api-options-handler` Lambda function created by this stack writes logs to:

| Log Group | Retention |
|---|---|
| `/aws/lambda/firefly-func-api-options-handler` | 30 days |
