"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { fieldErrorsFrom, type FormState } from "@/lib/forms";
import { createInviteSchema } from "./invites-validation";

const INVITES_PATH = "/moderacao/convites";

/** Moderador cria um convite já aprovado para um e-mail. */
export async function createInviteAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = createInviteSchema.safeParse({
    email: formData.get("email"),
    note: formData.get("note") ?? undefined,
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Entre novamente." };

  const { error } = await supabase.from("invites").insert({
    email: parsed.data.email,
    note: parsed.data.note && parsed.data.note.length > 0 ? parsed.data.note : null,
    status: "aprovado",
    invited_by: user.id,
    approved_by: user.id,
  });

  if (error) {
    return {
      error: "Não foi possível criar o convite (ação restrita a moderadores).",
    };
  }

  revalidatePath(INVITES_PATH);
  return { ok: true, message: `Convite criado para ${parsed.data.email}.` };
}

/** Aprova ou rejeita um convite existente. */
export async function setInviteStatusAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  const status = formData.get("status");
  if (
    typeof id !== "string" ||
    (status !== "aprovado" && status !== "rejeitado")
  ) {
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const patch: Record<string, unknown> = { status };
  if (status === "aprovado" && user) {
    patch.approved_by = user.id;
  }

  await supabase.from("invites").update(patch).eq("id", id);
  revalidatePath(INVITES_PATH);
}
