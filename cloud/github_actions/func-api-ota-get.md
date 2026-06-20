# func-api-ota-get

## Overview

Manages the Lambda function that serves OTA firmware update checks for devices via `GET /ota/{class}/{product_hex}/{application}?current_version={version}`. Returns the next sequential `RELEASED` version after the device's current version, not necessarily the latest. Responds `409 Conflict` when the device is running a `REVOKED` version with no newer release available.

The `firmware_type` field is embedded in `manifest.json` at CI build time and stored in DynamoDB by the upload Lambda. This function returns it verbatim — no server-side mapping is required.

## CloudFormation Stack

`firefly-func-api-ota-get`

## CloudWatch Logs

| Setting | Value |
|---|---|
| Log group | `/aws/lambda/firefly-func-api-ota-get` |
| Retention | 30 days |

## Dependencies

### Deploy Dependencies

| Workflow | Reason |
|---|---|
| [api-gateway](./api-gateway.md) | API Gateway ID required as SAM parameter |
| [shared-layer](./shared-layer.md) | Lambda layer ARN must be resolvable at SAM build/deploy time |
| [cloudfront-firmware](./cloudfront-firmware.md) | CloudFront domain required as SAM parameter for constructing firmware download URLs |

### Delete Dependencies

None — this workflow has no prerequisites.

## Required By

### Required By Deploy

| Workflow | Reason |
|---|---|
| run-integration-tests | OTA endpoint must exist before integration tests run |

### Required By Delete

| Workflow | Reason |
|---|---|
| [shared-layer](./shared-layer.md) | Layer cannot be deleted while functions still reference it |

## Deploy Workflow

### Description

Looks up the API Gateway ID from `firefly-api-gateway` and the CloudFront domain from `firefly-cloudfront-firmware`. Builds and deploys the function with the domain and table name.

### Steps

1. Configure AWS credentials.
2. Look up `ApiId` from the `firefly-api-gateway` stack output.
3. Look up `CloudFrontDomain` from the `firefly-cloudfront-firmware` stack output.
4. SAM deploy with parameters:
   - `ApiId`
   - `CloudFrontDomain`

**Response codes:**

| Code | Condition |
|---|---|
| `200` | Next (or same) RELEASED version found |
| `400` | `current_version` query parameter missing |
| `404` | No RELEASED firmware found for this class/product_hex |
| `409` | Device is on a REVOKED version with no newer RELEASED version available |

### Sequence Diagram

[![Deploy Sequence](./images/deploy-func-api-ota-get.svg)](./images/deploy-func-api-ota-get.svg)

## Delete Workflow

### Description

Runs `sam delete` to remove the CloudFormation stack and the Lambda function.

### Steps

1. Configure AWS credentials.
2. SAM delete `firefly-func-api-ota-get`.

### Sequence Diagram

[![Delete Sequence](./images/delete-func-api-ota-get.svg)](./images/delete-func-api-ota-get.svg)

## Failure Scenarios

| Scenario | Behavior |
|---|---|
| CloudFront stack not deployed | `describe-stacks` call fails; workflow fails before SAM deploy. Deploy `cloudfront-firmware` first. |
| API Gateway stack not deployed | `describe-stacks` call fails; workflow fails before SAM deploy. Deploy `api-gateway` first. |
| Shared layer ARN unresolvable | SAM build or deploy fails. Deploy `shared-layer` first. |
