CREATE TYPE "public"."team_member_role" AS ENUM('atleta', 'capitao', 'tecnico');--> statement-breakpoint
CREATE TYPE "public"."team_status" AS ENUM('recrutando', 'formado', 'inativo');--> statement-breakpoint
CREATE TYPE "public"."tryout_registration_status" AS ENUM('inscrito', 'lista_espera', 'aprovado', 'nao_selecionado');--> statement-breakpoint
CREATE TYPE "public"."tryout_status" AS ENUM('agendada', 'encerrada', 'cancelada');--> statement-breakpoint
CREATE TABLE "sports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "team_member_role" DEFAULT 'atleta' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sport_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"season" text NOT NULL,
	"description" text,
	"status" "team_status" DEFAULT 'recrutando' NOT NULL,
	"responsible_id" uuid,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tryout_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tryout_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "tryout_registration_status" DEFAULT 'inscrito' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tryouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"location" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"registration_deadline" timestamp with time zone NOT NULL,
	"max_spots" integer,
	"status" "tryout_status" DEFAULT 'agendada' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sports" ADD CONSTRAINT "sports_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_sport_id_sports_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_responsible_id_profiles_id_fk" FOREIGN KEY ("responsible_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryout_registrations" ADD CONSTRAINT "tryout_registrations_tryout_id_tryouts_id_fk" FOREIGN KEY ("tryout_id") REFERENCES "public"."tryouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryout_registrations" ADD CONSTRAINT "tryout_registrations_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryouts" ADD CONSTRAINT "tryouts_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryouts" ADD CONSTRAINT "tryouts_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "sports_slug_uq" ON "sports" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "team_members_team_user_uq" ON "team_members" USING btree ("team_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "teams_sport_name_season_uq" ON "teams" USING btree ("sport_id","name","season");--> statement-breakpoint
CREATE UNIQUE INDEX "tryout_registrations_tryout_user_uq" ON "tryout_registrations" USING btree ("tryout_id","user_id");--> statement-breakpoint

GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."sports" TO authenticated, service_role;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."teams" TO authenticated, service_role;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."tryouts" TO authenticated, service_role;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."tryout_registrations" TO authenticated, service_role;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."team_members" TO authenticated, service_role;--> statement-breakpoint

ALTER TABLE "public"."sports" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."tryouts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."tryout_registrations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."team_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

CREATE POLICY "sports_select_authenticated" ON "public"."sports"
  FOR SELECT TO authenticated USING (true);--> statement-breakpoint
CREATE POLICY "sports_staff_write" ON "public"."sports"
  FOR ALL TO authenticated
  USING (public.current_app_role() IN ('moderador', 'admin'))
  WITH CHECK (public.current_app_role() IN ('moderador', 'admin'));--> statement-breakpoint

CREATE POLICY "teams_select_authenticated" ON "public"."teams"
  FOR SELECT TO authenticated USING (true);--> statement-breakpoint
CREATE POLICY "teams_staff_write" ON "public"."teams"
  FOR ALL TO authenticated
  USING (public.current_app_role() IN ('moderador', 'admin'))
  WITH CHECK (public.current_app_role() IN ('moderador', 'admin'));--> statement-breakpoint

CREATE POLICY "tryouts_select_authenticated" ON "public"."tryouts"
  FOR SELECT TO authenticated USING (true);--> statement-breakpoint
CREATE POLICY "tryouts_staff_write" ON "public"."tryouts"
  FOR ALL TO authenticated
  USING (public.current_app_role() IN ('moderador', 'admin'))
  WITH CHECK (public.current_app_role() IN ('moderador', 'admin'));--> statement-breakpoint

CREATE POLICY "registrations_select_own_or_staff" ON "public"."tryout_registrations"
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.current_app_role() IN ('moderador', 'admin')
  );--> statement-breakpoint
CREATE POLICY "registrations_insert_own_open_tryout" ON "public"."tryout_registrations"
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'inscrito'
    AND EXISTS (
      SELECT 1 FROM public.tryouts
      WHERE tryouts.id = tryout_id
        AND tryouts.status = 'agendada'
        AND tryouts.registration_deadline > now()
    )
  );--> statement-breakpoint
CREATE POLICY "registrations_delete_own_pending" ON "public"."tryout_registrations"
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    AND status = 'inscrito'
    AND EXISTS (
      SELECT 1 FROM public.tryouts
      WHERE tryouts.id = tryout_id
        AND tryouts.status = 'agendada'
        AND tryouts.registration_deadline > now()
    )
  );--> statement-breakpoint
CREATE POLICY "registrations_staff_update_delete" ON "public"."tryout_registrations"
  FOR ALL TO authenticated
  USING (public.current_app_role() IN ('moderador', 'admin'))
  WITH CHECK (public.current_app_role() IN ('moderador', 'admin'));--> statement-breakpoint

CREATE POLICY "team_members_select_authenticated" ON "public"."team_members"
  FOR SELECT TO authenticated USING (true);--> statement-breakpoint
CREATE POLICY "team_members_staff_write" ON "public"."team_members"
  FOR ALL TO authenticated
  USING (public.current_app_role() IN ('moderador', 'admin'))
  WITH CHECK (public.current_app_role() IN ('moderador', 'admin'));
