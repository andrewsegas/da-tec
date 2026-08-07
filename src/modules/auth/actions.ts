"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { fieldErrorsFrom, type FormState } from "@/lib/forms";
import { isInstitutionalEmail } from "./gate";
import { signInSchema, signUpSchema } from "./validation";

const INSTITUTIONAL_DOMAIN =
  process.env.NEXT_PUBLIC_UNISANTA_EMAIL_DOMAIN ?? "unisanta.br";

/** Garante que o redirect é interno (evita open redirect). */
function safeRedirect(target: FormDataEntryValue | null): string {
  if (typeof target === "string" && target.startsWith("/") && !target.startsWith("//")) {
    return target;
  }
  return "/perfil";
}

export async function signUpAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const { fullName, email, password } = parsed.data;
  const supabase = await createClient();

  // Gate: e-mail institucional OU convite aprovado por um moderador.
  if (!isInstitutionalEmail(email, INSTITUTIONAL_DOMAIN)) {
    const { data } = await supabase.rpc("email_has_approved_invite", {
      p_email: email,
    });
    if (!data) {
      return {
        error: `Cadastro restrito: use seu e-mail @${INSTITUTIONAL_DOMAIN} ou peça um convite ao DA.`,
      };
    }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    const alreadyRegistered = /registered|already/i.test(error.message);
    return {
      error: alreadyRegistered
        ? "Este e-mail já possui cadastro. Faça login."
        : "Não foi possível concluir o cadastro. Tente novamente.",
    };
  }

  redirect("/onboarding");
}

export async function signInAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "E-mail ou senha inválidos." };
  }

  redirect(safeRedirect(formData.get("redirect")));
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
