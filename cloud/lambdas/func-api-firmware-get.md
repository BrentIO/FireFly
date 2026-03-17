# func-api-firmware-get

## Description
Handles two read operations against the firmware DynamoDB table:

- **List** (`GET /firmware`) — returns all firmware records, optionally filtered by `product_id`, `application`, and/or `version`. The `files` array is excluded from list responses to keep payloads small.
- **Get** (`GET /firmware/{zip_name}`) — returns the full record for a specific build, including the `files` array. The `zip_name` (a UUID filename) is the unique identifier for a specific build, since the same product and version may have multiple builds from different commits.

When filtering by `product_id`, the function queries a DynamoDB GSI (`product_id-index`) for efficiency. All other filtering uses a full table scan, which is acceptable given the expected table size.

## Invocation
Invoked by **API Gateway** on an HTTP `GET` request to `/firmware` or `/firmware/{zip_name}`.

## Sequence Diagram

### List firmware

[![List firmware sequence diagram](./images/func-api-firmware-get-list.svg)](./images/func-api-firmware-get-list.svg)

### Get single firmware record

[![Get firmware item sequence diagram](./images/func-api-firmware-get-item.svg)](./images/func-api-firmware-get-item.svg)

## API Endpoints
| Method | Path | Description |
|---|---|---|
| `GET` | `/firmware` | List all firmware records, with optional filters |
| `GET` | `/firmware/{zip_name}` | Get the full record for a specific build |

See the [API Reference](/cloud/api_reference) for full schema documentation.
