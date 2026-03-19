# cognito

## Overview

Provisions the Cognito User Pool with Google IdP federation, a custom auth domain, a pre-signup Lambda trigger, and app client configuration for the web UI. The deploy workflow is the most complex in the suite: it handles `ROLLBACK_COMPLETE` recovery, a Route 53 workaround required for Cognito custom domain validation, and post-deploy Route 53 alias creation. The delete workflow explicitly removes the retained User Pool that CloudFormation leaves behind.

## CloudFormation Stack

`firefly-cognito`

## Dependencies

### Deploy

- `acm-cognito` — provides `CertificateArn` for the Cognito custom domain
- `func-cognito-pre-signup` — provides `PreSignUpLambdaArn` for the User Pool trigger

### Delete

- `delete-api-gateway` — API Gateway JWT authorizer references the User Pool; must be deleted first

## Required By

### Deploy

- `api-gateway` — uses `CognitoUserPoolId` and `CognitoUserPoolClientId` outputs for the JWT authorizer
- `func-api-users-get` — needs Cognito for user lookup
- `func-api-users-delete` — needs Cognito for user deletion
- `func-api-users-patch` — needs Cognito for user updates
- `ui-app` — needs User Pool Client ID for UI auth configuration

### Delete

- `delete-func-cognito-pre-signup`
- `delete-acm-cognito`

---

## Deploy Workflow

### Description

The deploy workflow follows a multi-phase process to handle Cognito's unique requirements:

1. **ARN lookups** — Resolve `CertificateArn` and `PreSignUpLambdaArn` from their respective stacks before any mutation begins.
2. **ROLLBACK_COMPLETE recovery** — If the stack is in `ROLLBACK_COMPLETE`, delete it and wait for `DELETE_COMPLETE` before proceeding.
3. **Orphaned pool cleanup** — Any `firefly-user-pool` pools not currently tracked by the active stack are deleted (including their custom domains). This prevents quota exhaustion from failed previous deploys.
4. **Diagnostic check** — Log the current Cognito custom domain status (informational only; `continue-on-error`).
5. **Route 53 parent domain workaround** — Cognito requires the parent domain to have an A record before it will accept a custom domain. If the A record is missing, a temporary `1.2.3.4` placeholder is created. This record is removed after deploy.
6. **CloudFormation deploy** — Deploys the User Pool with Google IdP, custom domain, pre-signup trigger, and app client. CloudFormation events are printed on failure for diagnostics.
7. **Route 53 alias creation** — After the stack deploys, the Cognito custom domain resolves to a CloudFront distribution managed by Cognito. An ALIAS record must be created manually because Cognito cannot manage Route 53 records itself.
8. **Temporary A record removal** — If step 5 created a temporary A record, it is deleted now.

### Steps

1. Checkout repository
2. Configure AWS credentials
3. Lookup `CertificateArn` from `firefly-acm-cognito` stack output
4. Lookup `PreSignUpLambdaArn` from `firefly-func-cognito-pre-signup` stack output
5. Check stack status — if `ROLLBACK_COMPLETE`, delete stack and wait
6. Delete orphaned `firefly-user-pool` pools not tracked by the active stack
7. Diagnose existing Cognito domain (informational, `continue-on-error`)
8. Check Route 53 for parent domain A record; create temporary `1.2.3.4` A record if missing
9. `aws cloudformation deploy` — stack: `firefly-cognito`; params: `AuthDomainName`, `CertificateArn`, `GoogleClientId`, `GoogleClientSecret`, `UiCallbackUrl`, `UiLogoutUrl`, `PreSignUpLambdaArn`; print stack events on failure
10. Create Route 53 ALIAS record: `AuthDomainName` → Cognito CloudFront domain (from `describe-user-pool-domain`)
11. Delete temporary A record if it was created in step 8

### Sequence Diagram

[![Deploy cognito sequence](./images/deploy-cognito.svg)](./images/deploy-cognito.svg)

---

## Delete Workflow

### Description

The delete workflow must undo the Route 53 alias that was created outside CloudFormation, delete the stack, and then explicitly delete the retained User Pool. CloudFormation sets the User Pool resource with `DeletionPolicy: Retain` to prevent accidental data loss; the workflow calls `aws cognito-idp delete-user-pool` explicitly to clean it up.

### Steps

1. Configure AWS credentials
2. Lookup `UserPoolId` from `firefly-cognito` stack output and `CloudFrontDistribution` from `describe-user-pool-domain`
3. If a CloudFront distribution is present, delete the Route 53 ALIAS record for `AuthDomainName`
4. `aws cloudformation delete-stack --stack-name firefly-cognito` and wait for `DELETE_COMPLETE`
5. Delete all remaining `firefly-user-pool` pools by name (including their custom domains) — handles the `DeletionPolicy: Retain` that CloudFormation leaves behind

### Sequence Diagram

[![Delete cognito sequence](./images/delete-cognito.svg)](./images/delete-cognito.svg)

---

## Failure Scenarios

| Scenario | Cause | Resolution |
|---|---|---|
| Stack in `ROLLBACK_COMPLETE` | Previous deploy failed and left stack in terminal state | Detected and handled automatically — stack is deleted before re-deploy |
| Parent domain missing A record | Cognito rejects custom domain if parent domain has no A record | Handled automatically — temporary `1.2.3.4` A record is created and removed after deploy |
| Route 53 alias creation fails | `aws route53 change-resource-record-sets` call fails post-deploy | Cognito custom domain won't resolve; API Gateway JWT validation will fail at runtime. Fix the Route 53 record manually and re-run the workflow. |
| Cognito domain already taken | Another Cognito pool in any AWS account owns the subdomain (globally unique) | Choose a different subdomain; cannot reclaim a domain owned by another account |
| User Pool not cleaned up after stack deletion | Manual delete step fails if User Pool was already deleted externally | Script handles `ResourceNotFoundException` gracefully and exits 0 |
