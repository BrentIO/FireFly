# dynamodb-users

## Overview

Provisions the DynamoDB table that serves as the invitation-only allowlist for Cognito user registration. The Cognito pre-signup Lambda checks this table to block self-registration by unapproved users.

## CloudFormation Stack

`firefly-dynamodb-users`

## Dependencies

### Deploy

None — this workflow has no prerequisites.

### Delete

- `delete-func-cognito-pre-signup` — pre-signup Lambda must be deleted first
- `delete-func-api-users-post` — users POST Lambda must be deleted first
- `delete-func-api-users-delete` — users DELETE Lambda must be deleted first

## Required By

### Deploy

- `func-cognito-pre-signup` — reads the allowlist to approve or reject sign-ups
- `func-api-users-post` — writes new allowlist entries
- `func-api-users-delete` — removes allowlist entries

### Delete

None.

---

## Deploy Workflow

### Description

Builds the SAM template and deploys the `firefly-dynamodb-users` CloudFormation stack. The table holds the set of email addresses permitted to register via Cognito.

### Steps

1. Checkout repository
2. Configure AWS credentials
3. Install SAM CLI
4. `sam build` — template: `templates/dynamodb-users.yaml`
5. `sam deploy` — stack: `firefly-dynamodb-users`; no parameters (table name is hardcoded in the template)

### Sequence Diagram

[![Deploy dynamodb-users sequence](./images/deploy-dynamodb-users.svg)](./images/deploy-dynamodb-users.svg)

---

## Delete Workflow

### Description

Deletes the `firefly-dynamodb-users` CloudFormation stack. All dependent Lambda functions must be removed first so they no longer reference the table.

### Steps

1. Configure AWS credentials
2. Install SAM CLI
3. `sam delete --stack-name firefly-dynamodb-users --no-prompts --region`

### Sequence Diagram

[![Delete dynamodb-users sequence](./images/delete-dynamodb-users.svg)](./images/delete-dynamodb-users.svg)

---

## Failure Scenarios

| Scenario | Cause | Resolution |
|---|---|---|
| Stack in bad state with existing table data | DynamoDB by default will not delete a non-empty table during rollback | Manually empty or delete the table, then re-run |
| Deletion protection enabled | Stack deletion fails | Disable deletion protection in the console, then re-run |
| PITR delay | Some configurations block immediate deletion when PITR is active | Disable PITR on the table before deleting the stack |
