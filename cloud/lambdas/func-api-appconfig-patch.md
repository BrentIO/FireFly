# func-api-appconfig-patch

## Description
Manages AppConfig configuration for individual Lambda functions. Handles three routes on the **Configuration** page:

- **`PATCH /appconfig/{function_name}`** — stages a new configuration version. Creates the AppConfig application, environment, and profile automatically if they do not exist. Does **not** deploy; changes take effect only after `POST /appconfig/{function_name}/deploy`.
- **`POST /appconfig/{function_name}/deploy`** — deploys the latest staged version using the `AppConfig.AllAtOnce` strategy. Returns `409 Conflict` if a deployment is already in progress.
- **`DELETE /appconfig/{function_name}`** — removes the AppConfig application entirely (all versions, profile, environment, and application), reverting the function to the default WARNING log level. Returns `409 Conflict` if a deployment is in progress.

Configuration is stored as a JSON object (`{"logging": "WARNING"}`) and can carry additional keys for future feature flags. All routes are authenticated via the Cognito JWT authorizer and restricted to super users.

## Invocation
Invoked by **API Gateway** on `PATCH`, `POST`, and `DELETE` requests to `/appconfig/{function_name}` and `/appconfig/{function_name}/deploy`.

## Sequence Diagrams

### PATCH /appconfig/{function_name}

[![PATCH Sequence](./images/func-api-appconfig-patch.svg)](./images/func-api-appconfig-patch.svg)

### POST /appconfig/{function_name}/deploy

[![Deploy Sequence](./images/func-api-appconfig-deploy.svg)](./images/func-api-appconfig-deploy.svg)

### DELETE /appconfig/{function_name}

[![Delete Sequence](./images/func-api-appconfig-delete.svg)](./images/func-api-appconfig-delete.svg)

## API Endpoints
| Method | Path | Description |
|---|---|---|
| `PATCH` | `/appconfig/{function_name}` | Stage a new configuration version (does not deploy) |
| `POST` | `/appconfig/{function_name}/deploy` | Deploy the latest staged version |
| `DELETE` | `/appconfig/{function_name}` | Remove the AppConfig application; revert to default WARNING |

See the [API Reference](/cloud/api_reference) for full schema documentation.
