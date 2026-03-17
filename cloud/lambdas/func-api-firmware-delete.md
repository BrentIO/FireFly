# func-api-firmware-delete

## Description
Initiates deletion of a firmware build by removing its ZIP file from S3. The function returns `202 Accepted` immediately; the DynamoDB status update happens asynchronously when the S3 delete event triggers [func-s3-firmware-deleted](/cloud/lambdas/func-s3-firmware-deleted).

Before deleting, the function checks the current `release_status`:
- If the firmware is `DELETED`, `REVOKED`, or `RELEASED`, it returns `409 Conflict`. `RELEASED` firmware must be transitioned to `REVOKED` via [`PATCH /firmware/{zip_name}/status`](/cloud/lambdas/func-api-firmware-status-patch) before it can be removed.
- If the firmware is in `ERROR` state, the file is deleted from the `errors/` prefix. All other states use the `processed/` prefix.

The status transition (anything other than `RELEASED` → `DELETED`) is determined and applied by `func-s3-firmware-deleted`, not by this function.

## Invocation
Invoked by **API Gateway** on an HTTP `DELETE /firmware/{zip_name}` request.

## Sequence Diagram

[![Sequence Diagram](./images/func-api-firmware-delete.svg)](./images/func-api-firmware-delete.svg)

## API Endpoints
| Method | Path | Description |
|---|---|---|
| `DELETE` | `/firmware/{zip_name}` | Initiates deletion; returns 202 immediately |

See the [API Reference](/cloud/api_reference) for full schema documentation.
