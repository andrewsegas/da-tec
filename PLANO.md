# PLANO.md — Plataforma da Comunidade Tec Unisanta (codinome: `da-tec`)

> Arquitetado no Cowork em 07/08/2026. Construção via Claude CLI no VS Code, em fases com verificação obrigatória.

## 1. Visão

Os cursos de Tecnologia da Unisanta compartilham um Diretório Acadêmico fraco: alunos desunidos, sem voz institucional, invisíveis nas competições e sem canal para cobrar qualidade de ensino. Os cursos de Engenharia, mais organizados, dominam o espaço mesmo sendo menores.

O `da-tec` é uma **plataforma open source de comunidade e participação** que centraliza a vida dos alunos de tecnologia: votar, assinar abaixo-assinados, comentar, acompanhar notícias do DA, jogos e eventos, avaliar disciplinas e, futuramente, eleger a chapa do DA. O projeto é também **ferramenta pedagógica**: os próprios alunos contribuem no repositório, com patrocínio da universidade e força docente por trás.

**Meta:** tornar o curso de Tecnologia da Unisanta referência em organização estudantil — e o repositório, um cartão de visitas da comunidade.

## 2. Referências (estado da arte)

- **Decidim** (decidim.org) — referência de UX de participação: propostas, iniciativas com meta de assinaturas, debates, gamificação. Copiamos os padrões, não o código (Ruby).
- **Helios Voting** — votação criptograficamente verificável, padrão em instituições públicas brasileiras (UESPI, IFAM, IFSC, UFPel). Fase 2: integrar ou replicar o modelo auditável para a eleição da chapa.
- **CONSUL Democracy** — referência de fluxo de petições públicas com resposta oficial obrigatória ao atingir a meta.

## 3. Stack (decidida)

| Camada | Escolha | Motivo |
|---|---|---|
| Framework | **Next.js 15+ (App Router) + TypeScript** | Stack que os alunos dominam/querem aprender; mercado |
| UI | Tailwind CSS + shadcn/ui | Velocidade + acessibilidade; tema escuro em tons de azul como padrão |
| Banco + Auth | **Supabase** (PostgreSQL, Auth, Realtime, RLS) | Auth pronta (e-mail institucional), free tier generoso, realtime para comentários |
| ORM | Drizzle | Type-safe, leve, migrations versionadas |
| Deploy | Vercel (app) + Supabase (dados) | Custo ~zero no início |
| Testes | Vitest (unit) + Playwright (e2e) | Verificação obrigatória por fase |
| Repo | GitHub público, licença MIT | Issues `good first issue` para alunos |

## 4. Módulos

### Fase 1 — MVP
1. **Identidade e perfil**
   - Cadastro restrito: e-mail institucional Unisanta (allowlist de domínio) OU convite aprovado por moderador.
   - Perfil: nome, curso, período, avatar, badges (contribuidor do repo, votante assíduo, atleta…).
   - Papéis: `aluno`, `moderador` (diretoria do DA), `admin` (você/docentes).
2. **Enquetes e votações internas**
   - Criação por moderadores; voto único por aluno; resultado em tempo real ou oculto até encerrar (configurável).
   - Primeira enquete simbólica: **os alunos votam o nome oficial da plataforma** (engajamento desde o dia 1).
3. **Abaixo-assinados (petições)**
   - Qualquer aluno cria; meta de assinaturas; ao atingir a meta, status muda para "aguardando resposta do DA/coordenação" com prazo — resposta oficial fica pública (padrão CONSUL).
   - Comentários com threads e reações.
4. **Mural: notícias, jogos e eventos**
   - Posts do DA (notícias/comunicados), calendário de jogos e competições com placar, eventos com RSVP.
5. **Avaliação de disciplinas/professores** ⚠️ *design cuidadoso*
   - Rubrica estruturada (didática, material, avaliação, disponibilidade — escala 1–5), **sem texto livre público** na v1.
   - Resultados agregados só aparecem com **mínimo de 5 respostas** (k-anonimato) e por disciplina/semestre.
   - Comentários textuais vão só para a diretoria do DA (privados, moderados). Isso protege alunos e professores juridicamente (LGPD + evitar difamação) e ainda gera o instrumento de cobrança: dados agregados embasam o abaixo-assinado.

### Fase 2
- **Eleição da chapa do DA**: integração com Helios Voting (ou módulo próprio com voto secreto + trilha de auditoria com hash encadeado). Eleição é formal — não usar o módulo de enquetes.
- Gamificação completa (níveis, ranking de engajamento por curso).
- Notificações (e-mail + push PWA).

### Fase 3
- PWA instalável / mobile-first refinado.
- Espaço multi-DA (multitenant): oferecer a plataforma para outros diretórios — é aqui que o Tec vira referência na universidade.

## 5. Não-funcionais

- **LGPD**: consentimento no cadastro, dados mínimos, direito de exclusão, votos de enquete pseudonimizados no banco.
- **Moderação**: report de conteúdo, fila de moderação, código de conduta visível.
- **Acessibilidade**: WCAG AA; tema escuro azul como padrão, tema claro disponível.
- **Governança open source**: README forte, CONTRIBUTING.md, issues rotuladas por dificuldade, PRs de alunos revisados por você/monitores.

## 6. Fluxo de trabalho

Cowork = arquitetura e revisão de fase. Claude CLI = construção. Cada fase termina com verificação obrigatória: `lint` + `typecheck` + `test` + `build` verdes antes de commit. Fases pequenas, revisáveis, com commit semântico.
