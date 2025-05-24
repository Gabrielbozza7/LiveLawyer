# syntax=docker/dockerfile:1

# WARNING: If changes are made to this file inside a volume, the container should be rebuilt with the changes reflected
# on the host for each computer that obtains an updated copy of this file if the computer is using a volume. It's probably
# best to copy the entire ".devcontainer" directory from inside the volume and paste it to replace the ".devcontainer"
# directory on the host, excluding the volume-specific changes in ".devcontainer/devcontainer.json".
FROM node:lts-alpine
COPY __bashrc /etc/bash/__bashrc
RUN addgroup -S dev && adduser -S dev -G dev && apk update && apk add bash shadow openssh git && \
    chsh -s /bin/bash dev && cat /etc/bash/__bashrc >> /etc/bash/bashrc && rm /etc/bash/__bashrc && \
    npm install -g expo eas-cli
EXPOSE 8081 3000 4000
USER dev
