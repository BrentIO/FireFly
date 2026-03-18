# acm-cognito

## Overview

Provisions an ACM TLS certificate for the Cognito custom authentication domain. Cognito custom domains require a certificate in `us-east-1`, regardless of the primary deployment region.

## CloudFormation Stack

`firefly-acm-cognito`

## Dependencies

### Deploy

None — this workflow has no prerequisites.

### Delete

- `delete-cognito` — the Cognito User Pool custom domain must be removed before the certificate can be deleted

## Required By

### Deploy

- `cognito` — uses the `CertificateArn` output when creating the Cognito User Pool custom domain

### Delete

None.

---

## Deploy Workflow

### Description

Builds the SAM template and deploys the `firefly-acm-cognito` CloudFormation stack. ACM validates the certificate via DNS by creating a CNAME record in the Route 53 hosted zone. The stack blocks until the certificate reaches `ISSUED` state — allow up to 30 minutes on first deploy.

The stack exports `CertificateArn`, which is read by the `cognito` workflow using `aws cloudformation describe-stacks`.

### Steps

1. Checkout repository
2. Configure AWS credentials (`us-east-1` required for Cognito domain certs)
3. Install SAM CLI
4. `sam build` — template: `templates/acm-cognito.yaml`
5. `sam deploy` — stack: `firefly-acm-cognito`; params: `CertificateDomainName` (from `vars.CERTIFICATE_DOMAIN_NAME`), `HostedZoneId` (from secrets); capabilities: `CAPABILITY_NAMED_IAM`

### Sequence Diagram

[![Deploy acm-cognito sequence](./images/deploy-acm-cognito.svg)](./images/deploy-acm-cognito.svg)

---

## Delete Workflow

### Description

Deletes the `firefly-acm-cognito` CloudFormation stack and its ACM certificate. Must run only after the Cognito User Pool custom domain has been removed.

### Steps

1. Configure AWS credentials
2. Install SAM CLI
3. `sam delete --stack-name firefly-acm-cognito --no-prompts --region`

### Sequence Diagram

[![Delete acm-cognito sequence](./images/delete-acm-cognito.svg)](./images/delete-acm-cognito.svg)

---

## Failure Scenarios

| Scenario | Cause | Resolution |
|---|---|---|
| Certificate DNS validation timeout | ACM waits up to 30 minutes for Route 53 CNAME to propagate | Verify the Route 53 hosted zone ID is correct and the domain is properly delegated; re-run |
| Stack in `ROLLBACK_COMPLETE` | A previous failed deploy left the stack in a terminal state | Manually delete the stack, then re-run |
| `DELETE_FAILED` — certificate still in use | Cognito User Pool custom domain still references the certificate | Ensure `delete-cognito` completed successfully before re-running delete |
