# func-api-health-get

## Description
Returns a simple health check response confirming the API is reachable and the Lambda runtime is operational. This function has no external dependencies — it does not call DynamoDB, S3, or any other service.

## Invocation
Invoked by **API Gateway** on an HTTP `GET /health` request.

## Sequence Diagram

[![Sequence Diagram](./images/func-api-health-get.svg)](./images/func-api-health-get.svg)

## API Endpoints
| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Returns `{ "status": "OK" }` |

See the [API Reference](/cloud/api_reference) for full schema documentation.

## Deployment

See the [deployment workflow documentation](../github_actions/func-api-health-get.md) for workflow steps, infrastructure dependencies, and failure scenarios.
