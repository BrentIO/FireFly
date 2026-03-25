# func-api-appconfig-get

## Description
Returns all `firefly-func-*` Lambda functions with their individual AppConfig configuration. Functions that have never been configured appear in the list with `null` values and use the default WARNING log level until explicitly configured via `PATCH /appconfig/{function_name}`.

Super user access is required.

## Invocation
Invoked by **API Gateway** on an HTTP `GET /appconfig` request.

## Sequence Diagram

[![Sequence Diagram](./images/func-api-appconfig-get.svg)](./images/func-api-appconfig-get.svg)

## API Endpoints
| Method | Path | Description |
|---|---|---|
| `GET` | `/appconfig` | List all `firefly-func-*` functions with their configuration state |

See the [API Reference](/cloud/api_reference) for full schema documentation.

## Deployment

See the [deployment workflow documentation](../github_actions/func-api-appconfig-get.md) for workflow steps, infrastructure dependencies, and failure scenarios.
