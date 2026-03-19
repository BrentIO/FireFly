# integration-tests

## Overview

Runs the pytest integration test suite against a fully-deployed FireFly-Cloud environment. Called at the end of `deploy-all` after all stacks are live, and available as a standalone workflow for manual test runs. There is no CloudFormation stack and no delete workflow for this action.

## Dependencies

### Deploy Dependencies

| Workflow | Reason |
|---|---|
| [s3-firmware](./s3-firmware.md) | Private firmware bucket must exist for upload/processing tests |
| [func-api-firmware-get](./func-api-firmware-get.md) | GET /firmware endpoint must be live |
| [func-api-firmware-status-patch](./func-api-firmware-status-patch.md) | PATCH /firmware/{zip_name}/status endpoint must be live |
| [func-api-firmware-delete](./func-api-firmware-delete.md) | DELETE /firmware/{zip_name} endpoint must be live |
| [func-api-health-get](./func-api-health-get.md) | GET /health endpoint must be live |
| [func-api-ota-get](./func-api-ota-get.md) | GET /ota endpoint must be live |
| [func-api-firmware-download-get](./func-api-firmware-download-get.md) | GET /firmware/{zip_name}/download endpoint must be live |
| [func-api-users-get](./func-api-users-get.md) | GET /users endpoint must be live |
| [func-api-users-post](./func-api-users-post.md) | POST /users endpoint must be live |
| [func-api-users-delete](./func-api-users-delete.md) | DELETE /users/{user_id} endpoint must be live |
| [func-api-users-patch](./func-api-users-patch.md) | PATCH /users/{user_id} endpoint must be live |
| [ui-app](./ui-app.md) | UI must be deployed for UI smoke tests |

### Delete Dependencies

N/A

## Required By

### Required By Deploy

None — this is the final step in `deploy-all`.

### Required By Delete

N/A

## Deploy Workflow

### Description

Resolves runtime endpoints and configuration by querying CloudFormation stack outputs, installs Python dependencies, and runs the full pytest integration suite. Stack lookups for UI and Cognito are optional — tests that depend on those resources are skipped if the values are not available.

### Inputs

| Input | Values | Description |
|---|---|---|
| `target_env` | `dev`, `production` | Target environment for the test run |

### Steps

1. Checkout repository.
2. Configure AWS credentials.
3. Look up `ApiUrl` from the `firefly-api-gateway` stack output.
4. Look up UI CloudFront domain from the `firefly-cloudfront-ui` stack output (optional).
5. Look up `UserPoolId` and `ClientId` from the `firefly-cognito` stack output (optional).
6. Create CI test user via `AdminCreateUser` + `AdminSetUserPassword` (skipped if Cognito stack not found or credentials not set; idempotent — handles existing user gracefully).
7. `pip install -r tests/requirements.txt`
8. `pytest tests/integration/ -v`
9. Delete CI test user via `AdminDeleteUser` — runs with `if: always()` so the user is removed even if tests fail.

**Environment variables passed to pytest:**

| Variable | Source |
|---|---|
| `FIREFLY_API_URL` | `firefly-api-gateway` stack output (`ApiUrl`) |
| `FIREFLY_FIRMWARE_BUCKET` | From secrets |
| `FIREFLY_UI_URL` | `firefly-cloudfront-ui` stack output (optional) |
| `FIREFLY_UI_BUCKET` | From secrets |
| `FIREFLY_COGNITO_USER_POOL_ID` | `firefly-cognito` stack output (optional) |
| `FIREFLY_COGNITO_CLIENT_ID` | `firefly-cognito` stack output (optional) |
| `FIREFLY_TEST_USER_EMAIL` | From secrets |
| `FIREFLY_TEST_USER_PASSWORD` | From secrets |

### Sequence Diagram

[![Run Sequence](./images/run-integration-tests.svg)](./images/run-integration-tests.svg)

## Failure Scenarios

| Scenario | Behavior |
|---|---|
| `firefly-api-gateway` stack not found | Test run fails immediately; `FIREFLY_API_URL` is not set. Deploy `api-gateway` first. |
| Test credentials not configured | Auth-dependent tests fail with 401. Set `FIREFLY_TEST_USER_EMAIL` and `FIREFLY_TEST_USER_PASSWORD` in repository secrets. |
| CI test user creation fails | Workflow fails before tests run. Check IAM permissions for `AdminCreateUser` and `AdminSetUserPassword`. |
| CI test user deletion fails | Workflow fails after tests complete (non-`UserNotFoundException` errors cause a non-zero exit). Check IAM permissions for `AdminDeleteUser`. |
| pytest test failure | Workflow exits non-zero; specific test output identifies which endpoint or function failed. Check CloudWatch logs for the relevant Lambda. |
| Optional stack not deployed | Tests that depend on that stack are skipped rather than failing the run. |
