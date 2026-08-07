-- Mural: RLS. Notícias/jogos/eventos são criados só por moderadores; todos
-- leem. RSVP de evento é do próprio usuário.

GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."news" TO anon, authenticated, service_role;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."games" TO anon, authenticated, service_role;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."events" TO anon, authenticated, service_role;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."event_rsvps" TO anon, authenticated, service_role;
--> statement-breakpoint

ALTER TABLE "public"."news" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "public"."games" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "public"."event_rsvps" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

-- Notícias -----------------------------------------------------------------
CREATE POLICY "news_select_authenticated" ON "public"."news"
  FOR SELECT TO authenticated USING (true);
--> statement-breakpoint
CREATE POLICY "news_staff_write" ON "public"."news"
  FOR ALL TO authenticated
  USING (public.current_app_role() IN ('moderador', 'admin'))
  WITH CHECK (public.current_app_role() IN ('moderador', 'admin'));
--> statement-breakpoint

-- Jogos --------------------------------------------------------------------
CREATE POLICY "games_select_authenticated" ON "public"."games"
  FOR SELECT TO authenticated USING (true);
--> statement-breakpoint
CREATE POLICY "games_staff_write" ON "public"."games"
  FOR ALL TO authenticated
  USING (public.current_app_role() IN ('moderador', 'admin'))
  WITH CHECK (public.current_app_role() IN ('moderador', 'admin'));
--> statement-breakpoint

-- Eventos ------------------------------------------------------------------
CREATE POLICY "events_select_authenticated" ON "public"."events"
  FOR SELECT TO authenticated USING (true);
--> statement-breakpoint
CREATE POLICY "events_staff_write" ON "public"."events"
  FOR ALL TO authenticated
  USING (public.current_app_role() IN ('moderador', 'admin'))
  WITH CHECK (public.current_app_role() IN ('moderador', 'admin'));
--> statement-breakpoint

-- RSVP: todos leem (contagem); cada um cria/remove a própria confirmação ----
CREATE POLICY "event_rsvps_select_authenticated" ON "public"."event_rsvps"
  FOR SELECT TO authenticated USING (true);
--> statement-breakpoint
CREATE POLICY "event_rsvps_insert_own" ON "public"."event_rsvps"
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
--> statement-breakpoint
CREATE POLICY "event_rsvps_delete_own" ON "public"."event_rsvps"
  FOR DELETE TO authenticated USING (user_id = auth.uid());
