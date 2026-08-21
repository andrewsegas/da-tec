# da-tec — Plataforma da Comunidade Tec Unisanta

Plataforma **open source** de comunidade e participação estudantil do Diretório
Acadêmico dos cursos de Tecnologia da Unisanta. Aqui os alunos **votam**, criam
**abaixo-assinados**, acompanham o **mural** do DA (notícias, jogos e eventos) e
**avaliam disciplinas**, consultam os **times esportivos** e se inscrevem em
**peneiras** — tudo em um só lugar.

O projeto é também **ferramenta pedagógica**: os próprios alunos contribuem no
repositório. Se você nunca contribuiu com open source, comece por aqui — veja o
[CONTRIBUTING.md](./CONTRIBUTING.md).

> 📌 Antes de programar, leia o [`PLANO.md`](./PLANO.md) (visão, módulos e fases)
> e o [`CLAUDE.md`](./CLAUDE.md) (regras de negócio e convenções).

## Funcionalidades

- Autenticação com e-mail institucional e perfis públicos dos alunos;
- enquetes, feed da comunidade e mural com notícias, jogos e eventos;
- catálogo de modalidades e equipes esportivas do DA;
- inscrições em peneiras e acompanhamento do resultado pelo perfil;
- gestão de modalidades, times, peneiras, candidatos e elencos pela diretoria.

### Esportes, equipes e peneiras

Todo usuário autenticado pode abrir **Esportes** no menu ou acessar
[`/esportes`](http://localhost:3000/esportes) para consultar as modalidades
ativas. Ao selecionar uma modalidade, a página `/esportes/[slug]` mostra os
times existentes, categoria, temporada, situação, responsável do DA, próximas
peneiras e elenco oficial.

Quando uma peneira está agendada e dentro do prazo, o aluno pode se inscrever
ou cancelar a própria inscrição. O andamento aparece tanto na modalidade quanto
em **Meu perfil**, na seção **Meus esportes**. Uma aprovação feita pela diretoria
inclui o aluno automaticamente no elenco da equipe.

Usuários com papel `moderador` ou `admin` acessam
[`/moderacao/esportes`](http://localhost:3000/moderacao/esportes) para:

- cadastrar, arquivar e reativar modalidades;
- criar equipes por categoria e temporada, com responsável opcional;
- agendar peneiras e encerrar ou cancelar processos seletivos;
- classificar inscrições como inscrita, lista de espera, aprovada ou não
  selecionada;
- definir atletas, capitães e técnicos e manter o elenco;
- consultar também modalidades e equipes inativas.

Os jogos permanecem no domínio do mural. Ao criar ou editar um jogo, a
diretoria pode vinculá-lo opcionalmente a uma equipe já cadastrada em Esportes.

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

# 5. (Opcional) Crie usuários e dados de demonstração
npm run db:seed

# 6. Rode a aplicação
npm run dev
```

Abra <http://localhost:3000>.

O seed inclui uma modalidade de futsal, um time, uma peneira, uma inscrição e
um jogo vinculado ao time. Ele também cria `admin`, `moderador` e `aluno` no
domínio configurado por `NEXT_PUBLIC_UNISANTA_EMAIL_DOMAIN`; a senha de
desenvolvimento de todos é `senha123`.

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
  modules/        # domínios: auth, profiles, polls, feed, mural e sports
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
