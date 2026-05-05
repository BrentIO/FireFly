# GitHub Actions Workflows

GitHub Actions workflows that deploy and delete all FireFly-Cloud AWS infrastructure. Each workflow manages a single CloudFormation stack. Two orchestration workflows (`deploy-all` and `delete-all`) coordinate the full set in dependency order.

**Setup:** [AWS OIDC configuration](./aws-oidc-setup.md) — how to configure the AWS IAM identity provider and role that GitHub Actions uses to authenticate.

## Workflow Index

| Workflow | CloudFormation Stack | Purpose |
|---|---|---|
| [acm](./acm.md) | `firefly-acm` | ACM certificate for API Gateway, CloudFront, and Cognito custom domains (us-east-1) |
| [api-gateway](./api-gateway.md) | `firefly-api-gateway` | HTTP API Gateway with custom domain, Cognito JWT authorizer, CORS |
| [cloudfront-configurator](./cloudfront-configurator.md) | `firefly-configurator-cloudfront` | CloudFront distribution + Route 53 alias for the Configurator UI |
| [cloudfront-firmware](./cloudfront-firmware.md) | `firefly-cloudfront-firmware` | CloudFront distribution + Route 53 alias for firmware OTA delivery |
| [cloudfront-fmc](./cloudfront-fmc.md) | `firefly-cloudfront-fmc` | CloudFront distribution + Route 53 alias for the FMC |
| [cognito](./cognito.md) | `firefly-cognito` | Cognito User Pool with Google IdP, custom domain, pre-signup Lambda |
| [configurator-ui](./configurator-ui.md) | — | Builds and syncs the Configurator UI to S3; invalidates CloudFront cache |
| [dynamodb-devices](./dynamodb-devices.md) | `firefly-dynamodb-devices` | DynamoDB table for registered device records |
| [dynamodb-firmware](./dynamodb-firmware.md) | `firefly-dynamodb-firmware` | DynamoDB table for firmware metadata |
| [dynamodb-registration-keys](./dynamodb-registration-keys.md) | `firefly-dynamodb-registration-keys` | DynamoDB table for one-time device registration keys |
| [dynamodb-users](./dynamodb-users.md) | `firefly-dynamodb-users` | DynamoDB allowlist table for invitation-only Cognito pre-signup |
| [func-api-appconfig-get](./func-api-appconfig-get.md) | `firefly-func-api-appconfig-get` | Lambda: GET /appconfig (Configuration page) |
| [func-api-appconfig-patch](./func-api-appconfig-patch.md) | `firefly-func-api-appconfig-patch` | Lambda: PATCH /appconfig (Configuration page) |
| [func-api-devices-get](./func-api-devices-get.md) | `firefly-func-api-devices-get` | Lambda: GET /devices |
| [func-api-devices-register-post](./func-api-devices-register-post.md) | `firefly-func-api-devices-register-post` | Lambda: POST /devices/register |
| [func-api-devices-registration-get](./func-api-devices-registration-get.md) | `firefly-func-api-devices-registration-get` | Lambda: GET /devices/{uuid}/registration |
| [func-api-firmware-delete](./func-api-firmware-delete.md) | `firefly-func-api-firmware-delete` | Lambda: DELETE /firmware/{zip_name} |
| [func-api-firmware-download-get](./func-api-firmware-download-get.md) | `firefly-func-api-firmware-download-get` | Lambda: GET /firmware/{zip_name}/download |
| [func-api-firmware-get](./func-api-firmware-get.md) | `firefly-func-api-firmware-get` | Lambda: GET /firmware, GET /firmware/{zip_name} |
| [func-api-firmware-status-patch](./func-api-firmware-status-patch.md) | `firefly-func-api-firmware-status-patch` | Lambda: PATCH /firmware/{zip_name}/status |
| [func-api-health-get](./func-api-health-get.md) | `firefly-func-api-health-get` | Lambda: GET /health |
| [func-api-ota-get](./func-api-ota-get.md) | `firefly-func-api-ota-get` | Lambda: GET /ota/{class}/{product_hex} |
| [func-api-registration-keys-get](./func-api-registration-keys-get.md) | `firefly-func-api-registration-keys-get` | Lambda: GET /registration-keys |
| [func-api-registration-keys-post](./func-api-registration-keys-post.md) | `firefly-func-api-registration-keys-post` | Lambda: POST /registration-keys |
| [func-api-users-delete](./func-api-users-delete.md) | `firefly-func-api-users-delete` | Lambda: DELETE /users/{username} |
| [func-api-users-get](./func-api-users-get.md) | `firefly-func-api-users-get` | Lambda: GET /users |
| [func-api-users-patch](./func-api-users-patch.md) | `firefly-func-api-users-patch` | Lambda: PATCH /users/{username} |
| [func-api-users-post](./func-api-users-post.md) | `firefly-func-api-users-post` | Lambda: POST /users |
| [func-cognito-pre-signup](./func-cognito-pre-signup.md) | `firefly-func-cognito-pre-signup` | Lambda: Cognito pre-signup trigger (allowlist check) |
| [func-s3-firmware-deleted](./func-s3-firmware-deleted.md) | `firefly-func-s3-firmware-deleted` | Lambda: S3 delete event on processed/ and errors/ |
| [func-s3-firmware-uploaded](./func-s3-firmware-uploaded.md) | `firefly-func-s3-firmware-uploaded` | Lambda: S3 put event on incoming/*.zip |
| [s3-configurator](./s3-configurator.md) | `firefly-configurator-s3` | S3 bucket for Configurator UI static assets |
| [s3-firmware](./s3-firmware.md) | `firefly-s3-firmware` | Private S3 bucket for firmware ZIP processing pipeline |
| [s3-firmware-public](./s3-firmware-public.md) | `firefly-s3-firmware-public` | Public S3 bucket for released firmware binaries (behind CloudFront) |
| [s3-fmc](./s3-fmc.md) | `firefly-s3-fmc` | S3 bucket for FMC static assets |
| [shared-layer](./shared-layer.md) | `firefly-shared-layer` | Lambda layer: shared Python modules (logging, AppConfig, feature flags) |
| [fmc-app](./fmc-app.md) | — | Builds and syncs the FMC to S3; invalidates CloudFront cache |
| deploy-all | — | Orchestrates full deploy in dependency order |
| delete-all | — | Orchestrates full teardown in reverse-dependency order |

---

## deploy-all Dependency Order

Deployments run in parallel within each wave. A job only starts after all jobs in its `needs:` list have succeeded.

| Job | Needs |
|---|---|
| dynamodb-firmware | — |
| dynamodb-users | — |
| dynamodb-devices | — |
| dynamodb-registration-keys | — |
| acm | — |
| shared-layer | — |
| s3-configurator | — |
| s3-firmware-public | — |
| s3-fmc | — |
| func-cognito-pre-signup | dynamodb-users |
| cloudfront-configurator | acm, s3-configurator |
| cloudfront-firmware | acm, s3-firmware-public |
| cloudfront-fmc | acm, s3-fmc |
| cognito | acm, func-cognito-pre-signup |
| api-gateway | acm, cognito |
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
| func-api-ota-get | api-gateway, shared-layer, cloudfront-firmware |
| func-api-firmware-download-get | api-gateway, shared-layer, s3-firmware |
| s3-firmware | func-s3-firmware-uploaded, func-s3-firmware-deleted, cloudfront-fmc |
| fmc-app | cloudfront-fmc, cognito |
| func-api-appconfig-get | api-gateway |
| func-api-appconfig-patch | api-gateway |
| func-api-devices-register-post | api-gateway, dynamodb-devices, dynamodb-registration-keys, shared-layer |
| func-api-devices-registration-get | api-gateway, dynamodb-devices, shared-layer |
| func-api-devices-get | api-gateway, dynamodb-devices, shared-layer |
| func-api-registration-keys-post | api-gateway, dynamodb-registration-keys, shared-layer |
| func-api-registration-keys-get | api-gateway, dynamodb-registration-keys, shared-layer |
| run-integration-tests | dynamodb-firmware, s3-firmware, func-api-firmware-get, func-api-firmware-status-patch, func-api-firmware-delete, func-api-health-get, func-api-ota-get, func-api-firmware-download-get, func-api-users-get, func-api-users-post, func-api-users-delete, func-api-users-patch, func-api-appconfig-get, func-api-appconfig-patch, func-api-devices-register-post, func-api-devices-registration-get, func-api-devices-get, func-api-registration-keys-post, func-api-registration-keys-get, fmc-app |

---

## delete-all Dependency Order

| Job | Needs |
|---|---|
| delete-fmc-app | — |
| delete-dynamodb-firmware | — |
| delete-s3-firmware | — |
| delete-cloudfront-configurator | — |
| delete-cloudfront-firmware | — |
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
| delete-func-api-appconfig-get | — |
| delete-func-api-appconfig-patch | — |
| delete-func-api-devices-register-post | — |
| delete-func-api-devices-registration-get | — |
| delete-func-api-devices-get | — |
| delete-func-api-registration-keys-post | — |
| delete-func-api-registration-keys-get | — |
| delete-cloudfront-fmc | delete-fmc-app |
| delete-s3-configurator | delete-cloudfront-configurator |
| delete-s3-fmc | delete-cloudfront-fmc |
| delete-s3-firmware-public | delete-cloudfront-firmware |
| delete-api-gateway | delete-func-api-health-get, delete-func-api-firmware-get, delete-func-api-firmware-status-patch, delete-func-api-firmware-delete, delete-func-api-ota-get, delete-func-api-firmware-download-get, delete-func-api-users-get, delete-func-api-users-post, delete-func-api-users-delete, delete-func-api-users-patch, delete-func-api-appconfig-get, delete-func-api-appconfig-patch, delete-func-api-devices-register-post, delete-func-api-devices-registration-get, delete-func-api-devices-get, delete-func-api-registration-keys-post, delete-func-api-registration-keys-get |
| delete-cognito | delete-api-gateway |
| delete-func-cognito-pre-signup | delete-cognito |
| delete-acm | delete-api-gateway, delete-cloudfront-configurator, delete-cloudfront-firmware, delete-cloudfront-fmc, delete-cognito |
| delete-dynamodb-users | delete-func-cognito-pre-signup, delete-func-api-users-delete, delete-func-api-users-post |
| delete-dynamodb-devices | delete-func-api-devices-register-post, delete-func-api-devices-registration-get, delete-func-api-devices-get |
| delete-dynamodb-registration-keys | delete-func-api-devices-register-post, delete-func-api-registration-keys-post, delete-func-api-registration-keys-get |
| delete-func-s3-firmware-uploaded | delete-s3-firmware |
| delete-func-s3-firmware-deleted | delete-s3-firmware |
| delete-shared-layer | delete-func-s3-firmware-uploaded, delete-func-s3-firmware-deleted, delete-func-api-firmware-get, delete-func-api-firmware-status-patch, delete-func-api-firmware-delete, delete-func-api-ota-get, delete-func-api-firmware-download-get, delete-func-api-devices-register-post, delete-func-api-devices-registration-get, delete-func-api-registration-keys-post, delete-func-api-registration-keys-get |

---

## Dependency Graph

[![Deploy-all dependency graph](./images/deploy-all-dag.svg)](./images/deploy-all-dag.svg)
