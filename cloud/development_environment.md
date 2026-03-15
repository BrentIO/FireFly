# Cloud Development Environment
The workflows will automatically create the environment required for firmware control.  This includes S3 buckets, gateways, and the lambda functions.  This document will explain how to bootstrap the AWS account to use the deployment templates.

Multiple CloudFormation stacks are automatically created, updated, or deleted with these templates, grouped into three categories:
- S3 Firmware Bucket Stack
- API Stack
- Lambda Stack

This assumes your Route 53 is already configured for your account with a custom domain name.

::: info SAM_DEPLOYMENT_BUCKET_NAME
The SAM_DEPLOYMENT_BUCKET_NAME will not be created automatically.  You must create this S3 bucket manually in the same region you plan to deploy to before running any workflows.
:::

## IAM Users
1. Create the user that will execute the deployment and deletion of the stacks.  For example, `firefly-github-actions`.
2. Create security credentials for `firefly-github-actions` with an access key and secret.

::: info Note
Do not create or attach permissions for the user at this time.
:::

## IAM Roles

1. Create a new role named  `firefly-cloudformation-execution-role`.
2. Create a trust relationship using statements in `policies/firefly-cloudformation-execution-role_trust-relationships.json`.

::: info Note
Do not create or attach permissions for the role at this time.
:::

## IAM Policies

Be sure to replace the following placeholders stored in the policy files:
- `AWS_ACCOUNT_ID` with your AWS account ID.
- `AWS_REGION` with the region you plan to deploy to.
- `S3_FIRMWARE_BUCKET_NAME` with the S3 bucket name you plan to use to store firmware.
- `SAM_DEPLOYMENT_BUCKET_NAME` with the name of the bucket where deployment templates will be stored.
- `HOSTED_ZONE_ID` with the Hosted Zone ID for your Route 53 instance.

::: info AWS Region Support
Only **us-east-1** region is supported.
:::

### CloudFormation Access Policy
This policy allows the IAM user to execute CloudFormation scripts and assume the CloudFormation Execution role.
1. Create a new policy using statements in `policies/firefly-github-actions-cloudformation-access-policy.json`.
2. Name the policy `firefly-github-actions-cloudformation-access-policy`.
3. Attach IAM user entity `firefly-github-actions` to the policy.

### CloudFormation Execution Policy
This policy allows execution to the individual services needed to deploy and delete the stacks.
1. Create a new policy using statements in `policies/firefly-cloudformation-execution-policy.json`.
2. Name the policy `firefly-cloudformation-execution-policy`.
3. Attach IAM role entity `firefly-cloudformation-execution-role` to the policy.

## Github Environments

The workflows deploy to either a `dev` or `production` environment.  You must create both environments in the repository settings under **Settings > Environments** and configure the secrets and variables for each environment.

::: info Note
Secrets and variables must be set at the **environment** level, not at the repository level.
:::

## Github Secrets

The following secrets must be configured in each Github environment:

| Name | Example Value | Description |
| ---- | ------------- | ----------- |
| `AWS_ACCESS_KEY_ID` | firefly-github-actions | The access key for IAM user. |
| `AWS_ACCOUNT_ID` | 1234567890 | Your AWS account ID. |
| `AWS_REGION` | us-east-1 | The AWS region you plan to deploy to. |
| `AWS_SECRET_ACCESS_KEY` | | The access key secret for IAM user `firefly-github-actions` |
| `HOSTED_ZONE_ID` | AB1234567 | The Hosted Zone ID for your Route 53 instance. |
| `S3_FIRMWARE_BUCKET_NAME` | my-firmware-bucket | The S3 bucket name you plan to use to store firmware. |
| `SAM_DEPLOYMENT_BUCKET_NAME` | my-sam-deployment-bucket | The name of the bucket where deployment templates will be stored when deployed. |


## Github Variables
The following variables must be configured in each Github environment:

| Name | Example Value | Description |
| ---- | ------------- | ----------- |
| `API_DOMAIN_NAME` | api.somewhere.com | The domain name for the API gateway. |
| `CERTIFICATE_DOMAIN_NAME` | *.somewhere.com | A wildcard to your domain. |
| `CLOUD_FORMATION_EXECUTION_ROLE_NAME` | firefly-cloudformation-execution-role | Name of the execution role. |
| `DYNAMODB_FIRMWARE_TABLE_NAME` | firefly-firmware | The name of the firmware table. |

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
| `deploy-s3-firmware` | Creates the S3 firmware bucket and wires up event notifications. Requires both S3 trigger Lambdas. |

### Deleting

Use **Delete All** (`delete-all`) to tear down the entire environment.  Individual delete workflows are available if you need to remove a specific stack.

::: warning Dependency Order
Stacks must be deleted in reverse dependency order.  **Delete All** handles this automatically.  If running individual delete workflows manually, delete Lambda functions before the API Gateway, the API Gateway before the ACM certificate, and the S3 bucket before the S3 trigger Lambdas, and all Lambda functions before the shared layer.
:::

| Workflow | Description |
| -------- | ----------- |
| `delete-all` | Tears down all stacks in the correct order. |
| `delete-s3-firmware` | Deletes the S3 firmware bucket stack. Must run before the S3 trigger Lambdas. |
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

### Integration Tests

The **Run Integration Tests** (`run-integration-tests`) workflow can be run independently to validate a deployed environment without making any changes.  It looks up the API URL from the CloudFormation stack outputs and runs the test suite against the live environment.
