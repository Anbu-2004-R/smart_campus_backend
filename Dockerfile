# Multi-stage Dockerfile optimized for Render deployment
# Stage 1: Build assets
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies (including build tools)
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Build client-side assets to /app/dist
RUN npm run build

# Stage 2: Production runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Render automatically injects PORT (default 10000)
ENV PORT=10000

# Install production-only dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled frontend and backend server files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Expose Render standard port
EXPOSE 10000

# Start unified backend & frontend server
CMD ["npm", "start"]
