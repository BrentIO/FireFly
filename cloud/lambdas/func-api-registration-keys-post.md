# func-api-registration-keys-post

## Description

Generates a one-time device registration key and stores it in the `firefly-registration-keys` DynamoDB table. The key is a 6-character uppercase alphanumeric string with a 30-minute TTL. The caller shares the key with the person performing device registration — they enter it in the HW-Reg Cloud Registration screen. Each key can only be used once; it is consumed and deleted when a device registers successfully.

The key is stored alongside the generating user's Cognito sub and email address so that the registering device can record who authorized the registration.

Requires a valid Cognito JWT (any authenticated user).

## Invocation

Invoked by **API Gateway** on an HTTP `POST /registration-keys` request.

## Sequence Diagram

[![Sequence Diagram](./images/func-api-registration-keys-post.svg)](./images/func-api-registration-keys-post.svg)

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/registration-keys` | Authenticated user | Generate a one-time registration key |

## Response Body

```json
{
  "key": "AB1234"
}
```

| Field | Type | Description |
|---|---|---|
| `key` | string | 6-character uppercase alphanumeric one-time key |

## DynamoDB Record

The function writes the following item to the `firefly-registration-keys` table:

| Attribute | Description |
|---|---|
| `key` | The generated key (partition key) |
| `ttl` | Unix timestamp 30 minutes after generation; used as the DynamoDB TTL attribute to auto-delete the record if unused |
| `generated_at` | Unix timestamp of key generation |
| `generated_by_sub` | Cognito subject (sub) of the generating user |
| `generated_by_email` | Email of the generating user |

## Response Codes

| Code | Reason |
|---|---|
| `201 Created` | Key generated successfully; body contains `{ "key": "..." }` |
| `401 Unauthorized` | No valid JWT present |
| `500 Internal Server Error` | Unhandled exception |

See the [API Reference](/cloud/api_reference) for full schema documentation.

## Deployment

See the [deployment workflow documentation](../github_actions/func-api-registration-keys-post.md) for workflow steps, infrastructure dependencies, and failure scenarios.
