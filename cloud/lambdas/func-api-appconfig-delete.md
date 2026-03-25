# func-api-appconfig-delete

## Description
Removes the AppConfig application for an individual Lambda function, reverting it to the default WARNING log level. This route is handled by the **`func-api-appconfig-patch`** Lambda function.

The delete operation:
1. Returns `404 Not Found` if the function has never been configured.
2. Returns `409 Conflict` if a deployment is currently in progress.
3. Deletes all hosted configuration versions, then the configuration profile, environment, and application in order.

Super user access is required.

## Invocation
Invoked by **API Gateway** on an HTTP `DELETE /appconfig/{function_name}` request. The request is routed to the `func-api-appconfig-patch` Lambda function.

## Sequence Diagram

[![Delete Sequence](./images/func-api-appconfig-delete.svg)](./images/func-api-appconfig-delete.svg)

## API Endpoints
| Method | Path | Description |
|---|---|---|
| `DELETE` | `/appconfig/{function_name}` | Remove the AppConfig application; revert to default WARNING |

See the [API Reference](/cloud/api_reference) for full schema documentation.

## Deployment

See the [deployment workflow documentation](../github_actions/func-api-appconfig-delete.md) for workflow steps, infrastructure dependencies, and failure scenarios.
