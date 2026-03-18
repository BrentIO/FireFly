# acm-api-gateway

## Overview

Provisions an ACM TLS certificate used by API Gateway (custom domain), the firmware CloudFront distribution, and the UI CloudFront distribution. The certificate is requested in the region specified by the workflow; CloudFront requires `us-east-1`.

## CloudFormation Stack

`firefly-acm-api-gateway`

## Dependencies

### Deploy

None — this workflow has no prerequisites.

### Delete

- `delete-api-gateway` — API Gateway must be deleted before the certificate can be released
- `delete-cloudfront` — CloudFront firmware distribution must be deleted first
- `delete-cloudfront-ui` — CloudFront UI distribution must be deleted first

## Required By

### Deploy

- `cloudfront` — uses the `CertificateArn` output for the firmware CloudFront distribution
- `cloudfront-ui` — uses the `CertificateArn` output for the UI CloudFront distribution
- `api-gateway` — uses the `CertificateArn` output for the API custom domain

### Delete

None.

---

## Deploy Workflow

### Description

Builds the SAM template and deploys the `firefly-acm-api-gateway` CloudFormation stack. ACM validates the certificate via DNS by creating a CNAME record in the Route 53 hosted zone. The stack blocks until the certificate reaches the `ISSUED` state, which requires DNS propagation — allow up to 30 minutes on first deploy.

The stack exports `CertificateArn`, which is read by downstream workflows using `aws cloudformation describe-stacks`.

### Steps

1. Checkout repository
2. Configure AWS credentials
3. Install SAM CLI
4. `sam build` — template: `templates/acm-api-gateway.yaml`
5. `sam deploy` — stack: `firefly-acm-api-gateway`; params: `CertificateDomainName` (from `vars.CERTIFICATE_DOMAIN_NAME`), `HostedZoneId` (from secrets); capabilities: `CAPABILITY_NAMED_IAM`

### Sequence Diagram

[![Deploy acm-api-gateway sequence](./images/deploy-acm-api-gateway.svg)](./images/deploy-acm-api-gateway.svg)

---

## Delete Workflow

### Description

Deletes the `firefly-acm-api-gateway` CloudFormation stack and the ACM certificate it manages. Must run only after all resources using the certificate (API Gateway custom domain, both CloudFront distributions) have been deleted.

### Steps

1. Configure AWS credentials
2. Install SAM CLI
3. `sam delete --stack-name firefly-acm-api-gateway --no-prompts --region`

### Sequence Diagram

[![Delete acm-api-gateway sequence](./images/delete-acm-api-gateway.svg)](./images/delete-acm-api-gateway.svg)

---

## Failure Scenarios

| Scenario | Cause | Resolution |
|---|---|---|
| Certificate DNS validation timeout | ACM waits up to 30 minutes for Route 53 CNAME to propagate; stack rolls back if validation does not complete | Verify the Route 53 hosted zone ID is correct and the domain is delegated properly; re-run the workflow |
| Stack in `ROLLBACK_COMPLETE` | A previous failed deploy left the stack in a terminal state | Manually delete the stack in the AWS Console or via CLI, then re-run |
| `DELETE_FAILED` — certificate still in use | Certificate is still associated with a CloudFront distribution or API Gateway custom domain | Ensure `delete-cloudfront`, `delete-cloudfront-ui`, and `delete-api-gateway` all completed successfully before re-running delete |
