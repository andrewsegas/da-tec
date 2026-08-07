-- Etapa 1 — Auth e perfis: FKs para auth.users, RLS, triggers e RPCs.
-- Escrito à mão (drizzle-kit generate --custom). O schema `auth` é do Supabase.

-- Chaves estrangeiras para auth.users -------------------------------------
ALTER TABLE "public"."profiles"
  ADD CONSTRAINT "profiles_id_users_fk"
  FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "public"."invites"
  ADD CONSTRAINT "invites_invited_by_users_fk"
  FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;
--> statement-breakpoint
ALTER TABLE "public"."invites"
  ADD CONSTRAINT "invites_approved_by_users_fk"
  FOREIGN KEY ("approved_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;
--> statement-breakpoint

-- Acesso do PostgREST (RLS ainda controla as linhas) ----------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."profiles" TO anon, authenticated, service_role;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."invites" TO anon, authenticated, service_role;
--> statement-breakpoint

-- Papel do usuário atual (SECURITY DEFINER evita recursão de RLS) ----------
CREATE OR REPLACE FUNCTION "public"."current_app_role"()
RETURNS "public"."user_role"
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION "public"."current_app_role"() TO anon, authenticated, service_role;
--> statement-breakpoint

-- Cria o perfil automaticamente ao criar o usuário ------------------------
CREATE OR REPLACE FUNCTION "public"."handle_new_user"()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;
--> statement-breakpoint
DROP TRIGGER IF EXISTS "on_auth_user_created" ON "auth"."users";
--> statement-breakpoint
CREATE TRIGGER "on_auth_user_created"
AFTER INSERT ON "auth"."users"
FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_user"();
--> statement-breakpoint

-- Só admin pode alterar papéis (contexto de serviço/seed tem auth.uid() nulo)
CREATE OR REPLACE FUNCTION "public"."prevent_role_escalation"()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND auth.uid() IS NOT NULL
     AND COALESCE(public.current_app_role(), 'aluno') <> 'admin' THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar papéis.';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER "profiles_no_role_escalation"
BEFORE UPDATE ON "public"."profiles"
FOR EACH ROW EXECUTE FUNCTION "public"."prevent_role_escalation"();
--> statement-breakpoint

-- Mantém updated_at ------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."touch_updated_at"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER "profiles_touch_updated_at"
BEFORE UPDATE ON "public"."profiles"
FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();
--> statement-breakpoint
CREATE TRIGGER "invites_touch_updated_at"
BEFORE UPDATE ON "public"."invites"
FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();
--> statement-breakpoint

-- RPC usado no cadastro para checar convite aprovado (anon) ----------------
CREATE OR REPLACE FUNCTION "public"."email_has_approved_invite"(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.invites
    WHERE lower(email) = lower(p_email) AND status = 'aprovado'
  );
$$;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION "public"."email_has_approved_invite"(text) TO anon, authenticated, service_role;
--> statement-breakpoint

-- Row Level Security -----------------------------------------------------
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "public"."invites" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "profiles_select_authenticated" ON "public"."profiles"
  FOR SELECT TO authenticated USING (true);
--> statement-breakpoint
CREATE POLICY "profiles_update_own" ON "public"."profiles"
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
--> statement-breakpoint
CREATE POLICY "profiles_admin_all" ON "public"."profiles"
  FOR ALL TO authenticated
  USING (public.current_app_role() = 'admin')
  WITH CHECK (public.current_app_role() = 'admin');
--> statement-breakpoint
CREATE POLICY "invites_moderator_all" ON "public"."invites"
  FOR ALL TO authenticated
  USING (public.current_app_role() IN ('moderador', 'admin'))
  WITH CHECK (public.current_app_role() IN ('moderador', 'admin'));
