# func-cognito-pre-signup

## Description

Cognito pre-signup Lambda trigger that enforces invitation-only access control.  Fires before a new user account is created in the User Pool.

For Google federated sign-ins, the function:
1. Looks up the user's email address in the `firefly-users` DynamoDB table (the allowed list).
2. Allows the sign-in if the email is found and the invitation has not expired; raises an exception to block it otherwise.

Admin-created users (e.g., the first super user bootstrapped via the Cognito console, or test users created with `AdminCreateUser`) always pass through without an allowed-list check.

## Invocation

Invoked by **Cognito** as a [pre-signup Lambda trigger](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-pre-sign-up.html) before a new user is confirmed in the User Pool.

## Sequence Diagram

[![Sequence Diagram](./images/func-cognito-pre-signup.svg)](./images/func-cognito-pre-signup.svg)

## Trigger Sources

| `triggerSource` | Behaviour |
|---|---|
| `PreSignUp_ExternalProvider` | Checks allowed list |
| `PreSignUp_AdminCreateUser` | Always allowed (bypasses allowed-list check) |

## Environment Variables

| Variable | Description |
|---|---|
| `DYNAMODB_USERS_TABLE_NAME` | Name of the `firefly-users` DynamoDB table (hardcoded: `firefly-users`) |

## Deployment

See the [deployment workflow documentation](../github_actions/func-cognito-pre-signup.md) for workflow steps, infrastructure dependencies, and failure scenarios.
