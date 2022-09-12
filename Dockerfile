ARG node_version=18.9-alpine3.15

FROM node:${node_version} as base

RUN mkdir /opt/epp
# this expects a volume to be mounted to /opt/epp
WORKDIR /opt/epp

FROM base as build

# install packages needed to build node_modules
RUN apk add git python3 make gcc musl-dev g++

COPY package.json package.json
COPY yarn.lock yarn.lock
COPY .yarnrc.yml .yarnrc.yml
COPY .yarn/releases .yarn/releases
COPY .yarn/patches .yarn/patches

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN yarn

FROM base as prod

COPY data data
COPY src/ src/
COPY public/ public/
COPY package.json package.json
COPY scripts/watch.sh scripts/watch.sh
COPY migrations migrations
COPY --from=build /opt/epp/node_modules node_modules
RUN yarn sass

EXPOSE 3000
CMD [ "yarn", "start" ]
