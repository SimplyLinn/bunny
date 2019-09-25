FROM node:12.10-slim
USER root

ENV PORT=3000

WORKDIR /server
COPY package.json package.json
RUN yarn 
COPY src .
COPY public .

EXPOSE ${PORT}

ENTRYPOINT [ "yarn", "start", '-l', '3000']