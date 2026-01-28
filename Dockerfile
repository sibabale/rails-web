# Build stage
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files
COPY . .

# Build the Vite app
# Build-time env vars are injected via ARG
ARG VITE_CLIENT_SERVER
ENV VITE_CLIENT_SERVER=$VITE_CLIENT_SERVER

RUN npm run build

# Production stage - use nginx to serve static files
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
