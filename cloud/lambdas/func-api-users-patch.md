# func-api-users-patch

## Description

Updates a user's super user status and/or environment access.

- **`is_super`** — adds or removes the user from the Cognito `super_users` group. The last super user cannot be demoted.
- **`environments`** — replaces the user's environment list in DynamoDB. The caller may only grant environments they themselves have access to.

At least one field must be provided. Both fields may be updated in a single request.

Super user access is required.

## Invocation

Invoked by **API Gateway** on an HTTP `PATCH /users/{email}` request.

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `PATCH` | `/users/{email}` | Super user | Update super user status and/or environment access |

## Request Body

```json
{
  "is_super": true
}
```

```json
{
  "environments": ["dev", "production"]
}
```

```json
{
  "is_super": false,
  "environments": ["dev"]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `is_super` | boolean | No* | `true` to grant super status; `false` to revoke it |
| `environments` | string[] | No* | Replacement list of environments (`dev`, `production`). Must be non-empty. |

\* At least one field must be provided.

## Environment Access Rules

The caller's environments are looked up from DynamoDB. If the caller attempts to grant an environment they don't have access to, the request is rejected with `403 Forbidden`. Every user — including bootstrapped super users — must have a DynamoDB record.

## Response Codes

| Code | Reason |
|---|---|
| `200 OK` | User updated; response echoes the fields that were changed |
| `400 Bad Request` | Missing or invalid fields |
| `403 Forbidden` | Caller is not a super user, or attempting to grant an environment they don't have |
| `404 Not Found` | User not found in Cognito when updating `is_super` (user may not have signed in yet) |
| `409 Conflict` | Cannot demote the last super user |

See the [API Reference](/cloud/api_reference) for full schema documentation.

## Deployment

See the [deployment workflow documentation](../github_actions/func-api-users-patch.md) for workflow steps, infrastructure dependencies, and failure scenarios.
