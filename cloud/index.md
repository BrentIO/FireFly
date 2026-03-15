# FireFly Cloud

FireFly Cloud is the serverless AWS backend that manages the Arduino firmware lifecycle.  It handles firmware uploads, validation, status progression, and deletion via an HTTP API backed by Lambda, DynamoDB, API Gateway, and S3.

## Architecture

Firmware enters the system by being uploaded directly to S3, which triggers the upload Lambda to validate and register it.  The API Gateway exposes endpoints for querying firmware records, advancing their release status, and initiating deletion.  Deletion is asynchronous — removing the S3 file triggers the delete Lambda, which updates DynamoDB.

## CloudFormation Stacks

The environment is composed of multiple CloudFormation stacks, each managed by its own deploy and delete workflow:

| Stack | Description |
|---|---|
| `firefly-acm-api-gateway` | ACM certificate for the API custom domain |
| `firefly-api-gateway` | HTTP API Gateway v2 with custom domain and access logs |
| `firefly-dynamodb-firmware` | DynamoDB firmware table |
| `firefly-s3-firmware` | S3 firmware bucket with lifecycle rules and event notifications |
| `firefly-shared-layer` | Shared Python Lambda layer |
| `firefly-func-api-health-get` | Health check endpoint |
| `firefly-func-api-firmware-get` | Firmware list and item retrieval endpoints |
| `firefly-func-api-firmware-status-patch` | Firmware status transition endpoint |
| `firefly-func-api-firmware-delete` | Firmware deletion endpoint |
| `firefly-func-s3-firmware-uploaded` | S3 upload event handler |
| `firefly-func-s3-firmware-deleted` | S3 delete event handler |

## Shared Lambda Layer

All firmware Lambda functions except `func-api-health-get` depend on `firefly-shared-layer`, a Python layer located at `lambdas/shared/python/shared/`:

| Module | Description |
|---|---|
| `logging_config.py` | Configures JSON structured logging; log level driven by AppConfig |
| `app_config.py` | Fetches configuration from AWS AppConfig via the Lambda extension |
| `feature_flags.py` | Evaluates feature flags from AppConfig |
