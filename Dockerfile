FROM node:16.14-alpine3.15 as build

COPY package.json package.json
COPY yarn.lock yarn.lock

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN yarn

FROM node:16.14-alpine3.15 as prod

COPY data data
COPY src/ src/
COPY package.json package.json
COPY --from=build node_modules node_modules

EXPOSE 3000
CMD [ "yarn", "start" ]
