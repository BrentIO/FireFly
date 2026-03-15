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
