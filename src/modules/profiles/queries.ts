import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "./types";

/** Perfil do usuário autenticado (respeita RLS). */
export async function getCurrentProfile(): Promise<ProfileRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (data as ProfileRow | null) ?? null;
}

/** Perfil público de um aluno pelo id. */
export async function getProfileById(id: string): Promise<ProfileRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return (data as ProfileRow | null) ?? null;
}
