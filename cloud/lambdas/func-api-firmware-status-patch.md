# func-api-firmware-status-patch

## Description
Transitions a firmware build to a new `release_status`. Only the following transitions are valid:

| From | To |
|---|---|
| `READY_TO_TEST` | `TESTING` |
| `TESTING` | `RELEASED` |
| `RELEASED` | `REVOKED` |

Any other transition returns `422 Unprocessable Entity`, including the current status and the list of allowed transitions. The function looks up the record by `zip_name` using a DynamoDB GSI, then uses the primary key (`pk`, `version`) to perform the update.

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

```
                    ┌─────────────────┐
         upload OK  │  READY_TO_TEST  │
        ────────────►                 │
                    └────────┬────────┘
                             │ PATCH /status
                             ▼
                    ┌─────────────────┐
                    │    TESTING      │
                    └────────┬────────┘
                             │ PATCH /status
                             ▼
                    ┌─────────────────┐
                    │    RELEASED     │
                    └────────┬────────┘
                             │ PATCH /status  ─── or ───  DELETE /firmware/{zip_name}
                             ▼                                       │
                    ┌─────────────────┐                              ▼
                    │    REVOKED      │               ┌──────────────────────────┐
                    └─────────────────┘               │         DELETED          │
                                                      └──────────────────────────┘
```

| Status | Set By | Description |
|---|---|---|
| `PROCESSING` | `func-s3-firmware-uploaded` | Transient state during upload processing; not normally visible via API |
| `READY_TO_TEST` | `func-s3-firmware-uploaded` | Upload validated successfully; awaiting testing |
| `TESTING` | This function | Firmware is under active test |
| `RELEASED` | This function | Firmware is publicly released |
| `REVOKED` | `func-s3-firmware-deleted` | Previously released firmware that has been pulled; set automatically when a `RELEASED` record's S3 file is deleted |
| `DELETED` | `func-s3-firmware-deleted` | Firmware deleted from S3; set automatically for any non-`RELEASED` record |
| `ERROR` | `func-s3-firmware-uploaded` | Upload validation failed; the `error` field contains the reason |

`REVOKED` and `DELETED` statuses cannot be set via this endpoint and cannot be reversed.
