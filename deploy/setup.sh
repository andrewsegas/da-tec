#!/bin/sh
# Prepara a VPS para subir o da-tec (idempotente — pode rodar de novo).
#
# 1. Baixa os arquivos de init do Postgres e o config do gateway (Envoy) do
#    repositório oficial do Supabase, num commit fixo (reprodutível).
# 2. Cria deploy/.env a partir do .env.example, gerando todos os segredos.
#
# Uso: cd deploy && sh setup.sh
set -eu

cd "$(dirname "$0")"

# Commit do supabase/supabase cujas imagens estão no docker-compose.yml.
SUPABASE_REF=70fe3de074d7bcaa5603df519b3ddb51e67b3cbc

if [ ! -f supabase/.ref ] || [ "$(cat supabase/.ref)" != "$SUPABASE_REF" ]; then
  echo "→ Baixando arquivos do Supabase ($SUPABASE_REF)..."
  tmp=$(mktemp -d)
  git -C "$tmp" init -q
  git -C "$tmp" remote add origin https://github.com/supabase/supabase.git
  git -C "$tmp" sparse-checkout set docker/volumes/db docker/volumes/api/envoy
  git -C "$tmp" fetch -q --depth 1 --filter=blob:none origin "$SUPABASE_REF"
  git -C "$tmp" checkout -q FETCH_HEAD
  rm -rf supabase/volumes
  mkdir -p supabase/volumes/api
  cp -r "$tmp/docker/volumes/db" supabase/volumes/db
  cp -r "$tmp/docker/volumes/api/envoy" supabase/volumes/api/envoy
  rm -rf supabase/volumes/db/init "$tmp"
  echo "$SUPABASE_REF" > supabase/.ref
fi

mkdir -p data/db backups

if [ -f .env ]; then
  echo "→ deploy/.env já existe — segredos mantidos."
  exit 0
fi

echo "→ Gerando deploy/.env com segredos novos..."

b64url() { openssl enc -base64 -A | tr '+/' '-_' | tr -d '='; }

jwt_secret=$(openssl rand -hex 32)
jwt() {
  header=$(printf '%s' '{"alg":"HS256","typ":"JWT"}' | b64url)
  payload=$(printf '%s' "$1" | b64url)
  sig=$(printf '%s' "$header.$payload" | openssl dgst -binary -sha256 -hmac "$jwt_secret" | b64url)
  printf '%s.%s.%s' "$header" "$payload" "$sig"
}
iat=$(date +%s)
exp=$((iat + 5 * 365 * 24 * 3600))

set_var() {
  # Usa | como delimitador: JWTs têm / e base64 tem +.
  sed -i "s|^$1=.*$|$1=$2|" .env
}

cp .env.example .env
chmod 600 .env
set_var POSTGRES_PASSWORD "$(openssl rand -hex 24)"
set_var JWT_SECRET "$jwt_secret"
set_var ANON_KEY "$(jwt "{\"role\":\"anon\",\"iss\":\"supabase\",\"iat\":$iat,\"exp\":$exp}")"
set_var SERVICE_ROLE_KEY "$(jwt "{\"role\":\"service_role\",\"iss\":\"supabase\",\"iat\":$iat,\"exp\":$exp}")"
set_var SECRET_KEY_BASE "$(openssl rand -hex 48)"
set_var REALTIME_DB_ENC_KEY "$(openssl rand -hex 8)"
set_var PG_META_CRYPTO_KEY "$(openssl rand -hex 24)"
set_var DASHBOARD_PASSWORD "$(openssl rand -hex 16)"

echo "✓ Pronto. Revise deploy/.env (DOMAIN, SMTP) e rode: docker compose up -d --build"
