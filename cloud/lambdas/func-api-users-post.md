# func-api-users-post

## Description

Adds a user's email address to the `firefly-users` DynamoDB allowed list, granting them permission to sign in with Google.  This is the invitation mechanism — no email is sent automatically; the inviting super user must notify the recipient directly.

Invitations expire after **24 hours**.  If the invited user does not sign in within that window, the invitation is automatically removed by DynamoDB TTL and they must be re-invited.

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

## DynamoDB Record

The function writes the following item to the `firefly-users` table:

| Attribute | Description |
|---|---|
| `email` | The invited user's email (partition key) |
| `environments` | List of permitted environments |
| `invited_by` | Email of the super user who sent the invitation |
| `created_at` | ISO-8601 timestamp of the invitation |
| `expires_at` | Unix timestamp 24 hours after `created_at`; used as the DynamoDB TTL attribute to auto-delete the record if the user does not sign in |

## Response Codes

| Code | Reason |
|---|---|
| `201 Created` | User added to allowed list |
| `400 Bad Request` | Missing or invalid email; missing or invalid environments |
| `403 Forbidden` | Caller is not a super user |
| `409 Conflict` | Email already exists in the allowed list |

See the [API Reference](/cloud/api_reference) for full schema documentation.
