# func-api-devices-backup-get

## Description

Retrieves the stored encrypted configuration backup for a device. Returns the raw FFCE-format ciphertext blob from S3. The caller (the FireFly Controller firmware) decrypts the blob on-device with `key_backup` (HKDF-derived from the eFuse master key with label `firefly-backup-v1`) and writes the plaintext to `backup.json` on the config file system.

This endpoint has **no** Cognito JWT authorizer — it is authenticated solely by the device's cryptographic signature.

## Invocation

Invoked by **API Gateway** on an HTTP `GET /devices/{uuid}/backup` request (no JWT authorizer).

## Sequence Diagram

[![Sequence Diagram](./images/func-api-devices-backup-get.svg)](./images/func-api-devices-backup-get.svg)

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/devices/{uuid}/backup` | Device signature (headers) | Retrieve encrypted configuration backup |

## Request Headers

| Header | Required | Description |
|---|---|---|
| `X-Device-UUID` | Yes | Must match the `{uuid}` path parameter |
| `X-Device-Nonce` | Yes | Base64-encoded 32-byte random nonce |
| `X-Device-Timestamp` | Yes | ISO 8601 UTC timestamp (e.g. `2025-05-09T12:00:00Z`) |
| `X-Device-Signature` | Yes | Base64-encoded DER ECDSA P-256 signature over SHA-256(nonce \|\| timestamp) |

## Response Body

Raw FFCE-format encrypted binary blob (base64-encoded in the Lambda response body; decoded by API Gateway before delivery). The `Content-Type` header is `application/octet-stream`.

## Response Codes

| Code | Reason |
|---|---|
| `200 OK` | Backup retrieved successfully |
| `400 Bad Request` | Missing/invalid headers or invalid Base64 |
| `401 Unauthorized` | Device UUID not found, signature invalid, or timestamp outside the acceptance window |
| `403 Forbidden` | `X-Device-UUID` header does not match `{uuid}` path parameter |
| `404 Not Found` | No backup exists for this device |
| `500 Internal Server Error` | Unhandled exception |

See the [API Reference](/cloud/api_reference) for full schema documentation.

## Deployment

See the [deployment workflow documentation](../github_actions/func-api-devices-backup-get.md) for workflow steps, infrastructure dependencies, and failure scenarios.
