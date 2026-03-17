# func-s3-firmware-uploaded

## Description
Processes a firmware ZIP uploaded to the `incoming/` S3 prefix. The function validates the ZIP, verifies checksums, writes a DynamoDB record, and moves the file to its final destination.

### Processing Steps
1. **Rename** — assigns a UUID filename to the ZIP at the start of processing to prevent collisions and decouple the public record identifier from the original filename.
2. **Move to `processing/`** — moves the file from `incoming/` to `processing/` to signal active processing.
3. **Download and extract** — downloads the ZIP to `/tmp` and extracts its contents.
4. **Compute ZIP SHA-256** — computes a SHA-256 checksum of the ZIP file itself.
5. **Validate `manifest.json`** — verifies that `manifest.json` is present and contains all required fields.
6. **Verify file checksums** — for each file listed in the manifest, verifies that the file exists in the ZIP and that its SHA-256 matches the manifest entry.
7. **Write DynamoDB record** — writes a record with `release_status: READY_TO_TEST`.
8. **Move to `processed/`** — moves the file from `processing/` to `processed/`.

### Error Handling
If any step fails, the function writes an `ERROR` record to DynamoDB (with whatever manifest data was available) and moves the file from `processing/` to `errors/`. The error message is stored in the `error` field of the DynamoDB record.

## Invocation
Invoked by an **S3 event notification** when a `.zip` file is created in the `incoming/` prefix of the firmware bucket. Non-ZIP keys are ignored.

## Sequence Diagram

[![Sequence Diagram](./images/func-s3-firmware-uploaded.svg)](./images/func-s3-firmware-uploaded.svg)

## API Endpoints
This function is not invoked via API Gateway and has no associated API endpoints.

## manifest.json Format

Every firmware ZIP must contain a `manifest.json` at the root with the following fields:

| Field | Type | Description |
|---|---|---|
| `class` | String | Device class (e.g., `CONTROLLER`) |
| `product_id` | String | Product identifier (e.g., `firefly-controller-v2`) |
| `application` | String | Application name (e.g., `main`) |
| `branch` | String | Source branch the firmware was built from |
| `version` | String | Version string (e.g., `2026.03.001`) |
| `commit` | String | Full 40-character Git commit SHA |
| `created` | String | ISO 8601 creation timestamp |
| `files` | Array | List of `{ "name": "<filename>", "sha256": "<64-char hex>" }` objects |

All files listed in `files` must be present in the ZIP with matching SHA-256 checksums.

```json
{
  "product_id": "firefly-controller-v2",
  "version": "2026.03.001",
  "class": "CONTROLLER",
  "application": "main",
  "branch": "main",
  "commit": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
  "created": "2026-03-15T00:00:00Z",
  "files": [
    { "name": "firmware.bin", "sha256": "<64-char hex>" }
  ]
}
```

## S3 Bucket Layout

The firmware bucket uses prefixes to track the state of files through processing:

| Prefix | Purpose |
|---|---|
| `incoming/` | Drop zone for newly uploaded ZIPs. Files here trigger this function. |
| `processing/` | File is moved here at the start of processing to signal active work. |
| `processed/` | Final destination for successfully validated ZIPs. |
| `errors/` | ZIPs that failed validation are moved here. |

### Lifecycle Rules

S3 lifecycle rules automatically expire objects in each prefix:

| Prefix | Retention |
|---|---|
| `incoming/` | 1 day |
| `processing/` | 1 day |
| `errors/` | 7 days |
| `processed/` | 30 days |

## DynamoDB Record

On successful processing, the function writes a record to the firmware table with the following structure:

**Primary Key:**

| Key | Type | Value |
|---|---|---|
| `pk` *(partition key)* | String | `{product_id}#{application}` — internal composite key, excluded from API responses |
| `version` *(sort key)* | String | Firmware version string (e.g., `2026.03.001`); error records use `ERROR#{version}#{uuid}` |

**Global Secondary Indexes:**

| Index | Partition Key | Use Case |
|---|---|---|
| `product_id-index` | `product_id` | Filter list queries by product |
| `zip_name-index` | `zip_name` | Single-item lookups by UUID filename |

**Notable Attributes:**

| Attribute | Description |
|---|---|
| `zip_name` | UUID filename (e.g., `550e8400-e29b-41d4-a716-446655440000.zip`) — the primary identifier used in all API paths |
| `release_status` | Initial value is `READY_TO_TEST`; see [func-api-firmware-status-patch](/cloud/lambdas/func-api-firmware-status-patch) for valid transitions |
| `files` | Array of `{ name, sha256 }` objects from the manifest — only returned by single-item GET requests |
| `error` | Set only on `ERROR` records; contains the failure reason |
