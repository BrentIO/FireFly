# Cloud Development Environment
The workflows will automatically create the environment required for firmware control.  This includes S3 buckets, gateways, and the lambda functions.  This document will explain how to bootstrap the AWS account to use the deployment templates.

There are three stacks which are automatically created, udpdated, or deleted with these templates:
- S3 Firmware Bucket Stack
- API Stack
- Lambda Stack

This assumes your Route 53 is already configured for your account with a custom domain name.

::: info SAM_DEPLOYMENT_BUCKET_NAME
The SAM_DEPLOYMENT_BUCKET_NAME will not be created automatically.  You must create this manually.
:::

## IAM Users
1. Create the user that will execute the deployment and deletion of the stacks.  For example, `firefly-github-actions`.
2. Create security credentials for `firefly-github-actions` with an access key and secret.

::: info Note
Do not create or attach permissions for the user at this time.
:::

## IAM Roles

1. Create a new role named  `firefly-cloudformation-execution-role`.
2. Create a trust relationship using statements in `./Cloud/firefly-cloudformation-execution-role_trust-relationships.json`.

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
1. Create a new poicy using statements in `./Cloud/firefly-github-actions-cloudformation-access-policy.json`.
2. Name the policy `firefly-github-actions-cloudformation-access-policy`.
3. Attach IAM user entity `firefly-github-actions` to the policy.

### CloudFormation Execution Policy
This policy allows execution to the individual services needed to deploy and deelete 
1. Create a new policy using statements in `./Cloud/firefly-cloudformation-execution-policy.json`.
2. Name the policy `firefly-cloudformation-execution-policy`.
3. Attach IAM role entity `firefly-cloudformation-execution-role` to the policy.

## Github Secrets

The following secrets must be configured in Github secrets:

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
The following variables must be configured in Github variables:

| Name | Example Value | Description |
| ---- | ------------- | ----------- |
| `API_DOMAIN_NAME` | api.somewhere.com | The domain name for the API gateway. |
| `CERTIFICATE_DOMAIN_NAME` | *.somewhere.com | A wildcard to your domain. |
| `CLOUD_FORMATION_EXECUTION_ROLE_NAME` | firefly-cloudformation-execution-role | Name of the execution role. |
| `DYNAMODB_FIRMWARE_TABLE_NAME` | firefly-firmware | The name of the firmware table. |

## Dockerfile for ACT

To create a custom image for ACT for use in VSCode, use the following:
```dockerfile
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# Base system packages
RUN apt-get update && apt-get install -y \
    bash \
    curl \
    unzip \
    zip \
    git \
    jq \
    python3 \
    python3-pip \
    python3.12-venv \
    python3.12-dev \
    ca-certificates \
    gnupg \
    lsb-release \
    && rm -rf /var/lib/apt/lists/*

# GitHub runner parity utilities
RUN apt-get update && apt-get install -y \
    sudo \
    git-lfs \
    build-essential \
    tar \
    gzip \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 18 (GitHub runner default)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get update \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install AWS CLI v2 (ZIP installer)
ARG TARGETARCH
RUN echo "Installing AWS CLI for architecture: $TARGETARCH" && \
    if [ "$TARGETARCH" = "arm64" ]; then \
        AWSCLI_ZIP="awscli-exe-linux-aarch64.zip"; \
    else \
        AWSCLI_ZIP="awscli-exe-linux-x86_64.zip"; \
    fi && \
    curl -fsSL "https://awscli.amazonaws.com/${AWSCLI_ZIP}" -o awscliv2.zip && \
    unzip awscliv2.zip && \
    ./aws/install --update && \
    rm -rf awscliv2.zip aws


# Install AWS SAM CLI
ARG TARGETARCH

RUN echo "Installing AWS SAM CLI for architecture: $TARGETARCH" && \
    if [ "$TARGETARCH" = "arm64" ]; then \
        SAM_ZIP="aws-sam-cli-linux-aarch64.zip"; \
    else \
        SAM_ZIP="aws-sam-cli-linux-x86_64.zip"; \
    fi && \
    curl -fsSL -o sam.zip "https://github.com/aws/aws-sam-cli/releases/latest/download/${SAM_ZIP}" && \
    unzip sam.zip -d sam-installation && \
    ./sam-installation/install && \
    rm -rf sam.zip sam-installation

SHELL ["/bin/bash", "-c"]
```

Usage for Intel CPU: `docker build --no-cache --platform=linux/amd64 -t act-sam:latest .`
Usage for Intel Apple Silicon: `docker build --no-cache --platform=linux/arm64 -t act-sam:latest .`



::: info
Be sure to map runner setting `ubuntu-latest` = `act-sam`
:::