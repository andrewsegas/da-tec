-- Feed da Comunidade: RLS (autor + moderação) e Realtime.

-- Acesso do PostgREST (RLS controla as linhas) ----------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."posts" TO anon, authenticated, service_role;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."comments" TO anon, authenticated, service_role;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."post_likes" TO anon, authenticated, service_role;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."comment_likes" TO anon, authenticated, service_role;
--> statement-breakpoint

ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "public"."post_likes" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "public"."comment_likes" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

-- Posts: todos leem; autor cria; autor OU staff exclui ---------------------
CREATE POLICY "posts_select_authenticated" ON "public"."posts"
  FOR SELECT TO authenticated USING (true);
--> statement-breakpoint
CREATE POLICY "posts_insert_own" ON "public"."posts"
  FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
--> statement-breakpoint
CREATE POLICY "posts_delete_own_or_staff" ON "public"."posts"
  FOR DELETE TO authenticated
  USING (
    author_id = auth.uid()
    OR public.current_app_role() IN ('moderador', 'admin')
  );
--> statement-breakpoint

-- Comentários: mesma lógica ------------------------------------------------
CREATE POLICY "comments_select_authenticated" ON "public"."comments"
  FOR SELECT TO authenticated USING (true);
--> statement-breakpoint
CREATE POLICY "comments_insert_own" ON "public"."comments"
  FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
--> statement-breakpoint
CREATE POLICY "comments_delete_own_or_staff" ON "public"."comments"
  FOR DELETE TO authenticated
  USING (
    author_id = auth.uid()
    OR public.current_app_role() IN ('moderador', 'admin')
  );
--> statement-breakpoint

-- Curtidas: todos leem (contagem); cada um cria/remove a própria -----------
CREATE POLICY "post_likes_select_authenticated" ON "public"."post_likes"
  FOR SELECT TO authenticated USING (true);
--> statement-breakpoint
CREATE POLICY "post_likes_insert_own" ON "public"."post_likes"
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
--> statement-breakpoint
CREATE POLICY "post_likes_delete_own" ON "public"."post_likes"
  FOR DELETE TO authenticated USING (user_id = auth.uid());
--> statement-breakpoint

CREATE POLICY "comment_likes_select_authenticated" ON "public"."comment_likes"
  FOR SELECT TO authenticated USING (true);
--> statement-breakpoint
CREATE POLICY "comment_likes_insert_own" ON "public"."comment_likes"
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
--> statement-breakpoint
CREATE POLICY "comment_likes_delete_own" ON "public"."comment_likes"
  FOR DELETE TO authenticated USING (user_id = auth.uid());
--> statement-breakpoint

-- Realtime: feed ao vivo ---------------------------------------------------
ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."posts";
--> statement-breakpoint
ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."comments";
--> statement-breakpoint
ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."post_likes";
--> statement-breakpoint
ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."comment_likes";
