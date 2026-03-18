# cloudfront-ui

## Overview

Provisions the CloudFront distribution that fronts the `firefly-s3-ui` bucket for web UI delivery. Also creates the Route 53 alias record mapping the UI domain name to the CloudFront distribution. Uses the same ACM certificate as the API Gateway distribution (`firefly-acm-api-gateway`).

## CloudFormation Stack

`firefly-cloudfront-ui`

## Dependencies

### Deploy

- `acm-api-gateway` — provides the `CertificateArn` for the CloudFront alternate domain
- `s3-ui` — the origin bucket must exist before the distribution can reference it

### Delete

- `delete-ui-app` — UI assets and any active CloudFront references should be cleared first

## Required By

### Deploy

- `ui-app` — the CloudFront distribution ID and domain are needed to deploy the UI app and invalidate the cache

### Delete

- `delete-s3-ui` — CloudFront UI distribution must be deleted before the origin bucket
- `delete-acm-api-gateway` (transitively)

---

## Deploy Workflow

### Description

Looks up the `CertificateArn` from the `firefly-acm-api-gateway` stack output, then deploys the `firefly-cloudfront-ui` CloudFormation stack. CloudFront distribution propagation takes 15–20 minutes. The stack also creates a Route 53 ALIAS record for the UI domain.

### Steps

1. Checkout repository
2. Configure AWS credentials
3. Install SAM CLI
4. Lookup `CertificateArn` from `firefly-acm-api-gateway` stack output
5. `sam build` — template: `templates/cloudfront-ui.yaml`
6. `sam deploy` — stack: `firefly-cloudfront-ui`; params: `UiBucketName`, `CertificateArn`, `UiDomain`, `HostedZoneId`

### Sequence Diagram

[![Deploy cloudfront-ui sequence](./images/deploy-cloudfront-ui.svg)](./images/deploy-cloudfront-ui.svg)

---

## Delete Workflow

### Description

Deletes the `firefly-cloudfront-ui` CloudFormation stack, removing the CloudFront distribution and the Route 53 alias record. Must run after `delete-ui-app` to ensure the distribution is not serving live traffic.

### Steps

1. Configure AWS credentials
2. Install SAM CLI
3. `sam delete --stack-name firefly-cloudfront-ui --no-prompts --region`

### Sequence Diagram

[![Delete cloudfront-ui sequence](./images/delete-cloudfront-ui.svg)](./images/delete-cloudfront-ui.svg)

---

## Failure Scenarios

| Scenario | Cause | Resolution |
|---|---|---|
| CNAME already associated with another distribution | Another CloudFront distribution in the account has the same alternate domain name | Remove the alternate domain name from the conflicting distribution, then re-run |
| Stack left in `UPDATE_IN_PROGRESS` after cancellation | Workflow was cancelled during the 15–20 minute CloudFront propagation window | Wait for the update to finish before re-running |
| `CertificateArn` lookup fails | `firefly-acm-api-gateway` stack not deployed or output not present | Deploy `acm-api-gateway` first |
