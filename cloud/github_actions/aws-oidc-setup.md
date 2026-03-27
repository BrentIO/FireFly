# GitHub Actions AWS Setup

GitHub Actions authenticates to AWS using OpenID Connect (OIDC). Each workflow assumes an IAM role via a short-lived token issued by GitHub — no long-lived access keys are stored anywhere.

---

## Prerequisites

- AWS console access to the target account with IAM admin permissions
- Admin access to the GitHub repository settings

---

## Step 1 — Create the OIDC Identity Provider

1. Open the [AWS IAM console](https://console.aws.amazon.com/iam) → **Identity providers** → **Add provider**
2. Select **OpenID Connect**
3. Enter:
   - **Provider URL:** `https://token.actions.githubusercontent.com`
   - **Audience:** `sts.amazonaws.com`
4. Click **Add provider**

---

## Step 2 — Create the IAM Role

1. Open **IAM** → **Roles** → **Create role**
2. Select **Web identity** as the trusted entity type
3. Configure the identity provider:
   - **Identity provider:** `token.actions.githubusercontent.com`
   - **Audience:** `sts.amazonaws.com`
   - **GitHub organization:** `BrentIO`
   - **GitHub repository:** `FireFly-Cloud`
4. Click **Next** and attach the `FireFly-github-actions` **access policy** (not the execution policy — that is a separate role used by CloudFormation itself)
5. Name the role `firefly-github-actions-role` and create it
6. After the role is created, go to **Trust relationships** → **Edit trust policy** and replace the generated policy with the contents of [`policies/firefly-github-actions-role_trust-relationships.json`](https://github.com/BrentIO/FireFly-Cloud/blob/main/policies/firefly-github-actions-role_trust-relationships.json), substituting `AWS_ACCOUNT_ID` with the AWS account ID. The console-generated `sub` condition is often malformed — the policy template contains the correct form.

7. Copy the **Role ARN** — you will need it in the next step

---

## Step 3 — Add the Role ARN to GitHub Secrets

1. Go to the GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Add a new repository secret:
   - **Name:** `AWS_ROLE_ARN`
   - **Value:** the Role ARN from Step 2

---

## Step 4 — Configure the Workflows

Every workflow file requires `id-token: write` permission on the job and uses `role-to-assume` instead of access key secrets:

```yaml
jobs:
  my-job:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v6
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ secrets.AWS_REGION }}
```

::: info ACM workflows use a hardcoded region
`deploy-acm.yaml` and `delete-acm.yaml` use `us-east-1` directly instead of `${{ secrets.AWS_REGION }}` because ACM certificates for CloudFront must be provisioned in us-east-1 regardless of the deployment region.
:::

---

## Step 5 — Verify

Run the `deploy-all` workflow and confirm all jobs succeed before proceeding.

---

## Step 6 — Remove the `AWS_REGION` Secret

`AWS_REGION` can be replaced with a repository variable (not a secret) since it is not sensitive. Alternatively, hardcode the region directly in the workflows.
