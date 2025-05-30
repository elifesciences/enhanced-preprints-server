# Enhanced Preprints

Repository for the Enhanced Preprints API server.

# Local development

## Local dependencies

You will find it helpful to install local dependencies, by running `yarn`, so that local type-checking and linting tools work.

If you want to use docker-compose.yml without docker-compose.override.yaml you will want to add the following to your `/etc/hosts` file for the file redirects to work on your host machine:

```shell
127.0.0.1 minio
```

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

# To access the files in the mock s3 visit:

- http://localhost:3000/api/files/100254/v1/content/supplements/596941_file02.pdf
- http://localhost:3000/api/files/100254/v1/content/supplements/596941_file04.xlsx

# Download cluster databases

Prerequisites:
- kubectl (https://kubernetes.io/docs/reference/kubectl/ - installed and configured to access cluster)
- yq (https://github.com/mikefarah/yq)

To download the prod cluster database (as long as you have k8s access) run `scripts/download-cluster-db.sh`.

Use `-o` or `--output` (defaults to `./versioned_articles.bson.gz`) to change the name of the dump.

Start the application with a `docker compose up --wait`.

When the containers have all started run `scripts/use-cluster-db.sh`, use `-i` or `--input` (defaults to `./versioned_articles.bson.gz`) to change the name of the dump to be used.

To see the options on either script run them with `-h`

To check that the db has been imported correctly go to http://localhost:8081 and click through to `/epp` folder.
