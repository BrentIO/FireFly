# func-api-firmware-download-get

## Description

Returns a pre-signed S3 URL for downloading the firmware ZIP from the private bucket. The URL expires after 15 minutes and is intended for testing — it provides temporary access to the raw ZIP without exposing the private bucket publicly.

The function looks up the record by `zip_name` using a DynamoDB GSI to determine the correct S3 prefix before generating the URL:

- `ERROR` records resolve to the `errors/` prefix
- All other active statuses resolve to the `processed/` prefix
- `PROCESSING` returns `409 Conflict` — the file may not yet be in its final location
- `DELETED` returns `410 Gone` — the ZIP no longer exists in S3

## Invocation

Invoked by **API Gateway** on an HTTP `GET /firmware/{zip_name}/download` request.

## Sequence Diagram

[![Sequence Diagram](./images/func-api-firmware-download-get.svg)](./images/func-api-firmware-download-get.svg)

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/firmware/{zip_name}/download` | Returns a pre-signed URL for the firmware ZIP |

See the [API Reference](/cloud/api_reference) for full schema documentation.

## Response Format

| Field | Description |
|---|---|
| `url` | Pre-signed S3 URL. Valid for `expires_in` seconds from the time of the request. |
| `expires_in` | Seconds until the URL expires (always `900`). |

```json
{
    "url": "https://firefly-firmware.s3.amazonaws.com/processed/550e8400-...zip?X-Amz-Algorithm=...",
    "expires_in": 900
}
```
