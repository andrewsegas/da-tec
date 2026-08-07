import type { UserRole } from "@/lib/constants";

/**
 * Linha da tabela `profiles` como retornada pelo Supabase (PostgREST usa
 * snake_case). Evita depender de tipos gerados. As mutações também usam estes
 * nomes de coluna.
 */
export type ProfileRow = {
  id: string;
  full_name: string;
  course: string | null;
  period: number | null;
  avatar_url: string | null;
  role: UserRole;
  onboarded_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Moderadores e admins têm acesso às ferramentas do DA. */
export function isStaff(role: UserRole): boolean {
  return role === "moderador" || role === "admin";
}

export const ROLE_LABELS: Record<UserRole, string> = {
  aluno: "Aluno",
  moderador: "Moderador",
  admin: "Administrador",
};
