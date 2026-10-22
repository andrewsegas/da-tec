#!/bin/sh
# Backup diário do Postgres (dump completo, comprimido), mantendo 14 dias.
# Agendado via cron na VPS — veja deploy/README.md.
#
# Inclui o schema `auth` (usuários) e o `public` (dados do app). Para
# restaurar: gunzip -c arquivo.sql.gz | docker exec -i supabase-db psql -U supabase_admin -d postgres
set -eu

cd "$(dirname "$0")/.."

KEEP_DAYS=${KEEP_DAYS:-14}
file="backups/datec-$(date +%Y%m%d-%H%M%S).sql.gz"

mkdir -p backups
docker exec supabase-db pg_dump -U supabase_admin -d postgres \
  --schema=public --schema=auth --schema=drizzle --no-owner \
  | gzip > "$file.tmp"
mv "$file.tmp" "$file"
chmod 600 "$file"

find backups -name 'datec-*.sql.gz' -mtime +"$KEEP_DAYS" -delete
echo "✓ backup em deploy/$file"
