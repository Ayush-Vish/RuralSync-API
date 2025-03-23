FROM node:18 AS builder

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

ARG PROJECT

COPY --from=builder /app/dist/${PROJECT} ./
COPY --from=builder /app/package*.json ./

RUN npm install --only=production

# Use the PORT from the environment variable
ENV PORT=3000
EXPOSE ${PORT}

CMD ["sh", "-c", "node main.js"]
