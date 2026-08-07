import { createClient } from "@/lib/supabase/server";
import type { InviteRow } from "./types";

/** Lista os convites (RLS libera apenas para moderadores/admins). */
export async function listInvites(): Promise<InviteRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invites")
    .select("*")
    .order("created_at", { ascending: false });

  return (data as InviteRow[] | null) ?? [];
}
