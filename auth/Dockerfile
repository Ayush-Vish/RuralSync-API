FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

RUN npm ci

COPY . .

ARG PROJECT

RUN npx nx build ${PROJECT} --prod

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist/apps/${PROJECT} ./
COPY --from=builder /app/package*.json ./

RUN npm ci --only=production

EXPOSE 3000

CMD ["node", "main.js"]