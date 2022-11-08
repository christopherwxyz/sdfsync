FROM node:16.18.0-alpine3.16

RUN apk --no-cache update && apk --no-cache add sudo
RUN apk add --no-cache bash
RUN apk add --no-cache git
RUN apk add --no-cache openssh
RUN apk add --no-cache openjdk17-jdk

USER root
RUN npm install -g --acceptsuitecloudsdklicense @oracle/suitecloud-cli@

ADD --chown=root:root . /home/root

RUN cd /home/root && npm ci && npm run build

EXPOSE 8080
CMD ["node", "/home/root/dist/app.js"]
