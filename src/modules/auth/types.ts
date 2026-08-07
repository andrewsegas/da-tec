/** Situação de um convite. */
export type InviteStatus = "pendente" | "aprovado" | "rejeitado";

/** Linha da tabela `invites` (snake_case, como o Supabase retorna). */
export type InviteRow = {
  id: string;
  email: string;
  status: InviteStatus;
  note: string | null;
  invited_by: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
};

export const INVITE_STATUS_LABELS: Record<InviteStatus, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
};
