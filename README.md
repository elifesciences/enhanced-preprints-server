# Enhanced Preprints

Umbrella repository for the Enhanced Preprints project.

To run the application use:
```shell
make watch
```

This will build and run the application on port `8080` and will rebuild any `ts` and `scss` files when they change.

## Import articles

Data is imported from either the `$projectroot/data/10.1101` or alternatively you can specify a directory by setting the `IMPORT_DIR_PATH` environment variable. This directory should contain one directory for each article XML, and the name of the xml file should match the directory name (with `.xml` appended).

Once you have your xml files in place, you can import them into your instance by running the app and visiting `/import` endpoint (e.g. http://localhost:8080/import) and click the import button. A JSON summary of the import process will be displayed.

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
