# Módulos de domínio

Cada domínio da plataforma vive numa pasta própria e é **autocontido**: schema,
queries, server actions, componentes e testes ficam juntos. Isso facilita a
contribuição de alunos — dá para trabalhar num módulo sem entender todo o resto.

Estrutura sugerida de um módulo:

```
modules/<dominio>/
  schema.ts        # tabelas Drizzle do domínio (reexportadas em src/db/schema.ts)
  queries.ts       # leituras (server-side)
  actions.ts       # Server Actions (mutações) com validação Zod
  validation.ts    # schemas Zod de entrada
  components/       # UI específica do domínio
  <dominio>.test.ts # testes do domínio
```

Módulos planejados na Fase 1: `auth`, `profiles`, `polls`, `petitions`,
`news`, `reviews`.
