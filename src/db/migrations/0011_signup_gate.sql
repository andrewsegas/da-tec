-- Gate de cadastro no banco: e-mail institucional OU convite aprovado.
-- Escrito à mão (drizzle-kit generate --custom).
--
-- Por que no banco? A anon key é pública (vai no bundle do browser), então
-- qualquer pessoa pode chamar `POST /auth/v1/signup` direto, sem passar pela
-- Server Action `signUpAction`. A checagem no app continua existindo (dá a
-- mensagem amigável); esta trigger é a garantia de verdade.
--
-- O domínio aqui deve ser o mesmo de NEXT_PUBLIC_UNISANTA_EMAIL_DOMAIN.

CREATE OR REPLACE FUNCTION "public"."is_signup_email_allowed"(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(split_part(trim(p_email), '@', 2)) = 'unisanta.br'
      OR public.email_has_approved_invite(trim(p_email));
$$;
--> statement-breakpoint
REVOKE EXECUTE ON FUNCTION "public"."is_signup_email_allowed"(text) FROM PUBLIC, anon, authenticated;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION "public"."enforce_signup_gate"()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Só valida quando há e-mail (cadastro por e-mail é o único habilitado).
  IF NEW.email IS NOT NULL
     AND (TG_OP = 'INSERT' OR NEW.email IS DISTINCT FROM OLD.email)
     AND NOT public.is_signup_email_allowed(NEW.email) THEN
    RAISE EXCEPTION 'Cadastro restrito a e-mail institucional ou convite aprovado.'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
DROP TRIGGER IF EXISTS "enforce_signup_gate" ON "auth"."users";
--> statement-breakpoint
CREATE TRIGGER "enforce_signup_gate"
BEFORE INSERT OR UPDATE OF "email" ON "auth"."users"
FOR EACH ROW EXECUTE FUNCTION "public"."enforce_signup_gate"();
