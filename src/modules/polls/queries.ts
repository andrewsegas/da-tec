import { createClient } from "@/lib/supabase/server";
import type { PollOptionRow, PollRow } from "./types";

export async function listPolls(): Promise<PollRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("polls")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as PollRow[] | null) ?? [];
}

export async function getPoll(id: string): Promise<PollRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("polls")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as PollRow | null) ?? null;
}

export async function getPollOptions(
  pollId: string,
): Promise<PollOptionRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("poll_options")
    .select("*")
    .eq("poll_id", pollId)
    .order("position", { ascending: true });
  return (data as PollOptionRow[] | null) ?? [];
}

/**
 * Contagem de votos por opção. Respeita RLS: se o resultado estiver oculto e a
 * enquete aberta (para não-staff), retorna vazio.
 */
export async function getPollVoteCounts(
  pollId: string,
): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("poll_votes")
    .select("option_id")
    .eq("poll_id", pollId);

  const counts: Record<string, number> = {};
  for (const row of (data as { option_id: string }[] | null) ?? []) {
    counts[row.option_id] = (counts[row.option_id] ?? 0) + 1;
  }
  return counts;
}

/** Opção escolhida pelo usuário atual (ou null). */
export async function getMyVote(pollId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_my_vote", { p_poll_id: pollId });
  return typeof data === "string" ? data : null;
}
