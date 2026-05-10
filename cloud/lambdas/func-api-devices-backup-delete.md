# func-api-devices-backup-delete

## Description

Deletes the stored encrypted configuration backup for a device. Removes the object `{uuid}/backup.ffce` from S3 (idempotent — succeeds even if no backup exists) and clears `last_backup_date` from the device's DynamoDB record.

This endpoint has **no** Cognito JWT authorizer — it is authenticated solely by the device's cryptographic signature.

## Invocation

Invoked by **API Gateway** on an HTTP `DELETE /devices/{uuid}/backup` request (no JWT authorizer).

## Sequence Diagram

[![Sequence Diagram](./images/func-api-devices-backup-delete.svg)](./images/func-api-devices-backup-delete.svg)

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `DELETE` | `/devices/{uuid}/backup` | Device signature (headers) | Delete stored configuration backup |

## Request Headers

| Header | Required | Description |
|---|---|---|
| `X-Device-UUID` | Yes | Must match the `{uuid}` path parameter |
| `X-Device-Nonce` | Yes | Base64-encoded 32-byte random nonce |
| `X-Device-Timestamp` | Yes | ISO 8601 UTC timestamp (e.g. `2025-05-09T12:00:00Z`) |
| `X-Device-Signature` | Yes | Base64-encoded DER ECDSA P-256 signature over SHA-256(nonce \|\| timestamp) |

## Response Body

```json
{
  "message": "Backup deleted"
}
```

## Response Codes

| Code | Reason |
|---|---|
| `200 OK` | Backup deleted (or did not exist) |
| `400 Bad Request` | Missing/invalid headers or invalid Base64 |
| `401 Unauthorized` | Device UUID not found, signature invalid, or timestamp outside ±500 ms window |
| `403 Forbidden` | `X-Device-UUID` header does not match `{uuid}` path parameter |
| `500 Internal Server Error` | Unhandled exception |

See the [API Reference](/cloud/api_reference) for full schema documentation.

## Deployment

See the [deployment workflow documentation](../github_actions/func-api-devices-backup-delete.md) for workflow steps, infrastructure dependencies, and failure scenarios.
