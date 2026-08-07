import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { userRole } from "../../db/enums";

/**
 * Perfil do aluno. `id` referencia `auth.users(id)` (a FK e o RLS são criados
 * na migration SQL, pois o schema `auth` é gerenciado pelo Supabase).
 *
 * O perfil é criado automaticamente por um trigger em `auth.users` no cadastro;
 * o aluno completa curso/período no onboarding (`onboarded_at`).
 */
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  fullName: text("full_name").notNull(),
  course: text("course"),
  period: integer("period"),
  avatarUrl: text("avatar_url"),
  role: userRole("role").notNull().default("aluno"),
  onboardedAt: timestamp("onboarded_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
