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

Módulos da Fase 1: `auth`, `profiles`, `polls`, `feed`, `mural` e `sports`.
O domínio `sports` centraliza modalidades, equipes, peneiras, inscrições e
elencos; jogos e placares continuam no `mural`, vinculados opcionalmente a uma
equipe.

## Domínio `sports`

O módulo separa o catálogo esportivo em cinco entidades:

- `sports`: modalidades, identificadas por um `slug` único;
- `teams`: equipes de uma modalidade, categoria e temporada;
- `tryouts`: peneiras de uma equipe, com local, datas, prazo e limite opcional;
- `tryout_registrations`: inscrição única de cada aluno em uma peneira;
- `team_members`: elenco oficial e função de cada integrante.

As consultas públicas da área autenticada usam `listSports()`, que retorna
somente modalidades ativas e omite equipes inativas. A gestão usa
`listSports(true)` para consultar todo o histórico. `getSportBySlug()` alimenta
a página de detalhes de cada modalidade, enquanto `getMySports()` reúne, no
perfil, as inscrições e equipes do usuário.

As mutações ficam em `actions.ts` e exigem autenticação. Cadastro e gestão são
restritos a `moderador` e `admin`; o aluno pode apenas criar ou cancelar a
própria inscrição enquanto a peneira estiver aberta. Ao mudar uma inscrição
para `aprovado`, a ação também cria ou reativa o integrante no elenco. Se a
aprovação for revertida, o vínculo com o elenco é removido.

### Integrações

- `/esportes`: catálogo de modalidades ativas;
- `/esportes/[slug]`: consulta de equipes, peneiras e elencos;
- `/moderacao/esportes`: gestão completa pela diretoria;
- `/perfil`: resumo de inscrições e participações do aluno;
- `/mural/jogos/novo` e `/mural/jogos/[id]/editar`: vínculo opcional de um jogo
  a uma equipe cadastrada.
