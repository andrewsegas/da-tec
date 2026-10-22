# Imagem de produção do da-tec (Next.js standalone).
# Usada pelo deploy em VPS — veja `deploy/README.md`.
#
# As variáveis NEXT_PUBLIC_* são embutidas no bundle durante o build, por isso
# entram como build args (não são segredos: vão para o browser de qualquer jeito).

FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Ferramentas de banco (migrations e seed) — `docker compose run --rm migrate`.
FROM deps AS tools
COPY . .
CMD ["npx", "tsx", "src/db/migrate.ts"]

FROM deps AS builder
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_UNISANTA_EMAIL_DOMAIN=unisanta.br
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_UNISANTA_EMAIL_DOMAIN=$NEXT_PUBLIC_UNISANTA_EMAIL_DOMAIN \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS=--max-old-space-size=2048
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/login || exit 1
CMD ["node", "server.js"]
