/**
 * Schema do banco (Drizzle ORM) — ponto único de reexport.
 *
 * Enums compartilhados ficam em `./enums`; cada domínio define suas tabelas no
 * próprio módulo (`src/modules/<dominio>/schema.ts`) e são reexportadas aqui.
 */
export * from "./enums";
export * from "../modules/profiles/schema";
export * from "../modules/auth/schema";
export * from "../modules/polls/schema";
export * from "../modules/feed/schema";
export * from "../modules/mural/schema";
