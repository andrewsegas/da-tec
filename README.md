# da-tec — Plataforma da Comunidade Tec Unisanta

Plataforma **open source** de comunidade e participação estudantil do Diretório
Acadêmico dos cursos de Tecnologia da Unisanta. Aqui os alunos **votam**, criam
**abaixo-assinados**, acompanham o **mural** do DA (notícias, jogos e eventos) e
**avaliam disciplinas** — tudo em um só lugar.

O projeto é também **ferramenta pedagógica**: os próprios alunos contribuem no
repositório. Se você nunca contribuiu com open source, comece por aqui — veja o
[CONTRIBUTING.md](./CONTRIBUTING.md).

> 📌 Antes de programar, leia o [`PLANO.md`](./PLANO.md) (visão, módulos e fases)
> e o [`CLAUDE.md`](./CLAUDE.md) (regras de negócio e convenções).

## Stack

- **Next.js 15+** (App Router) + **TypeScript** estrito
- **Tailwind CSS** + **shadcn/ui** — tema escuro em tons de azul (navy) por padrão
- **Supabase** — PostgreSQL, Auth, Realtime e RLS em todas as tabelas
- **Drizzle ORM** — migrations versionadas em `src/db/migrations/`
- **Vitest** (unit/integração) + **Playwright** (e2e)
- Deploy: **Vercel** + **Supabase**

## Pré-requisitos

- [Node.js](https://nodejs.org) 20 ou superior
- [Docker](https://www.docker.com/) (para rodar o Supabase local via CLI)
- Git

## Como rodar localmente

```bash
# 1. Instale as dependências
npm install

# 2. Suba o Supabase local (PostgreSQL + Auth + Studio). Requer Docker.
npx supabase start
# A CLI imprime a API URL, a anon key e a connection string do banco.

# 3. Configure as variáveis de ambiente
cp .env.example .env.local   # variáveis do Next
cp .env.example .env         # variáveis do Drizzle (migrations/seed)
# Cole em ambos os valores impressos pelo `supabase start`.

# 4. Aplique o schema no banco
npm run db:push

# 5. Rode a aplicação
npm run dev
```

Abra <http://localhost:3000>.

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | Sobe o servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint (TypeScript estrito, sem `any`) |
| `npm run typecheck` | Checagem de tipos (`tsc --noEmit`) |
| `npm run test` | Testes unitários/integração (Vitest) |
| `npm run test:e2e` | Testes end-to-end (Playwright) |
| `npm run db:generate` | Gera migration a partir do schema |
| `npm run db:migrate` | Aplica migrations |
| `npm run db:push` | Sincroniza o schema com o banco (dev) |
| `npm run db:studio` | Abre o Drizzle Studio |
| `npm run db:seed` | Popula dados de exemplo |

## Estrutura

```
src/
  app/            # rotas (App Router), server components por padrão
  components/     # UI compartilhada (shadcn em components/ui)
  modules/        # domínios: auth, profiles, polls, petitions, news, reviews
  db/             # schema Drizzle, migrations, seed
  lib/            # helpers, clients (supabase), validações (zod)
tests/            # vitest (unit) + playwright (e2e)
supabase/         # configuração do Supabase local
```

Cada módulo de domínio é autocontido (schema, queries, actions, componentes e
testes próprios). Veja [`src/modules/README.md`](./src/modules/README.md).

## Verificação (obrigatória por fase)

Antes de fechar qualquer fase, tudo verde:

```bash
npm run lint && npm run typecheck && npm run test && npm run build
```

## Contribuindo

Contribuições de alunos são muito bem-vindas — inclusive a primeira da sua vida.
Leia o [CONTRIBUTING.md](./CONTRIBUTING.md) e o
[Código de Conduta](./CODE_OF_CONDUCT.md). Procure issues marcadas com
`good first issue`.

## Licença

[MIT](./LICENSE) — © 2026 Comunidade Tec Unisanta.
