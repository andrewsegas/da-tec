# CLAUDE.md — da-tec (Plataforma da Comunidade Tec Unisanta)

Plataforma open source de comunidade e participação estudantil do Diretório Acadêmico dos cursos de Tecnologia da Unisanta. Leia o `PLANO.md` antes de qualquer trabalho — ele define visão, módulos e fases.

## Stack

- Next.js 15+ (App Router) + TypeScript estrito (`strict: true`, sem `any`)
- Tailwind CSS + shadcn/ui — tema padrão escuro em tons de azul
- Supabase: PostgreSQL + Auth + Realtime, com RLS (Row Level Security) em TODAS as tabelas
- Drizzle ORM com migrations versionadas em `db/migrations/`
- Testes: Vitest (unit/integração) + Playwright (e2e)
- Deploy: Vercel + Supabase

## Estrutura

```
src/
  app/            # rotas (App Router), server components por padrão
  components/     # UI compartilhada (shadcn em components/ui)
  modules/        # domínios: auth, profiles, polls, petitions, news, reviews
  db/             # schema Drizzle, migrations, seed
  lib/            # helpers, clients (supabase), validações (zod)
tests/            # vitest + playwright
```

- Cada módulo de domínio é autocontido: schema, queries, actions, componentes e testes próprios.
- Server Actions para mutações; validação com Zod em toda entrada de usuário.

## Regras de negócio críticas

- Cadastro só com e-mail institucional Unisanta ou convite aprovado. Papéis: `aluno`, `moderador`, `admin`.
- Enquete: 1 voto por aluno, alterável até encerrar; visibilidade do resultado é configurável.
- Petição: ao atingir a meta de assinaturas, status muda automaticamente para `aguardando_resposta`; resposta oficial é pública.
- Avaliação de professores: rubrica 1–5 SEM texto livre público; agregados só exibidos com ≥5 respostas (k-anonimato); comentários textuais visíveis apenas para moderadores. Nunca expor resposta individual.
- Votos e avaliações pseudonimizados no banco (LGPD). Nunca logar dados pessoais.

## Verificação (obrigatória, toda fase)

Antes de qualquer commit de fechamento de fase, TODOS verdes:

```bash
npm run lint && npm run typecheck && npm run test && npm run build
```

E2e (Playwright) obrigatório para fluxos de auth, voto e assinatura de petição.

## Convenções

- Commits: Conventional Commits em português (`feat: enquetes com voto único`).
- Branch por fase: `fase-1-auth`, `fase-1-enquetes`…
- Trabalhe em fases pequenas e pare para revisão ao fim de cada uma — o Andrews revisa antes da próxima.
- UI em pt-BR. Código (variáveis, funções) em inglês.
- Projeto open source com contribuição de alunos: código exemplar, comentários onde a regra de negócio não é óbvia, issues `good first issue` ao identificar tarefas isoláveis.
