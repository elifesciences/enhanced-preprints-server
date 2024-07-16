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

# Clone staging database

To clone the staging database (as long as you have k8s access) run `scripts/clone-staging-db.sh` to make a dump of the database.
start the application with a `docker compose up --wait`
when the containers have all started run `scripts/use-staging-db.sh`
