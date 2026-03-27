# AWS Account Setup

This guide bootstraps the multi-account AWS infrastructure for FireFly Cloud.  It covers IAM Identity Center for cross-account console access, Route 53 hosted zone delegation, and the per-account resources that GitHub Actions workflows require.

Complete this guide once before running any deployment workflows.  After finishing, use the [Development Environment](/cloud/development_environment) guide to configure GitHub Actions and deploy.

---

## Account Structure

Three AWS accounts are used:

| Account | Purpose |
|---|---|
| Management | Domain registration, IAM Identity Center, billing consolidation |
| FireFly-DEV | Development environment — isolated from production |
| FireFly-PROD | Production environment |

DNS authority flows from the management account domain registration → PROD hosted zone → DEV hosted zone via NS delegation.

---

## Step 1: IAM Identity Center

IAM Identity Center (formerly AWS SSO) provides console access to the DEV and PROD accounts without creating IAM users in those accounts.  All steps in this section are performed in the **management account**.

### 1.1 — Create a Permission Set

1. Open **IAM Identity Center** → **Permission sets** → **Create permission set**
2. Select **Predefined permission set** → **AdministratorAccess** → **Next**
3. Leave the session duration at the default → **Next** → **Create**

### 1.2 — Create a User

::: info
If you already have an IAM Identity Center user configured, skip to Step 1.3.
:::

1. Go to **Users** → **Add user**
2. Enter a username (typically your email address), first name, last name, and email
3. Select **Send an email OTP** — you will receive an email to set your password
4. Complete the wizard → **Add user**

### 1.3 — Assign Users to Accounts

1. Go to **AWS accounts** in the left sidebar
2. Select the **FireFly-DEV** account → **Assign users or groups**
3. Select your user → **Next**
4. Select the **AdministratorAccess** permission set → **Next** → **Submit**
5. Repeat for **FireFly-PROD**

### 1.4 — Access the Portal

The IAM Identity Center dashboard shows your **AWS access portal URL**.  Bookmark it — this is how you log into the DEV and PROD accounts going forward.

---

## Step 2: DNS Setup

When the domain was registered in the management account, Route 53 automatically created a hosted zone there.  The goal of this section is to move DNS authority to the PROD account and delegate the `dev` subdomain to the DEV account, then remove the now-unused management account hosted zone.

### 2.1 — Create the PROD Hosted Zone

1. Log into **FireFly-PROD** via the Identity Center portal
2. Open **Route 53** → **Hosted zones** → **Create hosted zone**
3. Domain name: `fireflylx.com`, Type: **Public hosted zone** → **Create hosted zone**
4. Open the new hosted zone and **copy all four NS record values** — you will need them in Step 2.4

### 2.2 — Create the DEV Hosted Zone

1. Log into **FireFly-DEV** via the Identity Center portal
2. Open **Route 53** → **Hosted zones** → **Create hosted zone**
3. Domain name: `dev.fireflylx.com`, Type: **Public hosted zone** → **Create hosted zone**
4. Open the new hosted zone and **copy all four NS record values** — you will need them in Step 2.3

### 2.3 — Add NS Delegation in PROD

Delegate `dev.fireflylx.com` to the DEV account's hosted zone by adding an NS record in the PROD hosted zone:

1. Log into **FireFly-PROD** and open the `fireflylx.com` hosted zone
2. **Create record**:
   - Record name: `dev`
   - Record type: **NS**
   - Value: paste the four NS record values from the DEV hosted zone (one per line)
   - TTL: `172800`
3. **Create records**

### 2.4 — Update Domain Name Servers

Point the registered domain to the PROD hosted zone.  Until this step the domain still resolves through the management account hosted zone.

1. Log into the **management account**
2. Open **Route 53** → **Registered domains** → `fireflylx.com` → **Actions** → **Edit name servers**
3. Replace all four name server values with the NS record values from the **PROD hosted zone** (Step 2.1)
4. **Update** — DNS propagation takes up to 48 hours

### 2.5 — Verify DNS Propagation

After propagation completes, verify from a terminal:

```bash
dig NS fireflylx.com +short
dig NS dev.fireflylx.com +short
```

Each command should return the four name servers from the respective hosted zone.

### 2.6 — Delete the Management Account Hosted Zone

Once DNS is resolving correctly through the PROD hosted zone, the auto-created management account hosted zone is no longer needed:

1. In the **management account**, open **Route 53** → **Hosted zones** → `fireflylx.com`
2. Delete all non-default records (anything other than the NS and SOA records Route 53 created automatically)
3. Delete the hosted zone

::: warning
Do not delete this hosted zone until Step 2.5 passes.  The domain registration still points here until propagation completes — deleting it early will break DNS resolution.
:::

---

## Step 3: Per-Account Bootstrap

Repeat all steps in this section for both **FireFly-DEV** and **FireFly-PROD**.  Where values differ between accounts they are noted.

### 3.1 — Prepare Policy Files

Before creating any IAM resources, update the placeholder values in the `policies/` directory for the account you are currently bootstrapping.  See [Development Environment — Step 1: Prepare Policy Files](/cloud/development_environment#step-1-prepare-policy-files) for the full list of placeholders.

### 3.2 — SAM Deployment Bucket

GitHub Actions uses an S3 bucket to stage CloudFormation templates before deployment:

1. Log into the target account
2. Open **S3** → **Create bucket**
3. Region: **us-east-1**
4. Name: choose a globally unique name and record it — this becomes the `S3_SAM_DEPLOYMENT_BUCKET_NAME` GitHub secret for this environment
5. Leave all other settings at defaults → **Create bucket**

### 3.3 — OIDC Identity Provider and GitHub Actions Role

Follow the [GitHub Actions AWS Setup](/cloud/github_actions/aws-oidc-setup) guide to create the OIDC identity provider and the `firefly-github-actions-role` IAM role in the account.

### 3.4 — IAM Policies

Follow [Development Environment — IAM Policies](/cloud/development_environment#iam-policies) to create both IAM policies and attach them to the correct roles.

---

## Step 4: GitHub Environment Configuration

Once both accounts are bootstrapped, update the GitHub Actions environments under **Settings → Environments**.

::: info
Secrets and variables must be set at the **environment** level, not at the repository level.
:::

### `dev` Environment — Secrets

| Name | Value |
|---|---|
| `AWS_ACCOUNT_ID` | FireFly-DEV account ID |
| `AWS_REGION` | `us-east-1` |
| `AWS_ROLE_ARN` | ARN of `firefly-github-actions-role` in FireFly-DEV |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID — see [Google Cloud Setup](/cloud/development_environment#google-cloud-setup) |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 Client Secret |
| `HOSTED_ZONE_ID` | Hosted zone ID of `dev.fireflylx.com` in FireFly-DEV |
| `S3_FIRMWARE_PRIVATE_BUCKET_NAME` | Your chosen name for the private firmware bucket |
| `S3_FIRMWARE_PUBLIC_BUCKET_NAME` | Your chosen name for the public firmware bucket |
| `S3_UI_BUCKET_NAME` | Your chosen name for the UI static files bucket |
| `S3_SAM_DEPLOYMENT_BUCKET_NAME` | SAM bucket created in Step 3.2 |

### `dev` Environment — Variables

| Name | Value |
|---|---|
| `API_DOMAIN_NAME` | `api.dev.fireflylx.com` |
| `APPCONFIG_EXTENSION_LAYER_ARM64_ARN` | ARN from the [AWS version reference](https://docs.aws.amazon.com/appconfig/latest/userguide/appconfig-integration-lambda-extensions-versions.html) |
| `AUTH_DOMAIN_NAME` | `auth.dev.fireflylx.com` |
| `CERTIFICATE_DOMAIN_NAME` | `*.dev.fireflylx.com` |
| `CLEANUP_TEST_RECORDS` | `true` |
| `CLOUD_FORMATION_EXECUTION_ROLE_NAME` | `firefly-cloudformation-execution-role` |
| `FIRMWARE_DOMAIN_NAME` | `firmware.dev.fireflylx.com` |
| `FIRMWARE_TYPE_MAP` | `{"Controller":"FireFly Controller"}` |
| `UI_DOMAIN_NAME` | `ui.dev.fireflylx.com` |

### `production` Environment — Secrets

Same as `dev`, using FireFly-PROD account values.

### `production` Environment — Variables

| Name | Value |
|---|---|
| `API_DOMAIN_NAME` | `api.fireflylx.com` |
| `APPCONFIG_EXTENSION_LAYER_ARM64_ARN` | ARN from the [AWS version reference](https://docs.aws.amazon.com/appconfig/latest/userguide/appconfig-integration-lambda-extensions-versions.html) |
| `AUTH_DOMAIN_NAME` | `auth.fireflylx.com` |
| `CERTIFICATE_DOMAIN_NAME` | `*.fireflylx.com` |
| `CLEANUP_TEST_RECORDS` | `true` |
| `CLOUD_FORMATION_EXECUTION_ROLE_NAME` | `firefly-cloudformation-execution-role` |
| `FIRMWARE_DOMAIN_NAME` | `firmware.fireflylx.com` |
| `FIRMWARE_TYPE_MAP` | `{"Controller":"FireFly Controller"}` |
| `UI_DOMAIN_NAME` | `ui.fireflylx.com` |

---

## Next Steps

With both accounts bootstrapped and GitHub environments configured, run the `deploy-all` workflow targeting `dev` to perform the first end-to-end deployment.  See [GitHub Actions Workflows](/cloud/github_actions/index) for the full deployment reference.
