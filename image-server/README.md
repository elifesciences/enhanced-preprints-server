# Enhanced Preprints Image Server

This directory contains the files needed to build a docker image of the
[Cantaloupe image server](https://cantaloupe-project.github.io/) for the enhanced-preprints project. It is mostly build
files and some default configuration for running locally. This should usually be run from this directory, but as part of the
docker-compose project at the root.

## Prerequisites

- docker
- Make

## Building the docker image

Run `make build`

## Running the docker image

Run the build first, then `make run` and visit http://localhost:8182/
