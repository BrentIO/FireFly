# acm

## Overview

Provisions a single ACM TLS certificate used by API Gateway (custom domain), both CloudFront distributions, and the Cognito custom authentication domain. The certificate must be in `us-east-1` to satisfy CloudFront and Cognito requirements; API Gateway is also deployed in `us-east-1`.

## CloudFormation Stack

`firefly-acm`

## Dependencies

### Deploy

None — this workflow has no prerequisites.

### Delete

- `delete-api-gateway` — API Gateway custom domain must be deleted before the certificate can be released
- `delete-cloudfront-firmware` — CloudFront firmware distribution must be deleted first
- `delete-cloudfront-ui` — CloudFront UI distribution must be deleted first
- `delete-cognito` — Cognito User Pool custom domain must be removed before the certificate can be deleted

## Required By

### Deploy

- `cloudfront-firmware` — uses the `CertificateArn` output for the firmware CloudFront distribution
- `cloudfront-ui` — uses the `CertificateArn` output for the UI CloudFront distribution
- `api-gateway` — uses the `CertificateArn` output for the API custom domain
- `cognito` — uses the `CertificateArn` output for the Cognito User Pool custom domain

### Delete

None.

---

## Deploy Workflow

### Description

Builds the SAM template and deploys the `firefly-acm` CloudFormation stack. ACM validates the certificate via DNS by creating a CNAME record in the Route 53 hosted zone. The stack blocks until the certificate reaches the `ISSUED` state, which requires DNS propagation — allow up to 30 minutes on first deploy.

The stack exports `CertificateArn`, which is read by downstream workflows using `aws cloudformation describe-stacks`.

### Steps

1. Checkout repository
2. Configure AWS credentials (`us-east-1` required)
3. Install SAM CLI
4. `sam build` — template: `templates/acm.yaml`
5. `sam deploy` — stack: `firefly-acm`; params: `CertificateDomainName` (from `vars.CERTIFICATE_DOMAIN_NAME`), `HostedZoneId` (from secrets)

### Sequence Diagram

[![Deploy acm sequence](./images/deploy-acm.svg)](./images/deploy-acm.svg)

---

## Delete Workflow

### Description

Deletes the `firefly-acm` CloudFormation stack and the ACM certificate it manages. Must run only after all resources using the certificate (API Gateway custom domain, both CloudFront distributions, and the Cognito custom domain) have been deleted.

### Steps

1. Configure AWS credentials (`us-east-1` required)
2. Install SAM CLI
3. `sam delete --stack-name firefly-acm --no-prompts --region us-east-1`

### Sequence Diagram

[![Delete acm sequence](./images/delete-acm.svg)](./images/delete-acm.svg)

---

## Failure Scenarios

| Scenario | Cause | Resolution |
|---|---|---|
| Certificate DNS validation timeout | ACM waits up to 30 minutes for Route 53 CNAME to propagate; stack rolls back if validation does not complete | Verify the Route 53 hosted zone ID is correct and the domain is delegated properly; re-run the workflow |
| Stack in `ROLLBACK_COMPLETE` | A previous failed deploy left the stack in a terminal state | Manually delete the stack in the AWS Console or via CLI, then re-run |
| `DELETE_FAILED` — certificate still in use | Certificate is still associated with a CloudFront distribution, API Gateway custom domain, or Cognito User Pool custom domain | Ensure `delete-cloudfront-firmware`, `delete-cloudfront-ui`, `delete-api-gateway`, and `delete-cognito` all completed successfully before re-running delete |
