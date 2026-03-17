# func-api-users-post

## Description

Adds a user's email address to the `firefly-users` allowed list, granting them permission to sign in with Google.  This is the invitation mechanism — no email is sent automatically; the inviting super user must notify the recipient directly.

Super user access is required.  The function validates the email format and rejects duplicate invitations.

## Invocation

Invoked by **API Gateway** on an HTTP `POST /users` request.

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/users` | Super user | Invite a new user |

## Request Body

```json
{
  "email": "user@example.com",
  "environments": ["dev", "production"]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | Google email address; must be a valid email format |
| `environments` | string[] | Yes | One or both of `"dev"`, `"production"` |

## Response Codes

| Code | Reason |
|---|---|
| `201 Created` | User added to allowed list |
| `400 Bad Request` | Missing or invalid email; missing or invalid environments |
| `403 Forbidden` | Caller is not a super user |
| `409 Conflict` | Email already exists in the allowed list |

See the [API Reference](/cloud/api_reference) for full schema documentation.
