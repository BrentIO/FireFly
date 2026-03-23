# cloudfront-firmware

## Overview

Provisions the CloudFront distribution that fronts the `firefly-s3-firmware-public` bucket for firmware OTA delivery. Also creates the Route 53 alias record mapping the firmware domain name to the CloudFront distribution.

## CloudFormation Stack

`firefly-cloudfront-firmware`

## Dependencies

### Deploy

- `acm` — provides the `CertificateArn` for the CloudFront alternate domain
- `s3-firmware-public` — the origin bucket must exist before the distribution can reference it

### Delete

None — this stack can be deleted in parallel with most others.

## Required By

### Deploy

- `func-api-ota-get` — the CloudFront domain is embedded in OTA manifest URLs

### Delete

- `delete-s3-firmware-public` — CloudFront must be deleted before the origin bucket
- `delete-acm` (transitively)

---

## Deploy Workflow

### Description

Looks up the `CertificateArn` from the `firefly-acm` stack output, then deploys the `firefly-cloudfront-firmware` CloudFormation stack. CloudFront distribution propagation takes 15–20 minutes. The stack also creates a Route 53 ALIAS record for the firmware domain.

### Steps

1. Checkout repository
2. Configure AWS credentials
3. Install SAM CLI
4. Lookup `CertificateArn` from `firefly-acm` stack output
5. `sam build` — template: `templates/cloudfront-firmware.yaml`
6. `sam deploy` — stack: `firefly-cloudfront-firmware`; params: `FirmwareBucketName`, `CertificateArn`, `FirmwareDomain`, `HostedZoneId`

### Sequence Diagram

[![Deploy cloudfront-firmware sequence](./images/deploy-cloudfront-firmware.svg)](./images/deploy-cloudfront-firmware.svg)

---

## Delete Workflow

### Description

Deletes the `firefly-cloudfront-firmware` CloudFormation stack, removing the CloudFront distribution and the Route 53 alias record. Distribution deletion takes 15–20 minutes. No pre-deletion cleanup is required; this job runs in parallel with most other delete jobs.

### Steps

1. Configure AWS credentials
2. Install SAM CLI
3. `sam delete --stack-name firefly-cloudfront-firmware --no-prompts --region`

### Sequence Diagram

[![Delete cloudfront-firmware sequence](./images/delete-cloudfront-firmware.svg)](./images/delete-cloudfront-firmware.svg)

---

## Failure Scenarios

| Scenario | Cause | Resolution |
|---|---|---|
| CNAME already associated with another distribution | Another CloudFront distribution in the account has the same alternate domain name; CloudFront returns `InvalidRequest` | Remove the alternate domain name from the conflicting distribution in the AWS console, then re-run |
| Stack left in `UPDATE_IN_PROGRESS` after cancellation | Workflow was cancelled while CloudFront was propagating (15–20 min window) | Wait for the in-progress update to complete (success or rollback) before re-running |
| `CertificateArn` lookup fails | `firefly-acm` stack not deployed or output not present | Deploy `acm` first |
