# func-api-devices-registration-get

## Description

Verifies that a device is registered with FireFly-Cloud by checking for the device's UUID in the `firefly-devices` DynamoDB table and validating an ECDSA P-256 signature over a caller-supplied nonce. Called by the HW-Reg application at boot.

This endpoint has **no** Cognito JWT authorizer — it is authenticated solely by the device's cryptographic signature. The public key used for verification is the one stored at registration time via `POST /devices/register`.

## Invocation

Invoked by **API Gateway** on an HTTP `GET /devices/{uuid}/registration` request (no JWT authorizer).

## Sequence Diagram

[![Sequence Diagram](./images/func-api-devices-registration-get.svg)](./images/func-api-devices-registration-get.svg)

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/devices/{uuid}/registration` | Device signature (headers) | Verify device registration |

## Request Headers

| Header | Required | Description |
|---|---|---|
| `X-Device-UUID` | Yes | Must match the `{uuid}` path parameter |
| `X-Device-Nonce` | Yes | Base64-encoded 32-byte random nonce |
| `X-Device-Timestamp` | Yes | ISO 8601 UTC timestamp (e.g. `2025-05-09T12:00:00Z`). Must be within ±500 ms of server time. |
| `X-Device-Signature` | Yes | Base64-encoded DER-format ECDSA P-256 signature over SHA-256(nonce_bytes \|\| timestamp_ascii_bytes) |

## Response Body

```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "product_id": "FFC0806-2505",
  "product_hex": "0x08062505",
  "device_class": "controller",
  "registration_date": "2025-04-01T12:00:00Z",
  "registering_application": "Hardware-Registration-and-Configuration",
  "registering_version": "2025.04.01"
}
```

## Response Codes

| Code | Reason |
|---|---|
| `200 OK` | Device is registered and signature is valid |
| `400 Bad Request` | Missing required headers, invalid Base64, nonce not 32 bytes, or malformed timestamp |
| `401 Unauthorized` | Device UUID not found, signature verification failed, or timestamp outside ±500 ms window |
| `403 Forbidden` | `X-Device-UUID` header does not match `{uuid}` path parameter |
| `500 Internal Server Error` | Unhandled exception |

See the [API Reference](/cloud/api_reference) for full schema documentation.

## Deployment

See the [deployment workflow documentation](../github_actions/func-api-devices-registration-get.md) for workflow steps, infrastructure dependencies, and failure scenarios.
