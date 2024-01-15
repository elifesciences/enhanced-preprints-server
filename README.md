# Enhanced Preprints

Repository for the Enhanced Preprints API server.

# Local development

## Local dependencies

You will find it helpful to install local dependencies, by running `yarn`, so that local type-checking and linting tools work.

## Development build - `docker-compose up` or `make start-dev`

This will build and run the application on port `8080` and will rebuild any `ts` and `scss` files when they change.

## Testing
To perform the unit tests:
```shell
yarn test
```

> to run in watch mode add `-w` to the previous command. 

To perform the integration tests:
```shell
yarn test:integration
```

and to lint:
```shell
yarn lint
```

## Import articles

Data is imported from either the `$projectroot/data/10.1101` or alternatively you can specify a directory by setting the `IMPORT_DIR_PATH` environment variable. This directory should contain one directory for each article XML, and the name of the xml file should match the directory name (with `.xml` appended).

Once you have your xml files in place, you can import them into your instance by running the app and visiting `/import` endpoint (e.g. http://localhost:8080/import) and click the import button. A JSON summary of the import process will be displayed.
