# func-api-users-get

## Description

Returns the list of all users in the Cognito User Pool, including their super user status, environments, and account details.

Super user access is required.  Regular users receive `403 Forbidden`.

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
      "environments": "dev,production",
      "is_super": false,
      "status": "CONFIRMED",
      "created": "2026-01-01T00:00:00+00:00"
    }
  ]
}
```

See the [API Reference](/cloud/api_reference) for full schema documentation.
