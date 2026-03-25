# func-api-users-delete

## Description

Removes a user from the Cognito User Pool and from the `firefly-users` allowed list.  If the user has not yet signed in (allowed list entry only, no Cognito account), only the allowed list entry is removed.

The function enforces the **last super user constraint**: the deletion is rejected if the target user is a super user and they are the only remaining super user in the pool.

Super user access is required.

## Invocation

Invoked by **API Gateway** on an HTTP `DELETE /users/{email}` request.

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `DELETE` | `/users/{email}` | Super user | Delete a user |

## Response Codes

| Code | Reason |
|---|---|
| `200 OK` | User deleted |
| `403 Forbidden` | Caller is not a super user |
| `404 Not Found` | User not found |
| `409 Conflict` | Target is the last super user |

See the [API Reference](/cloud/api_reference) for full schema documentation.

## Deployment

See the [deployment workflow documentation](../github_actions/func-api-users-delete.md) for workflow steps, infrastructure dependencies, and failure scenarios.
