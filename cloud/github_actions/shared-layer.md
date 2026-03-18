# shared-layer

## Overview

Packages the shared Python modules used by all firmware-related Lambda functions into a Lambda layer. The layer provides structured JSON logging (`logging_config.py`), AWS AppConfig integration (`app_config.py`), and boolean feature flag evaluation (`feature_flags.py`).

## CloudFormation Stack

`firefly-shared-layer`

## Dependencies

### Deploy

None — this workflow has no prerequisites.

### Delete

All of the following must complete before this job runs:

- `delete-func-s3-firmware-uploaded`
- `delete-func-s3-firmware-deleted`
- `delete-func-api-firmware-get`
- `delete-func-api-firmware-status-patch`
- `delete-func-api-firmware-delete`
- `delete-func-api-ota-get`
- `delete-func-api-firmware-download-get`

## Required By

### Deploy

- `func-s3-firmware-uploaded`
- `func-s3-firmware-deleted`
- `func-api-firmware-get`
- `func-api-firmware-status-patch`
- `func-api-firmware-delete`
- `func-api-ota-get`
- `func-api-firmware-download-get`

### Delete

None.

---

## Deploy Workflow

### Description

Runs `sam build` against `lambdas/shared/template.yaml` to package the shared Python modules, uploads the artifact to the SAM deployment bucket, then deploys the `firefly-shared-layer` CloudFormation stack. The stack exports `LayerVersionArn`, which each dependent Lambda function reads from the stack output.

### Steps

1. Checkout repository
2. Configure AWS credentials
3. Install SAM CLI
4. `sam build` — template: `lambdas/shared/template.yaml`
5. `sam deploy` — stack: `firefly-shared-layer`

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
| `DELETE_FAILED` — layer still in use | One or more Lambda functions still reference the layer version | Ensure all 7 dependent function stacks are deleted, then re-run |
| Layer version ARN changes on update | A new layer version is published on every deploy; old ARN is no longer valid | All dependent Lambda functions must be re-deployed after a layer update to pick up the new ARN |
