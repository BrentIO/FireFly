# Development Environment Setup

## Clone the source code from GitHub

Use SourceTree or other application to clone the code from GitHub to a local directory.

## Setup Virtual Environment

Change to the new source code directory:

`cd /path/to/source/`

Create the virtual environment:

`python3 -m venv ./.venv`

::: info
Ensure that the .venv folder is not added to source control.
:::

Use PIP to download and install the prerequisites:

`./.venv/bin/pip install --no-cache-dir -r requirements.txt`

## Development Testing

Launch the code without building a container to test within:

`./.venv/bin/python main.py`


## Creating a Container
