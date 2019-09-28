FROM node:12.10-slim
USER root


WORKDIR /bunny-server

# TODO: introduce a build stage to install bcrypt since it needs python 
# in order to be built
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