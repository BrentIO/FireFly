# func-api-users-patch

## Description

Updates a user's super user status.

- **`is_super`** — adds or removes the user from the Cognito `super_users` group. The last super user cannot be demoted.

Super user access is required.

## Invocation

Invoked by **API Gateway** on an HTTP `PATCH /users/{email}` request.

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `PATCH` | `/users/{email}` | Super user | Update super user status |

## Request Body

```json
{
  "is_super": true
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `is_super` | boolean | Yes | `true` to grant super status; `false` to revoke it |

## Response Codes

| Code | Reason |
|---|---|
| `200 OK` | User updated |
| `400 Bad Request` | Missing or invalid `is_super` field |
| `403 Forbidden` | Caller is not a super user |
| `404 Not Found` | User not found in Cognito (user may not have signed in yet) |
| `409 Conflict` | Cannot demote the last super user |

See the [API Reference](/cloud/api_reference) for full schema documentation.

## Deployment

See the [deployment workflow documentation](../github_actions/func-api-users-patch.md) for workflow steps, infrastructure dependencies, and failure scenarios.
