import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { inviteStatus } from "../../db/enums";

/**
 * Convites de acesso. Permitem que alguém sem e-mail institucional se cadastre
 * quando um moderador aprova o convite. O gate de cadastro (domínio OU convite
 * aprovado) é aplicado nas Server Actions de auth.
 */
export const invites = pgTable("invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  status: inviteStatus("status").notNull().default("pendente"),
  note: text("note"),
  invitedBy: uuid("invited_by"),
  approvedBy: uuid("approved_by"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Invite = typeof invites.$inferSelect;
export type NewInvite = typeof invites.$inferInsert;
