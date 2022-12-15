# Device Access Broker

WIP: Come back later for a good readme

## Setup

This project expects a linux development environment with the following
dependencies:

### Deno

This project uses deno, so you'll need to install that first. You can find
instructions for that [here](https://deno.land/#installation).

### JTD Codegen

Additionally, the API is designed in JSON type definitions (RFC 8927) and uses
the [jtd-codegen](https://jsontypedef.com/docs/typescript-codegen/) tool to
generate typescript types from the definitions.

To install the jtd-codegen tool, check the
[Github Repo](https://github.com/jsontypedef/json-typedef-codegen) for
installation instructions.

### Utils

The project has a few utility scripts that are used within the repo, so you'll
need to build those, this can be done with the following command:

```bash
cd utils
./build.sh
```
