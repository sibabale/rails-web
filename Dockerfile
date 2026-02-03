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
ARG VITE_SHOW_AUTH_BUTTONS
ENV VITE_SHOW_AUTH_BUTTONS=$VITE_SHOW_AUTH_BUTTONS

RUN npm run build

# Production stage - use nginx to serve static files
FROM nginx:alpine

# Remove default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf

# Create templates directory and copy nginx config as template
RUN mkdir -p /etc/nginx/templates
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Use entrypoint script to substitute PORT at runtime
# PORT will be provided by Railway at runtime
ENTRYPOINT ["/docker-entrypoint.sh"]
