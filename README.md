# Enhanced Preprints

Repository for the Enhanced Preprints API server.

# Local development

## Local dependencies

You will find it helpful to install local dependencies, by running `yarn`, so that local type-checking and linting tools work.

## Development build - `docker-compose up` or `make start-dev`

This will build and run the application on port `8080` and will rebuild any `ts` files when they change.

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

# Download cluster databases

To download the prod cluster database (as long as you have k8s access) run `scripts/download-cluster-db.sh`.

Use `-o` or `--output` (defaults to `./versioned_articles.bson.gz`) to change the name of the dump.

Start the application with a `docker compose up --wait`.

When the containers have all started run `scripts/use-cluster-db.sh`, use `-i` or `--input` (defaults to `./versioned_articles.bson.gz`) to change the name of the dump to be used.

To see the options on either script run them with `-h`

To check that the db has been imported correctly go to http://localhost:8081 and click through to `/epp` folder.
