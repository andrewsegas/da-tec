"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { fieldErrorsFrom, type FormState } from "@/lib/forms";
import {
  createPollSchema,
  parseClosesAt,
  pollBaseSchema,
} from "./validation";

function readOptions(formData: FormData): string[] {
  return formData
    .getAll("option")
    .map((value) => String(value).trim())
    .filter((value) => value.length > 0);
}

export async function createPollAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = createPollSchema.safeParse({
    question: formData.get("question"),
    description: formData.get("description") ?? undefined,
    hideResults: formData.get("hideResults") === "on",
    closesAt: formData.get("closesAt") ?? undefined,
    options: readOptions(formData),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { question, description, hideResults, closesAt, options } = parsed.data;

  const { data: poll, error } = await supabase
    .from("polls")
    .insert({
      question,
      description: description && description.length > 0 ? description : null,
      hide_results: hideResults,
      closes_at: parseClosesAt(closesAt),
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !poll) {
    return { error: "Não foi possível criar a enquete (apenas moderadores)." };
  }

  const pollId = (poll as { id: string }).id;
  const { error: optionsError } = await supabase.from("poll_options").insert(
    options.map((label, index) => ({
      poll_id: pollId,
      label,
      position: index,
    })),
  );
  if (optionsError) {
    // Desfaz a enquete para não deixar enquete sem opções.
    await supabase.from("polls").delete().eq("id", pollId);
    return { error: "Não foi possível salvar as opções. Tente novamente." };
  }

  redirect(`/enquetes/${pollId}`);
}

export async function updatePollAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Enquete inválida." };

  const parsed = pollBaseSchema.safeParse({
    question: formData.get("question"),
    description: formData.get("description") ?? undefined,
    hideResults: formData.get("hideResults") === "on",
    closesAt: formData.get("closesAt") ?? undefined,
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("polls")
    .update({
      question: parsed.data.question,
      description:
        parsed.data.description && parsed.data.description.length > 0
          ? parsed.data.description
          : null,
      hide_results: parsed.data.hideResults,
      closes_at: parseClosesAt(parsed.data.closesAt),
    })
    .eq("id", id);

  if (error) {
    return { error: "Não foi possível salvar as alterações." };
  }

  revalidatePath(`/enquetes/${id}`);
  redirect(`/enquetes/${id}`);
}

async function setPollStatus(id: string, status: "aberta" | "encerrada") {
  const supabase = await createClient();
  await supabase.from("polls").update({ status }).eq("id", id);
  revalidatePath(`/enquetes/${id}`);
  revalidatePath("/enquetes");
}

export async function closePollAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (typeof id === "string") await setPollStatus(id, "encerrada");
}

export async function reopenPollAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (typeof id === "string") await setPollStatus(id, "aberta");
}

export async function deletePollAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (typeof id !== "string") return;
  const supabase = await createClient();
  await supabase.from("polls").delete().eq("id", id);
  redirect("/enquetes");
}

export async function voteAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const pollId = formData.get("pollId");
  const optionId = formData.get("optionId");
  if (typeof pollId !== "string" || typeof optionId !== "string") {
    return { error: "Selecione uma opção para votar." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("cast_vote", {
    p_poll_id: pollId,
    p_option_id: optionId,
  });

  if (error) {
    return { error: error.message || "Não foi possível registrar seu voto." };
  }

  revalidatePath(`/enquetes/${pollId}`);
  return { ok: true, message: "Voto registrado!" };
}
