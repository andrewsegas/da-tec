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

/** Situação de um jogo/competição no mural. */
export const gameStatus = pgEnum("game_status", ["agendado", "encerrado"]);

/** Situação de uma equipe esportiva. */
export const teamStatus = pgEnum("team_status", [
  "recrutando",
  "formado",
  "inativo",
]);

/** Situação de uma peneira. */
export const tryoutStatus = pgEnum("tryout_status", [
  "agendada",
  "encerrada",
  "cancelada",
]);

/** Resultado da inscrição de um aluno em uma peneira. */
export const tryoutRegistrationStatus = pgEnum(
  "tryout_registration_status",
  ["inscrito", "lista_espera", "aprovado", "nao_selecionado"],
);

/** Função de uma pessoa no elenco. */
export const teamMemberRole = pgEnum("team_member_role", [
  "atleta",
  "capitao",
  "tecnico",
]);
