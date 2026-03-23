# FireFly Cloud

FireFly Cloud is the serverless AWS backend that manages the Arduino firmware lifecycle.  It handles firmware uploads, validation, status progression, deletion, and over-the-air (OTA) delivery via an HTTP API backed by Lambda, DynamoDB, API Gateway, S3, and CloudFront.

## Architecture

Firmware enters the system by being uploaded directly to S3, which triggers the upload Lambda to validate and register it.  The API Gateway exposes endpoints for querying firmware records, advancing their release status, and initiating deletion.  When firmware is released, binaries are published to a public S3 bucket fronted by CloudFront for device OTA delivery.  When firmware is revoked, the binaries are moved to a restricted prefix and the CloudFront URLs become inaccessible.

## CloudFormation Stacks

The environment is composed of multiple CloudFormation stacks, each managed by its own deploy and delete workflow:

| Stack | Description |
|---|---|
| `firefly-acm` | ACM certificate for API Gateway, CloudFront, and Cognito custom domains (us-east-1) |
| `firefly-api-gateway` | HTTP API Gateway v2 with custom domain, access logs, and Cognito JWT authorizer |
| `firefly-dynamodb-firmware` | DynamoDB firmware table |
| `firefly-dynamodb-users` | DynamoDB allowed-list table for invitation-only access control |
| `firefly-cognito` | Cognito User Pool with Google IdP, pre-signup trigger, and super_users group |
| `firefly-func-cognito-pre-signup` | Pre-signup Lambda trigger that enforces invitation-only access |
| `firefly-func-api-users-get` | Users list endpoint |
| `firefly-func-api-users-post` | User invite endpoint |
| `firefly-func-api-users-delete` | User deletion endpoint |
| `firefly-func-api-users-patch` | Super user status endpoint |
| `firefly-s3-firmware` | Private S3 firmware bucket with lifecycle rules and event notifications |
| `firefly-s3-firmware-public` | Public S3 bucket for OTA firmware binary delivery; `revoked/` prefix is access-denied and expires after 90 days |
| `firefly-cloudfront-firmware` | CloudFront distribution fronting the public firmware bucket for OTA delivery |
| `firefly-shared-layer` | Shared Python Lambda layer |
| `firefly-func-api-health-get` | Health check endpoint |
| `firefly-func-api-firmware-get` | Firmware list and item retrieval endpoints |
| `firefly-func-api-firmware-status-patch` | Firmware status transition endpoint |
| `firefly-func-api-firmware-delete` | Firmware deletion endpoint |
| `firefly-func-s3-firmware-uploaded` | S3 upload event handler |
| `firefly-func-s3-firmware-deleted` | S3 delete event handler |
| `firefly-func-api-ota-get` | OTA firmware manifest endpoint |
| `firefly-func-api-firmware-download-get` | Pre-signed URL endpoint for downloading firmware ZIPs from the private bucket |
| `firefly-s3-ui` | Private S3 bucket for the UI static files |
| `firefly-cloudfront-ui` | CloudFront distribution serving the firmware management UI SPA |

## Shared Lambda Layer

All firmware Lambda functions except `func-api-health-get` depend on `firefly-shared-layer`, a Python layer located at `lambdas/shared/python/shared/`:

| Module | Description |
|---|---|
| `logging_config.py` | Configures JSON structured logging; log level driven by AppConfig |
| `app_config.py` | Fetches configuration from AWS AppConfig via the Lambda extension |
| `feature_flags.py` | Evaluates feature flags from AppConfig |
