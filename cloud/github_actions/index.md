# GitHub Actions Workflows

GitHub Actions workflows that deploy and delete all FireFly-Cloud AWS infrastructure. Each workflow manages a single CloudFormation stack. Two orchestration workflows (`deploy-all` and `delete-all`) coordinate the full set in dependency order.

## Workflow Index

| Workflow | CloudFormation Stack | Purpose |
|---|---|---|
| [acm-api-gateway](./acm-api-gateway.md) | `firefly-acm-api-gateway` | ACM certificate for API Gateway and CloudFront custom domains |
| [acm-cognito](./acm-cognito.md) | `firefly-acm-cognito` | ACM certificate for Cognito custom auth domain (must be us-east-1) |
| [api-gateway](./api-gateway.md) | `firefly-api-gateway` | HTTP API Gateway with custom domain, Cognito JWT authorizer, CORS |
| [cloudfront](./cloudfront.md) | `firefly-cloudfront` | CloudFront distribution + Route 53 alias for firmware OTA delivery |
| [cloudfront-ui](./cloudfront-ui.md) | `firefly-cloudfront-ui` | CloudFront distribution + Route 53 alias for the web UI |
| [cognito](./cognito.md) | `firefly-cognito` | Cognito User Pool with Google IdP, custom domain, pre-signup Lambda |
| [dynamodb-firmware](./dynamodb-firmware.md) | `firefly-dynamodb-firmware` | DynamoDB table for firmware metadata |
| [dynamodb-users](./dynamodb-users.md) | `firefly-dynamodb-users` | DynamoDB allowlist table for invitation-only Cognito pre-signup |
| [func-api-firmware-delete](./func-api-firmware-delete.md) | `firefly-func-api-firmware-delete` | Lambda: DELETE /firmware/{zip_name} |
| [func-api-firmware-download-get](./func-api-firmware-download-get.md) | `firefly-func-api-firmware-download-get` | Lambda: GET /firmware/{zip_name}/download |
| [func-api-firmware-get](./func-api-firmware-get.md) | `firefly-func-api-firmware-get` | Lambda: GET /firmware, GET /firmware/{zip_name} |
| [func-api-firmware-status-patch](./func-api-firmware-status-patch.md) | `firefly-func-api-firmware-status-patch` | Lambda: PATCH /firmware/{zip_name}/status |
| [func-api-health-get](./func-api-health-get.md) | `firefly-func-api-health-get` | Lambda: GET /health |
| [func-api-ota-get](./func-api-ota-get.md) | `firefly-func-api-ota-get` | Lambda: GET /ota/{product_id}/{application} |
| [func-api-users-delete](./func-api-users-delete.md) | `firefly-func-api-users-delete` | Lambda: DELETE /users/{username} |
| [func-api-users-get](./func-api-users-get.md) | `firefly-func-api-users-get` | Lambda: GET /users |
| [func-api-users-patch](./func-api-users-patch.md) | `firefly-func-api-users-patch` | Lambda: PATCH /users/{username} |
| [func-api-users-post](./func-api-users-post.md) | `firefly-func-api-users-post` | Lambda: POST /users |
| [func-cognito-pre-signup](./func-cognito-pre-signup.md) | `firefly-func-cognito-pre-signup` | Lambda: Cognito pre-signup trigger (allowlist check) |
| [func-s3-firmware-deleted](./func-s3-firmware-deleted.md) | `firefly-func-s3-firmware-deleted` | Lambda: S3 delete event on processed/ and errors/ |
| [func-s3-firmware-uploaded](./func-s3-firmware-uploaded.md) | `firefly-func-s3-firmware-uploaded` | Lambda: S3 put event on incoming/*.zip |
| [s3-firmware](./s3-firmware.md) | `firefly-s3-firmware` | Private S3 bucket for firmware ZIP processing pipeline |
| [s3-firmware-public](./s3-firmware-public.md) | `firefly-s3-firmware-public` | Public S3 bucket for released firmware binaries (behind CloudFront) |
| [s3-ui](./s3-ui.md) | `firefly-s3-ui` | S3 bucket for web UI static assets |
| [shared-layer](./shared-layer.md) | `firefly-shared-layer` | Lambda layer: shared Python modules (logging, AppConfig, feature flags) |
| [ui-app](./ui-app.md) | `firefly-ui-app` | Builds and syncs the web UI to S3; invalidates CloudFront cache |
| deploy-all | — | Orchestrates full deploy in dependency order |
| delete-all | — | Orchestrates full teardown in reverse-dependency order |

---

## deploy-all Dependency Order

Deployments run in parallel within each wave. A job only starts after all jobs in its `needs:` list have succeeded.

| Job | Needs |
|---|---|
| dynamodb-firmware | — |
| dynamodb-users | — |
| acm-cognito | — |
| acm-api-gateway | — |
| shared-layer | — |
| s3-firmware-public | — |
| s3-ui | — |
| func-cognito-pre-signup | dynamodb-users |
| cloudfront | acm-api-gateway, s3-firmware-public |
| cloudfront-ui | acm-api-gateway, s3-ui |
| cognito | acm-cognito, func-cognito-pre-signup |
| api-gateway | acm-api-gateway, cognito |
| func-api-health-get | api-gateway |
| func-api-users-get | api-gateway, cognito |
| func-api-users-post | api-gateway, dynamodb-users |
| func-api-users-delete | api-gateway, cognito, dynamodb-users |
| func-api-users-patch | api-gateway, cognito |
| func-api-firmware-get | api-gateway, shared-layer |
| func-api-firmware-status-patch | api-gateway, shared-layer |
| func-api-firmware-delete | api-gateway, shared-layer |
| func-s3-firmware-uploaded | shared-layer |
| func-s3-firmware-deleted | shared-layer |
| func-api-ota-get | api-gateway, shared-layer, cloudfront |
| func-api-firmware-download-get | api-gateway, shared-layer, s3-firmware |
| s3-firmware | func-s3-firmware-uploaded, func-s3-firmware-deleted |
| ui-app | cloudfront-ui, cognito |
| run-integration-tests | s3-firmware, func-api-firmware-get, func-api-firmware-status-patch, func-api-firmware-delete, func-api-health-get, func-api-ota-get, func-api-firmware-download-get, func-api-users-get, func-api-users-post, func-api-users-delete, func-api-users-patch, ui-app |

---

## delete-all Dependency Order

| Job | Needs |
|---|---|
| delete-ui-app | — |
| delete-dynamodb-firmware | — |
| delete-s3-firmware | — |
| delete-cloudfront | — |
| delete-func-api-health-get | — |
| delete-func-api-users-get | — |
| delete-func-api-users-post | — |
| delete-func-api-users-delete | — |
| delete-func-api-users-patch | — |
| delete-func-api-firmware-get | — |
| delete-func-api-firmware-status-patch | — |
| delete-func-api-firmware-delete | — |
| delete-func-api-ota-get | — |
| delete-func-api-firmware-download-get | — |
| delete-cloudfront-ui | delete-ui-app |
| delete-s3-ui | delete-cloudfront-ui |
| delete-s3-firmware-public | delete-cloudfront |
| delete-api-gateway | delete-func-api-health-get, delete-func-api-users-get, delete-func-api-users-post, delete-func-api-users-delete, delete-func-api-users-patch, delete-func-api-firmware-get, delete-func-api-firmware-status-patch, delete-func-api-firmware-delete, delete-func-api-ota-get, delete-func-api-firmware-download-get |
| delete-cognito | delete-api-gateway |
| delete-func-cognito-pre-signup | delete-cognito |
| delete-acm-cognito | delete-cognito |
| delete-acm-api-gateway | delete-api-gateway, delete-cloudfront, delete-cloudfront-ui |
| delete-dynamodb-users | delete-func-cognito-pre-signup, delete-func-api-users-delete, delete-func-api-users-post |
| delete-func-s3-firmware-uploaded | delete-s3-firmware |
| delete-func-s3-firmware-deleted | delete-s3-firmware |
| delete-shared-layer | delete-func-s3-firmware-uploaded, delete-func-s3-firmware-deleted, delete-func-api-firmware-get, delete-func-api-firmware-status-patch, delete-func-api-firmware-delete, delete-func-api-ota-get, delete-func-api-firmware-download-get |

---

## Dependency Graph

[![Deploy-all dependency graph](./images/deploy-all-dag.svg)](./images/deploy-all-dag.svg)
