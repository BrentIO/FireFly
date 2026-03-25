# func-api-ota-get

## Overview

Manages the Lambda function that serves OTA firmware update checks for devices via `GET /ota/{product_id}/{application}?current_version={version}`. Returns the next sequential `RELEASED` version after the device's current version, not necessarily the latest. Responds `409 Conflict` when the device is running a `REVOKED` version with no newer release available.

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

Before deploying, stores the `FIRMWARE_TYPE_MAP` variable in AWS Systems Manager Parameter Store. Then looks up the API Gateway ID from `firefly-api-gateway` and the CloudFront domain from `firefly-cloudfront-firmware`. Builds and deploys the function with the SSM path, domain, and table name.

The `FIRMWARE_TYPE_MAP` SSM parameter is not managed by CloudFormation and is not deleted when the stack is deleted. Manual cleanup may be required on full teardown.

### Steps

1. Configure AWS credentials.
2. Store `FIRMWARE_TYPE_MAP` in SSM Parameter Store (from GitHub environment var).
3. Look up `ApiId` from the `firefly-api-gateway` stack output.
4. Look up `CloudFrontDomain` (`DistributionDomain` or `FirmwareDomain`) from the `firefly-cloudfront-firmware` stack output.
5. SAM build.
6. SAM deploy with parameters:
   - `ApiId`
   - `DynamoDbFirmwareTableName` (from vars)
   - `CloudFrontDomain`
   - `FirmwareTypeMapSsmPath`
   - `EnvironmentName` (target environment)

**Response codes:**

| Code | Condition |
|---|---|
| `200` | Next (or same) RELEASED version found |
| `400` | `current_version` query parameter missing |
| `404` | No RELEASED firmware found for this product/application |
| `409` | Device is on a REVOKED version with no newer RELEASED version available |

### Sequence Diagram

[![Deploy Sequence](./images/deploy-func-api-ota-get.svg)](./images/deploy-func-api-ota-get.svg)

## Delete Workflow

### Description

Runs `sam delete` to remove the CloudFormation stack and the Lambda function. The SSM Parameter Store entry for `FIRMWARE_TYPE_MAP` is not deleted automatically; manual cleanup may be needed.

### Steps

1. Configure AWS credentials.
2. SAM delete `firefly-func-api-ota-get`.

> **Note:** The `FIRMWARE_TYPE_MAP` SSM parameter is not removed by this workflow. Delete it manually if performing a full environment teardown.

### Sequence Diagram

[![Delete Sequence](./images/delete-func-api-ota-get.svg)](./images/delete-func-api-ota-get.svg)

## Failure Scenarios

| Scenario | Behavior |
|---|---|
| SSM `put-parameter` fails | The deploy step continues, but the function will fail at runtime when reading the firmware type map. Verify IAM permissions and that the `FIRMWARE_TYPE_MAP` var is set in the GitHub environment. |
| CloudFront stack not deployed | `describe-stacks` call fails; workflow fails before SAM deploy. Deploy `cloudfront-firmware` first. |
| `FIRMWARE_TYPE_MAP` var missing from GitHub environment | SSM step fails; workflow halts before SAM deploy. |
