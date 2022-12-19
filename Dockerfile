ARG node_version=16.18-alpine3.15

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

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN yarn

FROM base as prod

COPY src/ src/
COPY package.json package.json
COPY --from=build /opt/epp/node_modules node_modules

EXPOSE 3000
CMD [ "yarn", "start" ]
