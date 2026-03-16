# func-api-firmware-status-patch

## Description
Transitions a firmware build to a new `release_status`. Only the following transitions are valid:

| From | To |
|---|---|
| `READY_TO_TEST` | `TESTING` |
| `TESTING` | `READY_TO_TEST` |
| `TESTING` | `RELEASED` |
| `RELEASED` | `REVOKED` |

Any other transition returns `422 Unprocessable Entity`, including the current status and the list of allowed transitions. The function looks up the record by `zip_name` using a DynamoDB GSI, then uses the primary key (`pk`, `version`) to perform the update.

### S3 Side Effects

Status transitions have S3 side effects that are performed **before** DynamoDB is updated. If an S3 operation fails, the DynamoDB record is not updated and the transition is aborted.

**`TESTING` → `RELEASED`:** The firmware ZIP is downloaded from the private bucket (`processed/{zip_name}`), extracted, and each file (excluding `config.bin` and `manifest.json`) is uploaded to the public bucket at `{product_id}/{application}/{version}/{filename}`. These files are then accessible via the CloudFront distribution.

**`RELEASED` → `REVOKED`:** All objects under `{product_id}/{application}/{version}/` in the public bucket are moved to `revoked/{product_id}/{application}/{version}/`. A bucket policy `Deny` on the `revoked/` prefix makes these files immediately inaccessible. A 90-day S3 lifecycle rule on the `revoked/` prefix expires the objects automatically. The DynamoDB TTL is also set to 10 days when the record is marked `REVOKED`.

## Invocation
Invoked by **API Gateway** on an HTTP `PATCH /firmware/{zip_name}/status` request with a JSON body containing the desired `release_status`.

## Sequence Diagram

![Sequence Diagram](./images/func-api-firmware-status-patch.svg)

## API Endpoints
| Method | Path | Description |
|---|---|---|
| `PATCH` | `/firmware/{zip_name}/status` | Transition firmware to a new release status |

See the [API Reference](/cloud/api_reference) for full schema documentation.

## Complete Status State Machine

All possible `release_status` values and how they are set:

![Status State Machine](./images/func-api-firmware-status-patch-states.svg)

| Status | Set By | Description |
|---|---|---|
| `PROCESSING` | `func-s3-firmware-uploaded` | Transient state during upload processing; not normally visible via API |
| `READY_TO_TEST` | `func-s3-firmware-uploaded` | Upload validated successfully; awaiting testing |
| `TESTING` | This function | Firmware is under active test |
| `RELEASED` | This function | Firmware is publicly released |
| `REVOKED` | This function | Previously released firmware that has been pulled; binaries moved to `revoked/` prefix in public bucket, DynamoDB TTL set |
| `DELETED` | `func-s3-firmware-deleted` | Firmware deleted from S3; set automatically for any non-`RELEASED`/`REVOKED` record |
| `ERROR` | `func-s3-firmware-uploaded` | Upload validation failed; the `error` field contains the reason |

`REVOKED` and `DELETED` statuses cannot be set via this endpoint and cannot be reversed. The `TESTING` status can be rolled back to `READY_TO_TEST`.
