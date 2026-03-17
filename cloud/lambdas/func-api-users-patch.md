# func-api-users-patch

## Description

Promotes or demotes a user's super user status by adding or removing them from the Cognito `super_users` group.

The function enforces the **last super user constraint**: demoting the only remaining super user is rejected.

Super user access is required.

## Invocation

Invoked by **API Gateway** on an HTTP `PATCH /users/{email}` request.

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `PATCH` | `/users/{email}` | Super user | Grant or revoke super user status |

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
| `200 OK` | Super status updated |
| `400 Bad Request` | Missing or invalid `is_super` field |
| `403 Forbidden` | Caller is not a super user |
| `404 Not Found` | User not found in Cognito (may not have signed in yet) |
| `409 Conflict` | Cannot demote the last super user |

See the [API Reference](/cloud/api_reference) for full schema documentation.
