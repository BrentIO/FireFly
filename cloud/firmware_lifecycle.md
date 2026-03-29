# Firmware Lifecycle

## Private Firmware S3 Bucket

| Prefix | Contents | Cleanup Method | Duration |
|--------|----------|----------------|----------|
| `incoming/` | New firmware ZIP uploads | S3 Lifecycle Rule | 1 day |
| `processing/` | Firmware being validated | S3 Lifecycle Rule | 1 day |
| `processed/` | Validated firmware ZIPs | S3 Lifecycle Rule | 30 days |
| `error/` | Failed firmware uploads | S3 Lifecycle Rule | 7 days |

## Public Firmware S3 Bucket

| Prefix | Contents | Cleanup Method | Duration |
|--------|----------|----------------|----------|
| `revoked/` | Revoked firmware binaries | S3 Lifecycle Rule | 90 days |

## DynamoDB Firmware Table

| Status | Cleanup Method | Duration |
|--------|----------------|----------|
| `DELETED` | DynamoDB TTL | 10 days after file deletion |
| `REVOKED` | DynamoDB TTL | 10 days after file deletion |
