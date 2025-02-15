# syntax=docker/dockerfile:1

FROM node:lts-alpine
COPY bin/* /usr/local/bin
COPY __bashrc /etc/bash/__bashrc
RUN addgroup -S dev && adduser -S dev -G dev && apk update && apk add bash shadow openssh git && \
    chsh -s /bin/bash dev && cat /etc/bash/__bashrc >> /etc/bash/bashrc && rm /etc/bash/__bashrc
EXPOSE 8081
USER dev
