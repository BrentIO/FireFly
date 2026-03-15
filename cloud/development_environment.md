# Cloud Development Environment

This guide walks through bootstrapping an AWS account to use the FireFly Cloud deployment workflows.  You will prepare the IAM policy files, create the required AWS resources, and then configure GitHub with the credentials and settings the workflows need.  Once complete, the workflows will automatically create, update, and delete the CloudFormation stacks that make up the FireFly Cloud — including S3 buckets, API Gateway, DynamoDB, and Lambda functions.

This guide assumes your Route 53 is already configured for your account with a custom domain name.

::: info AWS Region Support
Only **us-east-1** region is supported.
:::

## Step 1: Prepare Policy Files

Before creating anything in AWS, update the placeholder values in the policy files in the `policies/` directory:

- `AWS_ACCOUNT_ID` — your AWS account ID.
- `AWS_REGION` — the region you plan to deploy to.
- `S3_FIRMWARE_PRIVATE_BUCKET_NAME` — the S3 bucket name you plan to use to store firmware ZIPs.
- `S3_FIRMWARE_PUBLIC_BUCKET_NAME` — the S3 bucket name you plan to use for public OTA firmware delivery.
- `S3_UI_BUCKET_NAME` — the S3 bucket name you plan to use for the UI static files.
- `SAM_DEPLOYMENT_BUCKET_NAME` — the name of the S3 bucket where CloudFormation deployment templates will be stored.
- `HOSTED_ZONE_ID` — the Hosted Zone ID for your Route 53 instance.

The following policy files require updates:
- `policies/firefly-github-actions-cloudformation-access-policy.json`
- `policies/firefly-cloudformation-execution-policy.json`

## Step 2: AWS Setup

### SAM Deployment Bucket

1. Create an S3 bucket to store CloudFormation deployment templates.  This bucket must be in the same region you plan to deploy to.
2. Name it to match the `SAM_DEPLOYMENT_BUCKET_NAME` value you used in Step 1.

### IAM Users

1. Create the user that will execute the deployment and deletion of the stacks.  For example, `firefly-github-actions`.
2. Create security credentials for `firefly-github-actions` with an access key and secret.

::: info Note
Do not create or attach permissions for the user at this time.
:::

### IAM Roles

1. Create a new role named `firefly-cloudformation-execution-role`.
2. Create a trust relationship using statements in `policies/firefly-cloudformation-execution-role_trust-relationships.json`.

::: info Note
Do not create or attach permissions for the role at this time.
:::

### IAM Policies

#### CloudFormation Access Policy
This policy allows the IAM user to execute CloudFormation scripts and assume the CloudFormation Execution role.
1. Create a new policy using the updated statements in `policies/firefly-github-actions-cloudformation-access-policy.json`.
2. Name the policy `firefly-github-actions-cloudformation-access-policy`.
3. Attach IAM user entity `firefly-github-actions` to the policy.

#### CloudFormation Execution Policy
This policy allows CloudFormation to deploy and delete the individual AWS services in each stack.
1. Create a new policy using the updated statements in `policies/firefly-cloudformation-execution-policy.json`.
2. Name the policy `firefly-cloudformation-execution-policy`.
3. Attach IAM role entity `firefly-cloudformation-execution-role` to the policy.

## Step 3: GitHub Setup

### GitHub Environments

The workflows deploy to either a `dev` or `production` environment.  Create both environments in the repository settings under **Settings > Environments**.

::: info Note
Secrets and variables must be set at the **environment** level, not at the repository level.
:::

### GitHub Secrets

The following secrets must be configured in each GitHub environment:

| Name | Example Value | Description |
| ---- | ------------- | ----------- |
| `AWS_ACCESS_KEY_ID` | firefly-github-actions | The access key for IAM user. |
| `AWS_ACCOUNT_ID` | 1234567890 | Your AWS account ID. |
| `AWS_REGION` | us-east-1 | The AWS region you plan to deploy to. |
| `AWS_SECRET_ACCESS_KEY` | | The access key secret for IAM user `firefly-github-actions`. |
| `HOSTED_ZONE_ID` | AB1234567 | The Hosted Zone ID for your Route 53 instance. |
| `S3_FIRMWARE_PRIVATE_BUCKET_NAME` | my-firmware-private | The S3 bucket name for storing firmware ZIPs (private). |
| `S3_FIRMWARE_PUBLIC_BUCKET_NAME` | my-firmware-public | The S3 bucket name for OTA firmware binary delivery (public). |
| `S3_UI_BUCKET_NAME` | my-firefly-ui | The S3 bucket name for the UI static files (private, served via CloudFront). |
| `SAM_DEPLOYMENT_BUCKET_NAME` | my-sam-deployment-bucket | The name of the bucket where deployment templates will be stored. |

### GitHub Variables

The following variables must be configured in each GitHub environment:

| Name | Example Value | Description |
| ---- | ------------- | ----------- |
| `API_DOMAIN_NAME` | api.somewhere.com | The domain name for the API gateway. |
| `API_URL` | `https://api.somewhere.com` | The full base URL for the API, including the `https://` scheme, injected into the UI at build time. |
| `CERTIFICATE_DOMAIN_NAME` | *.somewhere.com | A wildcard to your domain. |
| `CLOUD_FORMATION_EXECUTION_ROLE_NAME` | firefly-cloudformation-execution-role | Name of the execution role. |
| `DYNAMODB_FIRMWARE_TABLE_NAME` | firefly-firmware | The name of the firmware table. |
| `FIRMWARE_DOMAIN_NAME` | firmware.somewhere.com | The domain name for the CloudFront firmware distribution. |
| `FIRMWARE_TYPE_MAP` | `{"Controller":"FireFly Controller"}` | JSON mapping from URL application name to the firmware type string expected by the device. |
| `UI_DOMAIN_NAME` | `ui.somewhere.com` | The custom domain name for the firmware management UI, without the `https://` scheme. |

## GitHub Actions Workflows

All deployments and deletions are performed through GitHub Actions workflows, each targeting either the `dev` or `production` environment.  Most individual workflows also include an optional **Run integration tests after deploy** checkbox.

### Deploying

For initial setup, use **Deploy All** (`deploy-all`), which deploys all stacks in the correct dependency order and runs integration tests at the end.

Individual deploy workflows are available for updating a specific stack without redeploying everything:

| Workflow | Description |
| -------- | ----------- |
| `deploy-all` | Deploys all stacks in dependency order and runs integration tests. Use this for first-time setup. |
| `deploy-dynamodb-firmware` | Creates the DynamoDB firmware table. |
| `deploy-acm-api-gateway` | Requests the ACM certificate and validates it via Route 53. Must run before the API Gateway. |
| `deploy-api-gateway` | Deploys the HTTP API Gateway. Requires ACM certificate to exist. |
| `deploy-shared-layer` | Publishes the shared Lambda layer used by most functions. |
| `deploy-func-api-health-get` | Deploys the health check Lambda. Requires API Gateway. |
| `deploy-func-api-firmware-get` | Deploys the firmware list/download Lambda. Requires API Gateway and shared layer. |
| `deploy-func-api-firmware-status-patch` | Deploys the firmware status update Lambda. Requires API Gateway and shared layer. |
| `deploy-func-api-firmware-delete` | Deploys the firmware delete Lambda. Requires API Gateway and shared layer. |
| `deploy-func-s3-firmware-uploaded` | Deploys the S3 upload trigger Lambda. Requires shared layer. |
| `deploy-func-s3-firmware-deleted` | Deploys the S3 delete trigger Lambda. Requires shared layer. |
| `deploy-s3-firmware` | Creates the private S3 firmware bucket and wires up event notifications. Requires both S3 trigger Lambdas. |
| `deploy-s3-firmware-public` | Creates the public S3 bucket for OTA firmware delivery. |
| `deploy-cloudfront` | Deploys the CloudFront distribution. Requires ACM certificate and public S3 bucket. |
| `deploy-func-api-ota-get` | Deploys the OTA firmware manifest Lambda. Requires API Gateway, shared layer, and CloudFront. |
| `deploy-func-api-firmware-download-get` | Deploys the pre-signed download URL Lambda. Requires API Gateway, shared layer, and private S3 firmware bucket. |
| `deploy-s3-ui` | Creates the private S3 bucket for UI static files. |
| `deploy-cloudfront-ui` | Deploys the CloudFront distribution serving the UI. Requires ACM certificate and UI S3 bucket. |
| `deploy-ui-app` | Builds the Vue app and syncs it to S3, then invalidates the CloudFront cache. Requires CloudFront UI distribution. |

### Deleting

Use **Delete All** (`delete-all`) to tear down the entire environment.  Individual delete workflows are available if you need to remove a specific stack.

::: warning Dependency Order
Stacks must be deleted in reverse dependency order.  **Delete All** handles this automatically.  If running individual delete workflows manually, delete Lambda functions before the API Gateway, the API Gateway before the ACM certificate, the S3 bucket before the S3 trigger Lambdas, and all Lambda functions before the shared layer.
:::

| Workflow | Description |
| -------- | ----------- |
| `delete-all` | Tears down all stacks in the correct order. |
| `delete-s3-firmware` | Deletes the private S3 firmware bucket stack. Must run before the S3 trigger Lambdas. |
| `delete-func-api-ota-get` | Deletes the OTA firmware manifest Lambda. Must run before the API Gateway. |
| `delete-cloudfront` | Deletes the CloudFront distribution. Must run before the public S3 bucket. |
| `delete-s3-firmware-public` | Deletes the public S3 firmware bucket. Must run after CloudFront is deleted. |
| `delete-func-api-health-get` | Deletes the health check Lambda. |
| `delete-func-api-firmware-get` | Deletes the firmware list/download Lambda. |
| `delete-func-api-firmware-status-patch` | Deletes the firmware status update Lambda. |
| `delete-func-api-firmware-delete` | Deletes the firmware delete Lambda. |
| `delete-api-gateway` | Deletes the API Gateway. Must run after all API Lambda functions are deleted. |
| `delete-acm-api-gateway` | Deletes the ACM certificate. Must run after the API Gateway is deleted. |
| `delete-func-s3-firmware-uploaded` | Deletes the S3 upload trigger Lambda. Must run after the S3 bucket is deleted. |
| `delete-func-s3-firmware-deleted` | Deletes the S3 delete trigger Lambda. Must run after the S3 bucket is deleted. |
| `delete-shared-layer` | Deletes the shared Lambda layer. Must run after all Lambda functions are deleted. |
| `delete-dynamodb-firmware` | Deletes the DynamoDB firmware table. |
| `delete-func-api-firmware-download-get` | Deletes the pre-signed download URL Lambda. Must run before the API Gateway. |
| `delete-ui-app` | Empties the UI S3 bucket. Must run before the CloudFront UI distribution is deleted. |
| `delete-cloudfront-ui` | Deletes the CloudFront UI distribution. Must run after the UI S3 bucket is emptied. |
| `delete-s3-ui` | Deletes the private UI S3 bucket. Must run after the CloudFront UI distribution is deleted. |

### Integration Tests

The **Run Integration Tests** (`run-integration-tests`) workflow can be run independently to validate a deployed environment without making any changes.  It looks up the API URL from the `firefly-api-gateway` stack output and the UI URL from the `firefly-cloudfront-ui` stack output, then runs the full test suite against the live environment.  UI tests are automatically skipped if the `firefly-cloudfront-ui` stack does not exist.

## Running Tests Locally

Integration tests can also be run locally against any deployed environment.

### Setup

```bash
pip install -r tests/requirements.txt
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `FIREFLY_API_URL` | No | API base URL (defaults to the production URL if not set) |
| `FIREFLY_FIRMWARE_BUCKET` | For upload tests | Private S3 firmware bucket name |
| `FIREFLY_UI_URL` | For UI and CORS tests | Base URL of the firmware management UI (e.g. `https://ui.example.com`) |
| `FIREFLY_UI_BUCKET` | For UI S3 tests | Name of the private S3 bucket serving the UI static files |

AWS credentials must be available via the standard boto3 credential chain.

### Running Tests

```bash
# All tests
pytest tests/integration/ -v

# Skip tests that require S3 upload
pytest tests/integration/ -v -k "not (firmware_item or fresh_firmware_item)"
```

Tests that upload firmware wait up to 60 seconds for the S3 event to propagate and the record to appear in the API before proceeding.
