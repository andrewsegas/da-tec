export type PollStatus = "aberta" | "encerrada";

/** Linha de `polls` (snake_case, como o Supabase retorna). */
export type PollRow = {
  id: string;
  question: string;
  description: string | null;
  status: PollStatus;
  hide_results: boolean;
  closes_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PollOptionRow = {
  id: string;
  poll_id: string;
  label: string;
  position: number;
  created_at: string;
};

/** Uma enquete está aberta se o status é 'aberta' e ainda não passou do prazo. */
export function isPollOpen(
  poll: Pick<PollRow, "status" | "closes_at">,
): boolean {
  if (poll.status !== "aberta") return false;
  if (poll.closes_at && new Date(poll.closes_at).getTime() <= Date.now()) {
    return false;
  }
  return true;
}

/** Resultado visível se não for oculto, ou se a enquete já fechou, ou p/ staff. */
export function areResultsVisible(
  poll: Pick<PollRow, "status" | "closes_at" | "hide_results">,
  isStaff: boolean,
): boolean {
  return !poll.hide_results || !isPollOpen(poll) || isStaff;
}
