# Docs Development Environment

This guide covers local testing for the FireFly documentation site. Production builds run via GitHub Actions.

## Dockerfile for ACT

The Dockerfile is maintained in the FireFly-Docs repository at [`.act/dockerfile`](https://github.com/BrentIO/FireFly-Docs/blob/main/.act/dockerfile). Build the image from the **repo root**:

Usage for Intel CPU:
```bash
docker build --no-cache --platform=linux/amd64 -t act-docs-ubuntu-24-04:latest -f .act/dockerfile .
```

Usage for Apple Silicon:
```bash
docker build --no-cache --platform=linux/arm64 -t act-docs-ubuntu-24-04:latest -f .act/dockerfile .
```

## Local Preview

To build and locally preview the docs site, run the following from the **repo root**. The container will build the site, then serve it on `http://localhost:4173`. Kill the container to stop; restart it to do a clean rebuild.

Usage for Intel CPU:
```bash
docker run --rm -it --platform linux/amd64 -p 4173:4173 -v $(pwd):/docs act-docs-ubuntu-24-04:latest bash /docs/.act/preview-entrypoint.sh
```

Usage for Apple Silicon:
```bash
docker run --rm -it --platform linux/arm64 -p 4173:4173 -v $(pwd):/docs act-docs-ubuntu-24-04:latest bash /docs/.act/preview-entrypoint.sh
```

## Configure ACT for Visual Studio Code

To run the ACT docker image through Visual Studio Code, use the [GitHub Local Actions](https://marketplace.visualstudio.com/items?itemName=SanjulaGanepola.github-local-actions) plug-in. The following settings must be applied:

| Section | Setting | Value | Notes |
| ------- | ------- | ----- | ----- |
| Runners | ubuntu-latest | `act-docs-ubuntu-24-04` | |
| Options | artifact-server-path | `./artifacts` | |
| Options | pull | `false` | |
| Options | container-architecture | `linux/arm64` | For Apple Silicon only |
| Options | container-architecture | `linux/amd64` | For Apple Intel chips |

::: info AWS Steps
The `Configure AWS credentials`, `Sync to S3`, and `Invalidate CloudFront cache` steps require OIDC credentials that are not available locally and will fail. All other steps — PlantUML generation, OpenAPI/AsyncAPI download, AsyncAPI HTML generation, and VitePress build — run normally.
:::
