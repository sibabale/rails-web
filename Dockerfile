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
