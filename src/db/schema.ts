import { pgEnum } from "drizzle-orm/pg-core";

/**
 * Schema do banco (Drizzle ORM).
 *
 * Etapa 0 — Fundação: apenas o enum de papéis. As tabelas de cada domínio
 * (profiles, polls, petitions, news, reviews) são adicionadas nas suas fases,
 * cada uma no seu módulo, e reexportadas aqui.
 */
export const userRole = pgEnum("user_role", ["aluno", "moderador", "admin"]);
