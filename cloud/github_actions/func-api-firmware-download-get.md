# func-api-firmware-download-get

## Overview

Manages the Lambda function that generates pre-signed S3 URLs for firmware ZIP downloads via `GET /firmware/{zip_name}/download`. The private bucket is never exposed directly; the function issues a time-limited pre-signed URL to the caller.

## CloudFormation Stack

`firefly-func-api-firmware-download-get`

## CloudWatch Logs

| Setting | Value |
|---|---|
| Log group | `/aws/lambda/firefly-func-api-firmware-download-get` |
| Retention | 30 days |

## Dependencies

### Deploy Dependencies

| Workflow | Reason |
|---|---|
| [api-gateway](./api-gateway.md) | API Gateway ID required as SAM parameter |
| [shared-layer](./shared-layer.md) | Lambda layer ARN must be resolvable at SAM build/deploy time |
| [s3-firmware](./s3-firmware.md) | Private bucket must exist before the function can generate pre-signed URLs |

### Delete Dependencies

None — this workflow has no prerequisites.

## Required By

### Required By Deploy

| Workflow | Reason |
|---|---|
| run-integration-tests | Download endpoint must exist before integration tests run |

### Required By Delete

| Workflow | Reason |
|---|---|
| [api-gateway](./api-gateway.md) | All Lambda integrations must be removed before the API Gateway stack can be deleted |
| [shared-layer](./shared-layer.md) | Layer cannot be deleted while functions still reference it |

## Deploy Workflow

### Description

Looks up the API Gateway ID from the `firefly-api-gateway` stack output, then builds and deploys the function. The route has no authorizer; access control is enforced by the pre-signed URL expiry and the private bucket policy.

### Steps

1. Configure AWS credentials.
2. Look up `ApiId` from the `firefly-api-gateway` stack output.
3. SAM build.
4. SAM deploy with parameters:
   - `ApiId`
   - `FirmwareBucketName` (private bucket, from secrets)

### Sequence Diagram

[![Deploy Sequence](./images/deploy-func-api-firmware-download-get.svg)](./images/deploy-func-api-firmware-download-get.svg)

## Delete Workflow

### Description

Runs `sam delete` to remove the CloudFormation stack and the Lambda function.

### Steps

1. Configure AWS credentials.
2. SAM delete `firefly-func-api-firmware-download-get`.

### Sequence Diagram

[![Delete Sequence](./images/delete-func-api-firmware-download-get.svg)](./images/delete-func-api-firmware-download-get.svg)

## Failure Scenarios

| Scenario | Behavior |
|---|---|
| API Gateway stack not deployed | `describe-stacks` call fails; workflow fails before SAM deploy is attempted. Deploy `api-gateway` first. |
| Private S3 bucket not deployed | Function deploys successfully but pre-signed URL generation fails at runtime because the bucket does not exist. Deploy `s3-firmware` first. |
