# shared-layer

## Overview

Packages the shared Python modules used by all Lambda functions into a Lambda layer. The layer provides structured JSON logging (`logging_config.py`), AWS AppConfig integration (`app_config.py`), and boolean feature flag evaluation (`feature_flags.py`).

The stack also accepts and re-exports the AWS AppConfig Lambda extension layer ARN as a pass-through output (`AppConfigExtensionLayerArn`), giving all dependent Lambda deploy workflows a single lookup point for the extension layer.

## CloudFormation Stack

`firefly-shared-layer`

## GitHub Actions Variable

Before running this workflow, the following GitHub Actions variable must be set for each environment (`dev`, `production`):

| Variable | Description |
|---|---|
| `APPCONFIG_EXTENSION_LAYER_ARM64_ARN` | Full versioned ARN of the AWS AppConfig Lambda extension layer for the arm64 architecture in your region |

The correct ARN for your region and the latest version can be found in the [AWS AppConfig Lambda extension version reference](https://docs.aws.amazon.com/appconfig/latest/userguide/appconfig-integration-lambda-extensions-versions.html). The ARN format is:

```
arn:aws:lambda:{region}:{account-id}:layer:AWS-AppConfig-Extension-Arm64:{version}
```

Note: the AWS account ID embedded in the ARN is AWS-owned and varies by region — it is not your account ID. A version number is always required; there is no "latest" alias for Lambda layers.

## Dependencies

### Deploy

None — this workflow has no prerequisites.

### Delete

All of the following must complete before this job runs:

- `delete-func-api-appconfig-delete`
- `delete-func-api-appconfig-get`
- `delete-func-api-appconfig-patch`
- `delete-func-api-firmware-delete`
- `delete-func-api-firmware-download-get`
- `delete-func-api-firmware-get`
- `delete-func-api-firmware-status-patch`
- `delete-func-api-health-get`
- `delete-func-api-ota-get`
- `delete-func-api-users-delete`
- `delete-func-api-users-get`
- `delete-func-api-users-patch`
- `delete-func-api-users-post`
- `delete-func-cognito-pre-signup`
- `delete-func-s3-firmware-deleted`
- `delete-func-s3-firmware-uploaded`

## Required By

### Deploy

- `func-api-appconfig-delete`
- `func-api-appconfig-get`
- `func-api-appconfig-patch`
- `func-api-firmware-delete`
- `func-api-firmware-download-get`
- `func-api-firmware-get`
- `func-api-firmware-status-patch`
- `func-api-health-get`
- `func-api-ota-get`
- `func-api-users-delete`
- `func-api-users-get`
- `func-api-users-patch`
- `func-api-users-post`
- `func-cognito-pre-signup`
- `func-s3-firmware-deleted`
- `func-s3-firmware-uploaded`

### Delete

None.

---

## Deploy Workflow

### Description

Reads the `APPCONFIG_EXTENSION_LAYER_ARM64_ARN` GitHub Actions variable, then runs `sam build` against `lambdas/shared/template.yaml` to package the shared Python modules, uploads the artifact to the SAM deployment bucket, and deploys the `firefly-shared-layer` CloudFormation stack. The stack exports `SharedLayerArn` and `AppConfigExtensionLayerArn`, which each dependent Lambda function reads from the stack output.

### Steps

1. Checkout repository
2. Configure AWS credentials
3. Install SAM CLI
4. `sam deploy` — stack: `firefly-shared-layer`, parameter: `AppConfigExtensionLayerArn` from `vars.APPCONFIG_EXTENSION_LAYER_ARM64_ARN`

### Sequence Diagram

[![Deploy shared-layer sequence](./images/deploy-shared-layer.svg)](./images/deploy-shared-layer.svg)

---

## Delete Workflow

### Description

Deletes the `firefly-shared-layer` CloudFormation stack, removing the Lambda layer version. Lambda will not delete a layer version that is still referenced by a function; all dependent function stacks must be deleted first.

### Steps

1. Configure AWS credentials
2. Install SAM CLI
3. `sam delete --stack-name firefly-shared-layer --no-prompts --region`

### Sequence Diagram

[![Delete shared-layer sequence](./images/delete-shared-layer.svg)](./images/delete-shared-layer.svg)

---

## Failure Scenarios

| Scenario | Cause | Resolution |
|---|---|---|
| SAM build fails (Python dependency issue) | Missing or incompatible package in `lambdas/shared/`; no AWS changes are made | Fix the Python dependency error and re-run |
| `DELETE_FAILED` — layer still in use | One or more Lambda functions still reference the layer version | Ensure all 16 dependent function stacks are deleted, then re-run |
| Layer version ARN changes on update | A new layer version is published on every deploy; old ARN is no longer valid | All dependent Lambda functions must be re-deployed after a layer update to pick up the new ARN |
| Deploy fails — `APPCONFIG_EXTENSION_LAYER_ARM64_ARN` missing or wrong | GitHub Actions variable not set for the target environment, or set to an ARN for the wrong region | Set the variable in GitHub → Settings → Environments for the target environment; refer to the [AWS version reference](https://docs.aws.amazon.com/appconfig/latest/userguide/appconfig-integration-lambda-extensions-versions.html) for the correct ARN |
