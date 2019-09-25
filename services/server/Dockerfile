FROM node:12.10-slim
USER root

WORKDIR /server
COPY package.json package.json
RUN yarn 
COPY src .

# TODO certificate shit

EXPOSE 80 443 3000 8080

ENTRYPOINT [ "yarn", "start"]