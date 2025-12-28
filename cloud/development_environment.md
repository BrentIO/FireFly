# Cloud Development Environment
The workflows will automatically create the environment required for firmware control.  This includes S3 buckets, gateways, and the lambda functions.  This document will explain how to bootstrap the AWS account to use the deployment templates.

There are three stacks which are automatically created, udpdated, or deleted with these templates:
- S3 Firmware Bucket Stack
- API Stack
- Lambda Stack

This assumes your Route 53 is already configured for your account with a custom domain name.

## IAM Users
1. Create the user that will execute the deployment and deletion of the stacks.  For example, `FireFly-Github-Actions`.
2. Create security credentials for `FireFly-Github-Actions` with an access key and secret.

::: info Note
Do not create or attach permissions for the user at this time.
:::

## IAM Roles

1. Create a new role named  `Firefly-CloudFormation-Execution-Role`.
2. Create a trust relationship using statements in `./Cloud/Firefly-CloudFormation-Execution-Role_Trust-Relationships.json`.

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
1. Create a new poicy using statements in `./Cloud/FireFly-Github-Actions-CloudFormation-Access-Policy.json`.
2. Name the policy `FireFly-Github-CloudFormation-Access-Policy`.
3. Attach IAM user entity `FireFly-Github-Actions` to the policy.

### CloudFormation Execution Policy
This policy allows execution to the individual services needed to deploy and deelete 
1. Create a new policy using statements in `./Cloud/FireFly-CloudFormation-Execution-Policy.json`.
2. Name the policy `FireFly-CloudFormation-Execution-Policy`.
3. Attach IAM role entity `Firefly-CloudFormation-Execution-Role` to the policy.

## Github Secrets

The following secrets must be configured in Github secrets:
- `AWS_ACCESS_KEY_ID` with the access key for IAM user `FireFly-Github-Actions`.
- `AWS_ACCOUNT_ID` with your AWS account ID.
- `AWS_REGION` with the region you plan to deploy to.
- `AWS_SECRET_ACCESS_KEY` with the access key secret for IAM user `FireFly-Github-Actions`.
- `HOSTED_ZONE_ID` with the Hosted Zone ID for your Route 53 instance.
- `S3_FIRMWARE_BUCKET_NAME` with the S3 bucket name you plan to use to store firmware.
- `SAM_DEPLOYMENT_BUCKET_NAME` with the name of the bucket where deployment templates will be stored.


## Github Variables
The following variables must be configured in Github variables:

- `API_DOMAIN_NAME` with the domain name for the API gateway, for example _api.somewhere.com_.
- `CERTIFICATE_DOMAIN_NAME` as a wildcard to your domain, for example _*.somewhere.com_.
- `CLOUD_FORMATION_EXECUTION_ROLE_NAME` with the value _Firefly-CloudFormation-Execution-Role_.