"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { fieldErrorsFrom, type FormState } from "@/lib/forms";
import { eventSchema, gameSchema, newsSchema, parseDateTime } from "./validation";

const MURAL_PATH = "/mural";

function orNull(value: FormDataEntryValue | null): string | null {
  const s = typeof value === "string" ? value.trim() : "";
  return s.length > 0 ? s : null;
}

function scoreFrom(formData: FormData, name: string): number | null {
  const raw = formData.get(name);
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

// --- Notícias --------------------------------------------------------------

export async function createNewsAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = newsSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("news").insert({
    author_id: user.id,
    title: parsed.data.title,
    content: parsed.data.content,
  });
  if (error) {
    return { error: "Não foi possível publicar (apenas moderadores)." };
  }

  revalidatePath(MURAL_PATH);
  redirect(MURAL_PATH);
}

export async function deleteNewsAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (typeof id !== "string") return;
  const supabase = await createClient();
  await supabase.from("news").delete().eq("id", id);
  revalidatePath(MURAL_PATH);
}

// --- Jogos -----------------------------------------------------------------

function parseGame(formData: FormData) {
  const startsAt = parseDateTime(formData.get("startsAt") as string | null);
  const parsed = gameSchema.safeParse({
    teamId: formData.get("teamId") ?? undefined,
    modality: formData.get("modality"),
    opponent: formData.get("opponent"),
    location: formData.get("location") ?? undefined,
    status: formData.get("status"),
    homeScore: scoreFrom(formData, "homeScore"),
    awayScore: scoreFrom(formData, "awayScore"),
  });
  return { startsAt, parsed };
}

export async function createGameAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { startsAt, parsed } = parseGame(formData);
  if (!startsAt) return { fieldErrors: { startsAt: ["Informe uma data válida."] } };
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { teamId, modality, opponent, location, status, homeScore, awayScore } =
    parsed.data;
  const { error } = await supabase.from("games").insert({
    created_by: user.id,
    team_id: teamId || null,
    modality,
    opponent,
    location: location && location.length > 0 ? location : null,
    starts_at: startsAt,
    home_score: homeScore,
    away_score: awayScore,
    status,
  });
  if (error) {
    return { error: "Não foi possível criar o jogo (apenas moderadores)." };
  }

  revalidatePath(MURAL_PATH);
  redirect(MURAL_PATH);
}

export async function updateGameAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Jogo inválido." };

  const { startsAt, parsed } = parseGame(formData);
  if (!startsAt) return { fieldErrors: { startsAt: ["Informe uma data válida."] } };
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  const supabase = await createClient();
  const { teamId, modality, opponent, location, status, homeScore, awayScore } =
    parsed.data;
  const { error } = await supabase
    .from("games")
    .update({
      team_id: teamId || null,
      modality,
      opponent,
      location: location && location.length > 0 ? location : null,
      starts_at: startsAt,
      home_score: homeScore,
      away_score: awayScore,
      status,
    })
    .eq("id", id);
  if (error) return { error: "Não foi possível salvar o jogo." };

  revalidatePath(MURAL_PATH);
  redirect(MURAL_PATH);
}

export async function deleteGameAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (typeof id !== "string") return;
  const supabase = await createClient();
  await supabase.from("games").delete().eq("id", id);
  revalidatePath(MURAL_PATH);
}

// --- Eventos ---------------------------------------------------------------

export async function createEventAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const startsAt = parseDateTime(formData.get("startsAt") as string | null);
  if (!startsAt) return { fieldErrors: { startsAt: ["Informe uma data válida."] } };
  const endsAt = parseDateTime(formData.get("endsAt") as string | null);

  const parsed = eventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    location: formData.get("location") ?? undefined,
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("events").insert({
    created_by: user.id,
    title: parsed.data.title,
    description: orNull(formData.get("description")),
    location: orNull(formData.get("location")),
    starts_at: startsAt,
    ends_at: endsAt,
  });
  if (error) {
    return { error: "Não foi possível criar o evento (apenas moderadores)." };
  }

  revalidatePath(MURAL_PATH);
  redirect(MURAL_PATH);
}

export async function deleteEventAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (typeof id !== "string") return;
  const supabase = await createClient();
  await supabase.from("events").delete().eq("id", id);
  revalidatePath(MURAL_PATH);
}

export async function toggleRsvpAction(formData: FormData): Promise<void> {
  const eventId = formData.get("eventId");
  if (typeof eventId !== "string") return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("event_rsvps")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("event_rsvps")
      .delete()
      .eq("id", (existing as { id: string }).id);
  } else {
    await supabase
      .from("event_rsvps")
      .insert({ event_id: eventId, user_id: user.id });
  }

  revalidatePath(MURAL_PATH);
}
