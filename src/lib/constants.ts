/** Papéis de usuário da plataforma (ver CLAUDE.md — regras de negócio). */
export const USER_ROLES = ["aluno", "moderador", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const APP_NAME = "da-tec";
export const APP_DESCRIPTION =
  "Plataforma da Comunidade Tec Unisanta — voz, voto e participação dos alunos de Tecnologia.";
