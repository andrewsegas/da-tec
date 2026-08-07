import { pgEnum } from "drizzle-orm/pg-core";

/** Papéis de usuário na plataforma. */
export const userRole = pgEnum("user_role", ["aluno", "moderador", "admin"]);

/** Situação de um convite de acesso (para quem não tem e-mail institucional). */
export const inviteStatus = pgEnum("invite_status", [
  "pendente",
  "aprovado",
  "rejeitado",
]);

/** Situação de uma enquete. */
export const pollStatus = pgEnum("poll_status", ["aberta", "encerrada"]);
