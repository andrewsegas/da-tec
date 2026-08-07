# Contribuindo com o da-tec

Que bom ter você aqui! 🎉 Este projeto é feito **por alunos, para alunos**. Se
esta for a sua **primeira contribuição em open source**, relaxa: este guia foi
escrito pensando exatamente em você. Ninguém nasce sabendo — a gente aprende
contribuindo.

## Código de Conduta

Ao participar, você concorda em seguir o nosso
[Código de Conduta](./CODE_OF_CONDUCT.md). Seja gentil: revisamos código, não
pessoas.

## Por onde começar

1. Procure issues com o rótulo **`good first issue`** — são tarefas pequenas e
   bem delimitadas, ideais para a primeira contribuição.
2. Comente na issue dizendo que quer pegá-la, para ninguém trabalhar em dobro.
3. Ficou com dúvida? Pergunte na própria issue. Perguntar é parte do processo.

## Preparando o ambiente

Siga o passo a passo do [README](./README.md#como-rodar-localmente). Em resumo:

```bash
npm install
npx supabase start      # requer Docker
cp .env.example .env.local && cp .env.example .env
npm run dev
```

## Fluxo de contribuição (passo a passo)

1. **Faça um fork** do repositório (botão "Fork" no GitHub).
2. **Clone** o seu fork:
   ```bash
   git clone https://github.com/SEU-USUARIO/da-tec.git
   cd da-tec
   ```
3. **Crie uma branch** com nome descritivo. Usamos branch por fase/tarefa:
   ```bash
   git checkout -b fase-1-enquetes
   ```
4. **Programe.** Código em inglês (variáveis, funções); textos de UI em pt-BR.
   Comente onde a **regra de negócio** não for óbvia.
5. **Rode a verificação** antes de commitar — precisa estar tudo verde:
   ```bash
   npm run lint && npm run typecheck && npm run test && npm run build
   ```
6. **Commite** seguindo Conventional Commits **em português** (veja abaixo).
7. **Envie** e **abra um Pull Request** para a branch principal, descrevendo o
   que mudou e como testar. Vincule a issue (ex.: "Closes #12").
8. Um monitor/orientador revisa. Ajustes fazem parte — não desanime. 💪

## Conventional Commits (em português)

Formato: `tipo: descrição no imperativo`.

| Tipo | Quando usar |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Só documentação |
| `refactor` | Refatoração sem mudar comportamento |
| `test` | Adição/ajuste de testes |
| `chore` | Tarefas de infra/configuração |

Exemplos:

```
feat: enquetes com voto único por aluno
fix: corrige contagem de assinaturas ao atingir a meta
docs: explica como rodar o supabase local
```

## Regras que não podem ser quebradas

Estas vêm das regras de negócio (veja o [`CLAUDE.md`](./CLAUDE.md)):

- **Sem `any`** no TypeScript e **RLS em todas as tabelas** do Supabase.
- **Valide toda entrada de usuário com Zod** nas Server Actions.
- **LGPD:** votos e avaliações são pseudonimizados; **nunca logue dados
  pessoais**.
- **Avaliação de disciplinas:** sem texto livre público; agregados só com 5+
  respostas (k-anonimato).

## Dúvidas

Abra uma issue com o rótulo `question` ou pergunte na issue em que está
trabalhando. Toda pergunta é bem-vinda. Bons commits! 🚀
