#!/bin/sh
# Cria (ou promove) um usuário administrador da plataforma.
#
# Uso: sh scripts/create-admin.sh email@dominio "Nome Completo"
#
# - E-mail fora do domínio institucional recebe um convite aprovado antes
#   (senão a trigger de gate do cadastro bloqueia).
# - Gera uma senha forte e imprime UMA vez. Troque após o primeiro login.
set -eu

cd "$(dirname "$0")/.."

email=${1:?informe o e-mail}
name=${2:-Administrador}

SERVICE_ROLE_KEY=$(grep '^SERVICE_ROLE_KEY=' .env | cut -d= -f2-)

psql() { docker exec -i supabase-db psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 -qtA "$@"; }

psql -v email="$email" <<'SQL'
INSERT INTO public.invites (email, status, note)
SELECT :'email', 'aprovado', 'Administrador criado no deploy'
WHERE NOT public.is_signup_email_allowed(:'email');
SQL

password=$(openssl rand -base64 18 | tr -d '/+=' | cut -c1-20)
body=$(printf '{"email":"%s","password":"%s","email_confirm":true,"user_metadata":{"full_name":"%s"}}' \
  "$email" "$password" "$name")

status=$(curl -s -o /tmp/create-admin.json -w '%{http_code}' \
  -X POST http://127.0.0.1:8000/auth/v1/admin/users \
  -H "apikey: $SERVICE_ROLE_KEY" -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H 'Content-Type: application/json' -d "$body")
rm -f /tmp/create-admin.json

if [ "$status" = "200" ] || [ "$status" = "201" ]; then
  echo "✓ usuário criado — senha inicial: $password"
else
  echo "→ usuário já existia (HTTP $status); só promovendo a admin."
fi

psql -v email="$email" <<'SQL'
UPDATE public.profiles SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE lower(email) = lower(:'email'));
SQL
echo "✓ $email é admin"
