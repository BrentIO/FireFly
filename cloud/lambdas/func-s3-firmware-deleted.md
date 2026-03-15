# func-s3-firmware-deleted

## Description
Responds to a firmware ZIP being deleted from S3. The function updates the corresponding DynamoDB record's `release_status` and sets a TTL so the record is automatically purged after 10 days.

The new status is determined by the record's current state at the time of deletion:
- `RELEASED` → `REVOKED` (the firmware was publicly available before being pulled)
- Anything else → `DELETED`

The function processes events from both the `processed/` and `errors/` prefixes. Deletions from any other prefix are ignored.

The record is located by querying a DynamoDB GSI (`zip_name-index`) using the UUID filename extracted from the S3 key.

## Invocation
Invoked by an **S3 event notification** when a `.zip` file is deleted from the `processed/` or `errors/` prefix of the firmware bucket. This is typically triggered by [func-api-firmware-delete](/cloud/lambdas/func-api-firmware-delete), but may also be triggered by any direct S3 deletion (e.g. manual cleanup).

## Sequence Diagram

![Sequence Diagram](./images/func-s3-firmware-deleted.svg)

## API Endpoints
This function is not invoked via API Gateway and has no associated API endpoints.
