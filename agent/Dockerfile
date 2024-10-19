FROM node:lts-alpine

WORKDIR /app

COPY ../../package*.json ./

RUN npm install

COPY ../../dist/agent ./

EXPOSE 5004