# func-s3-firmware-uploaded

## Description
Processes a firmware ZIP uploaded to the `incoming/` S3 prefix. The function validates the ZIP, verifies checksums, writes a DynamoDB record, and moves the file to its final destination.

### Processing Steps
1. **Rename** — assigns a UUID filename to the ZIP at the start of processing to prevent collisions and decouple the public record identifier from the original filename.
2. **Move to `processing/`** — moves the file from `incoming/` to `processing/` to signal active processing.
3. **Download and extract** — downloads the ZIP to `/tmp` and extracts its contents.
4. **Compute ZIP SHA-256** — computes a SHA-256 checksum of the ZIP file itself.
5. **Validate `manifest.json`** — verifies that `manifest.json` is present and contains all required fields (`class`, `product_id`, `application`, `branch`, `version`, `commit`, `created`, `files`).
6. **Verify file checksums** — for each file listed in the manifest, verifies that the file exists in the ZIP and that its SHA-256 matches the manifest entry.
7. **Write DynamoDB record** — writes a record with `release_status: READY_TO_TEST`.
8. **Move to `processed/`** — moves the file from `processing/` to `processed/`.

### Error Handling
If any step fails, the function writes an `ERROR` record to DynamoDB (with whatever manifest data was available) and moves the file from `processing/` to `errors/`. The error message is stored in the `error` field of the DynamoDB record.

## Invocation
Invoked by an **S3 event notification** when a `.zip` file is created in the `incoming/` prefix of the firmware bucket. Non-ZIP keys are ignored.

## Sequence Diagram

![Sequence Diagram](./images/func-s3-firmware-uploaded.svg)

## API Endpoints
This function is not invoked via API Gateway and has no associated API endpoints.
