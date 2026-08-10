# Política de Segurança

O **da-tec** lida com dados de estudantes (votos, avaliações, perfis) e leva
privacidade a sério — pseudonimização e LGPD são regras de negócio do projeto.
Se você encontrou uma falha de segurança, obrigado por reportar com responsabilidade.

## Como reportar uma vulnerabilidade

**Não abra uma issue pública** para falhas de segurança — isso exporia o problema
antes da correção.

Prefira o canal privado do GitHub:

1. Acesse a aba **Security** do repositório.
2. Clique em **Report a vulnerability** (Private vulnerability reporting).
3. Descreva o problema, o impacto e, se possível, um passo a passo para reproduzir.

Se preferir, envie um e-mail para os mantenedores (diretoria do DA de Tecnologia).

## O que esperar

- Confirmamos o recebimento em até **7 dias**.
- Avaliamos e, se confirmado, trabalhamos numa correção priorizada.
- Damos crédito a quem reportou, se você desejar.

## Escopo

São especialmente bem-vindos relatos sobre:

- Falhas de **RLS** (Row Level Security) que exponham dados entre usuários.
- Vazamento de **votos ou avaliações** que quebre a pseudonimização/k-anonimato.
- Bypass do cadastro restrito (e-mail institucional ou convite).
- Exposição de segredos, escalonamento de privilégios (aluno → moderador/admin).

## Boas práticas para quem contribui

- Nunca comite arquivos `.env` reais — apenas `.env.example` com placeholders.
- Toda tabela nova precisa de **RLS ativa** e políticas explícitas.
- Valide toda entrada de usuário com **Zod** nas Server Actions.
- Nunca logue dados pessoais.
