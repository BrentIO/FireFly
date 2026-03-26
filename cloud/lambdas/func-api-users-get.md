# func-api-users-get

## Description

Returns the combined list of all users: Cognito accounts (users who have signed in) merged with invited-only DynamoDB records (users who have been invited but have not yet signed in).

Super user access is required.  Regular users receive `403 Forbidden`.

Expired invitations (`expires_at` in the past) are excluded from the response.

## Invocation

Invoked by **API Gateway** on an HTTP `GET /users` request.

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/users` | Super user | List all users |

## Response

```json
{
  "users": [
    {
      "email": "user@example.com",
      "name": "User Name",
      "is_super": false,
      "status": "CONFIRMED",
      "created": "2026-01-01T00:00:00+00:00",
      "invited_by": "admin@example.com"
    },
    {
      "email": "pending@example.com",
      "name": null,
      "is_super": false,
      "status": "INVITED",
      "created": "2026-01-02T00:00:00+00:00",
      "invited_by": "admin@example.com"
    }
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `email` | string | User's email address |
| `name` | string \| null | Display name from Cognito; `null` for invited-only users |
| `is_super` | boolean | Whether the user is in the `super_users` Cognito group |
| `status` | string | Cognito `UserStatus` for signed-in users; `"INVITED"` for pending invitations |
| `created` | string | ISO-8601 timestamp of Cognito account creation or invitation |
| `invited_by` | string \| null | Email of the super user who sent the invitation |

See the [API Reference](/cloud/api_reference) for full schema documentation.

## Deployment

See the [deployment workflow documentation](../github_actions/func-api-users-get.md) for workflow steps, infrastructure dependencies, and failure scenarios.
