FROM node:20-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
# Install must include devDependencies (tailwindcss, postcss, etc.) for `next build`.
# NODE_ENV=production on the install stage would omit them and break PostCSS/Turbopack.
RUN npm ci

FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Railway exposes service variables during `docker build` only after matching ARG
# declarations (same names as in the dashboard). Otherwise `next build` inlines
# empty NEXT_PUBLIC_* and client features (e.g. auth nav) stay off.
# https://docs.railway.com/guides/dockerfiles#using-variables-at-build-time
ARG NEXT_PUBLIC_CLIENT_SERVER
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_ENABLE_AUTH_VIEWS
ARG NEXT_PUBLIC_SHOW_AUTH_BUTTONS
ARG NEXT_PUBLIC_ENABLE_ANALYTICS
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST
ARG NEXT_PUBLIC_SAMPLES_REPO_URL
ARG NEXT_PUBLIC_DOCS_URL

ENV NEXT_PUBLIC_CLIENT_SERVER=$NEXT_PUBLIC_CLIENT_SERVER \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_ENABLE_AUTH_VIEWS=$NEXT_PUBLIC_ENABLE_AUTH_VIEWS \
    NEXT_PUBLIC_SHOW_AUTH_BUTTONS=$NEXT_PUBLIC_SHOW_AUTH_BUTTONS \
    NEXT_PUBLIC_ENABLE_ANALYTICS=$NEXT_PUBLIC_ENABLE_ANALYTICS \
    NEXT_PUBLIC_POSTHOG_KEY=$NEXT_PUBLIC_POSTHOG_KEY \
    NEXT_PUBLIC_POSTHOG_HOST=$NEXT_PUBLIC_POSTHOG_HOST \
    NEXT_PUBLIC_SAMPLES_REPO_URL=$NEXT_PUBLIC_SAMPLES_REPO_URL \
    NEXT_PUBLIC_DOCS_URL=$NEXT_PUBLIC_DOCS_URL

RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
# Next standalone binds to process.env.HOSTNAME || "0.0.0.0". Railway (and many
# runtimes) set HOSTNAME to the container hostname, which breaks edge/health probes.
# Force public bind; Railway still routes via $PORT.
CMD ["sh", "-c", "HOSTNAME=0.0.0.0 exec node server.js"]
