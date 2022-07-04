# Enhanced Preprints

Umbrella repository for the Enhanced Preprints project.

To run the application use:
```shell
make watch
```

This will build and run the application on port `8080` and will rebuild any `ts` and `scss` files when they change.

## Import example articles

You will need to import some test articles from the repo into your instance. Visit http://localhost:8080/import and click import.

## Running with databases

We currently have two supported databases:
- SQLite
- CouchDB

Both databases can be brought up locally using docker-compose.

## Running with SQLite

run either `make watch-sqlite` or `docker-compose --profile sqlite up -d` to bring up the application and all related services.
You can then import articles as described above.

NOTE: You will need to run `docker-compose --profile sqlite down --volumes` to fully remove data after the service has shutdown.

## Running with CouchDB

run either `make watch-couchdb` or `docker-compose --profile couchdb up -d` to bring up the application and all related services.
You can then import articles as described above.

NOTE: You will need to run `docker-compose --profile couchdb down --volumes` to fully remove data after the service has shutdown.

## Testing
To test the application run:
```shell
yarn test
```

> to run in watch mode add `-w` to the previous command.

and to lint:
```shell
yarn lint
```
