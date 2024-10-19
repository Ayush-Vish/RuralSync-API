# Stage 1: Build
FROM node:lts-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx nx build agent  # Assuming the build command compiles TypeScript or bundles

# Stage 2: Final
FROM node:lts-alpine
WORKDIR /app
COPY --from=builder /dist/agent ./dist/agent
COPY package*.json ./
RUN npm install --only=production
EXPOSE 5004
CMD ["node", "dist/main.js"]
