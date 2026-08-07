-- Etapa 2 — Enquetes: FK, RLS, RPCs de voto pseudonimizado e Realtime.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
--> statement-breakpoint

ALTER TABLE "public"."polls"
  ADD CONSTRAINT "polls_created_by_users_fk"
  FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;
--> statement-breakpoint

-- Acesso do PostgREST (RLS controla as linhas) ----------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."polls" TO anon, authenticated, service_role;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."poll_options" TO anon, authenticated, service_role;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."poll_votes" TO anon, authenticated, service_role;
--> statement-breakpoint

-- Row Level Security ------------------------------------------------------
ALTER TABLE "public"."polls" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "public"."poll_options" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "public"."poll_votes" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY "polls_select_authenticated" ON "public"."polls"
  FOR SELECT TO authenticated USING (true);
--> statement-breakpoint
CREATE POLICY "polls_staff_write" ON "public"."polls"
  FOR ALL TO authenticated
  USING (public.current_app_role() IN ('moderador', 'admin'))
  WITH CHECK (public.current_app_role() IN ('moderador', 'admin'));
--> statement-breakpoint

CREATE POLICY "poll_options_select_authenticated" ON "public"."poll_options"
  FOR SELECT TO authenticated USING (true);
--> statement-breakpoint
CREATE POLICY "poll_options_staff_write" ON "public"."poll_options"
  FOR ALL TO authenticated
  USING (public.current_app_role() IN ('moderador', 'admin'))
  WITH CHECK (public.current_app_role() IN ('moderador', 'admin'));
--> statement-breakpoint

-- Votos: leitura só quando o resultado é visível; escrita apenas via RPC.
CREATE POLICY "poll_votes_select_when_visible" ON "public"."poll_votes"
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.polls p
      WHERE p.id = poll_votes.poll_id
        AND (
          p.hide_results = false
          OR p.status = 'encerrada'
          OR public.current_app_role() IN ('moderador', 'admin')
        )
    )
  );
--> statement-breakpoint

-- Registra/atualiza o voto do usuário (pseudonimizado; 1 por enquete) -------
CREATE OR REPLACE FUNCTION "public"."cast_vote"(p_poll_id uuid, p_option_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_status public.poll_status;
  v_closes timestamptz;
  v_hash text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'É preciso estar autenticado para votar.';
  END IF;

  SELECT status, closes_at INTO v_status, v_closes
  FROM public.polls WHERE id = p_poll_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Enquete não encontrada.';
  END IF;
  IF v_status <> 'aberta' OR (v_closes IS NOT NULL AND now() > v_closes) THEN
    RAISE EXCEPTION 'Esta enquete está encerrada.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.poll_options
    WHERE id = p_option_id AND poll_id = p_poll_id
  ) THEN
    RAISE EXCEPTION 'Opção inválida para esta enquete.';
  END IF;

  v_hash := encode(
    digest(p_poll_id::text || ':' || auth.uid()::text, 'sha256'),
    'hex'
  );

  INSERT INTO public.poll_votes (poll_id, option_id, voter_hash)
  VALUES (p_poll_id, p_option_id, v_hash)
  ON CONFLICT (poll_id, voter_hash)
  DO UPDATE SET option_id = EXCLUDED.option_id, updated_at = now();
END;
$$;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION "public"."cast_vote"(uuid, uuid) TO authenticated, service_role;
--> statement-breakpoint

-- Opção votada pelo usuário atual (sem revelar quem votou) -----------------
CREATE OR REPLACE FUNCTION "public"."get_my_vote"(p_poll_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT option_id FROM public.poll_votes
  WHERE poll_id = p_poll_id
    AND voter_hash = encode(
      digest(p_poll_id::text || ':' || auth.uid()::text, 'sha256'),
      'hex'
    );
$$;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION "public"."get_my_vote"(uuid) TO authenticated, service_role;
--> statement-breakpoint

-- Realtime: resultados ao vivo ---------------------------------------------
ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."polls";
--> statement-breakpoint
ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."poll_votes";
