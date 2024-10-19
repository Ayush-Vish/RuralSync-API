
FROM node:lts-alpine AS builder
WORKDIR /app
COPY ../package*.json ./
RUN npm install
COPY auth/ ./
RUN npx nx build auth

FROM node:lts-alpine
WORKDIR /app
COPY --from=builder /app/dist/auth/ ./
EXPOSE 5000
CMD ["node", "main.js"]
