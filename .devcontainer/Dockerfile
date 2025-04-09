# syntax=docker/dockerfile:1

FROM node:lts-alpine
COPY bin/* /usr/local/bin
COPY __bashrc /etc/bash/__bashrc
RUN addgroup -S dev && adduser -S dev -G dev && apk update && apk add bash shadow openssh git && \
    chsh -s /bin/bash dev && cat /etc/bash/__bashrc >> /etc/bash/bashrc && rm /etc/bash/__bashrc && \
    npm install -g expo eas-cli
EXPOSE 8081 3000 4000
USER dev
