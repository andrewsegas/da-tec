import { createClient } from "@/lib/supabase/server";
import type { EventRow, EventWithRsvp, GameRow, NewsRow } from "./types";

export async function listNews(): Promise<NewsRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("news")
    .select(
      "id, title, content, author_id, created_at, updated_at, author:profiles(full_name, avatar_url, role)",
    )
    .order("created_at", { ascending: false });
  return (data as unknown as NewsRow[] | null) ?? [];
}

export async function listGames(): Promise<GameRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("games")
    .select("*")
    .order("starts_at", { ascending: false });
  return (data as GameRow[] | null) ?? [];
}

export async function getGame(id: string): Promise<GameRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("games")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as GameRow | null) ?? null;
}

type RawEvent = EventRow & { event_rsvps: { count: number }[] };

export async function listEvents(): Promise<EventWithRsvp[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("events")
    .select("*, event_rsvps(count)")
    .order("starts_at", { ascending: true });

  const rows = (data as unknown as RawEvent[] | null) ?? [];

  let mine = new Set<string>();
  if (user && rows.length > 0) {
    const { data: r } = await supabase
      .from("event_rsvps")
      .select("event_id")
      .eq("user_id", user.id)
      .in(
        "event_id",
        rows.map((e) => e.id),
      );
    mine = new Set(((r as { event_id: string }[] | null) ?? []).map((x) => x.event_id));
  }

  return rows.map((row) => {
    const { event_rsvps: rsvps, ...rest } = row;
    return {
      ...rest,
      rsvpCount: rsvps[0]?.count ?? 0,
      rsvpedByMe: mine.has(row.id),
    };
  });
}
