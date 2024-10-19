FROM node:lts-alpine

WORKDIR /app

COPY ../../package*.json ./

RUN npm install

COPY ../../dist/shopkeeper ./

EXPOSE 5002