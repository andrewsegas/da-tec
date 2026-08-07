import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { gameStatus } from "../../db/enums";
import { profiles } from "../profiles/schema";

/** Notícia / comunicado do DA (criada por moderadores). */
export const news = pgTable("news", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("author_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Jogo / competição com placar (Tec x adversário). */
export const games = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdBy: uuid("created_by").references(() => profiles.id, {
    onDelete: "set null",
  }),
  modality: text("modality").notNull(),
  opponent: text("opponent").notNull(),
  location: text("location"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  status: gameStatus("status").notNull().default("agendado"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Evento com confirmação de presença (RSVP). */
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdBy: uuid("created_by").references(() => profiles.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Confirmação de presença de um aluno num evento (1 por usuário/evento). */
export const eventRsvps = pgTable(
  "event_rsvps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("event_rsvps_event_user_uq").on(table.eventId, table.userId),
  ],
);

export type News = typeof news.$inferSelect;
export type Game = typeof games.$inferSelect;
export type Event = typeof events.$inferSelect;
