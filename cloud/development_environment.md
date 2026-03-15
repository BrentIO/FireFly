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

## Deploying

Once all IAM resources and GitHub environments are configured, use the **Deploy All** workflow to deploy the complete stack in the correct order.  Individual deploy and delete workflows are also available for updating or removing specific stacks.
