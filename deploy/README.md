# Deploy em VPS (fase de testes)

O da-tec roda numa VPS própria com **Docker**: o app Next.js e um **Supabase
self-hosted enxuto** (Postgres, Auth, REST, Realtime, gateway e Studio). O
[Traefik](https://traefik.io) que já roda na VPS cuida do HTTPS (Let's Encrypt).

```
Internet ──► Traefik :443 ──┬─ /auth/v1, /rest/v1, /realtime/v1 ──► Envoy (gateway) ──► auth · rest · realtime ──► Postgres
                            └─ todo o resto ─────────────────────► app (Next.js)
Studio ◄── túnel SSH ── 127.0.0.1:8000 (nunca exposto)
```

App e API do Supabase ficam no **mesmo domínio**, separados por caminho. Assim
basta um certificado e não há CORS.

## Arquivos

| Arquivo | Para quê |
|---|---|
| `../Dockerfile` | Imagem do app (`runner`) e das ferramentas de banco (`tools`) |
| `docker-compose.yml` | Toda a stack |
| `.env.example` | Variáveis; `setup.sh` gera o `.env` real com os segredos |
| `setup.sh` | Baixa os arquivos de init do Supabase (commit fixo) e gera o `.env` |
| `scripts/backup.sh` | Dump diário do banco (mantém 14 dias) |
| `scripts/create-admin.sh` | Cria/promove um administrador |

O `.env`, os dados (`data/`), os backups (`backups/`) e os arquivos baixados
(`supabase/`) **não vão para o Git**.

## Primeira instalação

Na VPS (Ubuntu + Docker + Traefik com o resolver `letsencrypt`):

```bash
git clone https://github.com/andrewsegas/da-tec.git /docker/datec
cd /docker/datec/deploy
sh setup.sh                       # gera .env com segredos novos — revise DOMAIN
docker compose up -d --build      # sobe tudo (o build do app leva ~1 min)
docker compose run --rm migrate   # aplica as migrations do Drizzle
sh scripts/create-admin.sh voce@exemplo.com "Seu Nome"
```

## Atualizar para uma nova versão

```bash
cd /docker/datec && git pull
cd deploy
sh scripts/backup.sh              # sempre antes de migrar
docker compose --profile tools build migrate && docker compose run --rm migrate
docker compose up -d --build app
```

## Operação do dia a dia

```bash
docker compose ps                         # saúde dos serviços
docker compose logs -f app                # logs do Next.js
docker compose logs -f auth               # logs de login/cadastro
docker compose restart app                # reinicia só o app
```

**Studio (painel do banco):** da sua máquina,
`ssh -L 8000:127.0.0.1:8000 root@<vps>` e abra <http://localhost:8000>.
Usuário e senha: `DASHBOARD_USERNAME` / `DASHBOARD_PASSWORD` do `deploy/.env`.

**Backups:** o cron `/etc/cron.d/datec-backup` roda `scripts/backup.sh` todo
dia às 03:15 e guarda em `deploy/backups/`. Para restaurar num banco limpo:

```bash
gunzip -c backups/ARQUIVO.sql.gz | docker exec -i supabase-db psql -U supabase_admin -d postgres
```

> Os backups ficam na mesma VPS. Copie-os para fora de tempos em tempos
> (ex.: `scp root@<vps>:/docker/datec/deploy/backups/*.gz .`).

## E-mail (SMTP)

Sem SMTP, o cadastro é confirmado na hora (`ENABLE_EMAIL_AUTOCONFIRM=true`),
como no ambiente local. A trigger `enforce_signup_gate` garante, no banco, que
só entra e-mail `@unisanta.br` ou com convite aprovado. Mas, sem confirmação,
ninguém prova que é dono do e-mail.

Para exigir confirmação, preencha `SMTP_*` no `.env`, mude
`ENABLE_EMAIL_AUTOCONFIRM=false` e rode `docker compose up -d auth`. O app
também vai precisar de uma tela "confirme seu e-mail" e de uma rota de callback.
Hoje o cadastro redireciona direto para `/onboarding`.

## Cuidados com recursos

A VPS tem 1 vCPU e 4 GB de RAM (com 4 GB de swap). A stack usa ~1,3 GB em
repouso. Para liberar memória, o Studio e o Meta podem ser parados quando não
estiverem em uso (`docker compose stop studio meta`). Nesse caso o gateway
continua servindo a API normalmente.
