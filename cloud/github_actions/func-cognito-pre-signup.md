# func-cognito-pre-signup

## Overview

Manages the Lambda function that acts as the Cognito pre-signup trigger. When a user attempts to register, Cognito invokes this function synchronously. The function checks the DynamoDB users table for the user's email address and rejects the sign-up if the email is not in the allowlist, enforcing invitation-only access.

## CloudFormation Stack

`firefly-func-cognito-pre-signup`

## CloudWatch Logs

| Setting | Value |
|---|---|
| Log group | `/aws/lambda/firefly-func-cognito-pre-signup` |
| Retention | 30 days |

## Dependencies

### Deploy Dependencies

| Workflow | Reason |
|---|---|
| [dynamodb-users](./dynamodb-users.md) | Users allowlist table must exist; table name passed as SAM parameter |

### Delete Dependencies

| Workflow | Reason |
|---|---|
| [cognito](./cognito.md) | Cognito trigger must be removed (by deleting the Cognito stack) before this function can be deleted |

## Required By

### Required By Deploy

| Workflow | Reason |
|---|---|
| [cognito](./cognito.md) | Cognito stack references this function's ARN as a pre-signup trigger |

### Required By Delete

| Workflow | Reason |
|---|---|
| [dynamodb-users](./dynamodb-users.md) | Users table cannot be deleted until no function references it |

## Deploy Workflow

### Description

Builds and deploys the function using SAM. The DynamoDB users table name is passed as a parameter. The function ARN is exported as a CloudFormation output so the `cognito` stack can reference it as a trigger.

### Steps

1. Configure AWS credentials.
2. SAM build `lambdas/func-cognito-pre-signup/template.yaml`.
3. SAM deploy with parameters:
   - `DynamoDbUsersTableName` (from vars)

### Sequence Diagram

[![Deploy Sequence](./images/deploy-func-cognito-pre-signup.svg)](./images/deploy-func-cognito-pre-signup.svg)

## Delete Workflow

### Description

Runs `sam delete` to remove the CloudFormation stack and the Lambda function. The `cognito` stack must be deleted first so the pre-signup trigger reference is removed from the User Pool before the function is deleted.

### Steps

1. Configure AWS credentials.
2. SAM delete `firefly-func-cognito-pre-signup`.

### Sequence Diagram

[![Delete Sequence](./images/delete-func-cognito-pre-signup.svg)](./images/delete-func-cognito-pre-signup.svg)

## Failure Scenarios

| Scenario | Behavior |
|---|---|
| DynamoDB users table not deployed | Function deploys successfully but returns an error at Cognito trigger time when attempting to look up the email in a non-existent table. Deploy `dynamodb-users` first. |
| Cognito still has this Lambda as a trigger | CloudFormation may refuse to delete the function while the Cognito User Pool holds a resource-based policy referencing it. Run `delete-cognito` before this workflow to remove the trigger. |
