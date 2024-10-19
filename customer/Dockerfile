# Stage 1: Build
FROM node:lts-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx nx build customer # Assuming the build command compiles TypeScript or bundles

# Stage 2: Final
FROM node:lts-alpine
WORKDIR /app
COPY --from=builder /dist/customer ./dist/customer
COPY package*.json ./
RUN npm install --only=production
EXPOSE 5001
CMD ["node", "dist/main.js"]
