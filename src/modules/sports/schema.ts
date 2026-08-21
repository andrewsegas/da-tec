import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import {
  teamMemberRole,
  teamStatus,
  tryoutRegistrationStatus,
  tryoutStatus,
} from "../../db/enums";
import { profiles } from "../profiles/schema";

/** Modalidade esportiva administrada pelo DA. */
export const sports = pgTable(
  "sports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    active: boolean("active").notNull().default(true),
    createdBy: uuid("created_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("sports_slug_uq").on(table.slug)],
);

/** Time de uma modalidade em determinada categoria/temporada. */
export const teams = pgTable(
  "teams",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sportId: uuid("sport_id")
      .notNull()
      .references(() => sports.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category").notNull(),
    season: text("season").notNull(),
    description: text("description"),
    status: teamStatus("status").notNull().default("recrutando"),
    responsibleId: uuid("responsible_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    createdBy: uuid("created_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("teams_sport_name_season_uq").on(
      table.sportId,
      table.name,
      table.season,
    ),
  ],
);

/** Processo seletivo para entrada em uma equipe. */
export const tryouts = pgTable("tryouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  registrationDeadline: timestamp("registration_deadline", {
    withTimezone: true,
  }).notNull(),
  maxSpots: integer("max_spots"),
  status: tryoutStatus("status").notNull().default("agendada"),
  createdBy: uuid("created_by").references(() => profiles.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Inscrição única de um aluno em uma peneira. */
export const tryoutRegistrations = pgTable(
  "tryout_registrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tryoutId: uuid("tryout_id")
      .notNull()
      .references(() => tryouts.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    status: tryoutRegistrationStatus("status").notNull().default("inscrito"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("tryout_registrations_tryout_user_uq").on(
      table.tryoutId,
      table.userId,
    ),
  ],
);

/** Elenco oficial de uma equipe. */
export const teamMembers = pgTable(
  "team_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    role: teamMemberRole("role").notNull().default("atleta"),
    active: boolean("active").notNull().default(true),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("team_members_team_user_uq").on(table.teamId, table.userId),
  ],
);

export type Sport = typeof sports.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Tryout = typeof tryouts.$inferSelect;
export type TryoutRegistration = typeof tryoutRegistrations.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
