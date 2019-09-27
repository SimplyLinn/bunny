FROM node:12.10-slim
USER root

WORKDIR /bunny-server

RUN apt-get update && \
    apt-get install -y build-essential python

COPY package.json package.json
RUN yarn 
COPY src ./src
# copy .env
ENV TURTUS_ENV_PATH="./.env"
COPY .env .

# TODO certificate shit

EXPOSE 80 443 3000 8080

# ENTRYPOINT [ "bash" ]
ENTRYPOINT [ "yarn", "start"]