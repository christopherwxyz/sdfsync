FROM node:16.18.0-alpine3.16

WORKDIR /usr/src/app

RUN apk --no-cache update && apk --no-cache add sudo
RUN apk add --no-cache bash
RUN apk add --no-cache git
RUN apk add --no-cache openssh
RUN apk add --no-cache openjdk17-jdk

USER root
RUN npm install -g --acceptsuitecloudsdklicense @oracle/suitecloud-cli@

COPY . .

RUN npm ci && npm run build

# Copy node modules and build directory
COPY --from=base ./node_modules ./node_modules
COPY --from=base /dist /dist

EXPOSE 8080
ENTRYPOINT ["node", "./dist/app.js"]
