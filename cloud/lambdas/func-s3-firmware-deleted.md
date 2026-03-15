# func-s3-firmware-deleted

## Description
Responds to a firmware ZIP being deleted from S3. The function updates the corresponding DynamoDB record's `release_status` and sets a TTL so the record is automatically purged after 10 days.

The function processes events from both the `processed/` and `errors/` prefixes. Deletions from any other prefix are ignored.

Records in `RELEASED` or `REVOKED` state are skipped — their lifecycle is managed by [func-api-firmware-status-patch](/cloud/lambdas/func-api-firmware-status-patch), which sets the status and TTL when those transitions occur via the API. Deletions from the private bucket for these records are triggered by S3 lifecycle expiry and should not alter the DynamoDB record.

For all other states, the record is updated to `DELETED`.

The record is located by querying a DynamoDB GSI (`zip_name-index`) using the UUID filename extracted from the S3 key.

## Invocation
Invoked by an **S3 event notification** when a `.zip` file is deleted from the `processed/` or `errors/` prefix of the firmware bucket. This is typically triggered by [func-api-firmware-delete](/cloud/lambdas/func-api-firmware-delete), but may also be triggered by any direct S3 deletion (e.g. manual cleanup or S3 lifecycle expiry).

## Sequence Diagram

![Sequence Diagram](./images/func-s3-firmware-deleted.svg)

## API Endpoints
This function is not invoked via API Gateway and has no associated API endpoints.

## TTL Behavior

After updating the `release_status`, this function sets a DynamoDB `ttl` attribute on the record to 10 days from the time of deletion.  DynamoDB will automatically delete the record once the TTL expires, keeping the table free of stale entries.

::: info Note
DynamoDB TTL deletion is eventually consistent and may take up to 48 hours after the TTL timestamp before the item is actually removed.
:::
