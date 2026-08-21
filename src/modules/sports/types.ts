export type TeamStatus = "recrutando" | "formado" | "inativo";
export type TryoutStatus = "agendada" | "encerrada" | "cancelada";
export type RegistrationStatus =
  | "inscrito"
  | "lista_espera"
  | "aprovado"
  | "nao_selecionado";
export type MemberRole = "atleta" | "capitao" | "tecnico";

export type PersonSummary = {
  id: string;
  full_name: string;
  course: string | null;
  avatar_url: string | null;
};

export type TryoutRow = {
  id: string;
  team_id: string;
  title: string;
  description: string | null;
  location: string;
  starts_at: string;
  registration_deadline: string;
  max_spots: number | null;
  status: TryoutStatus;
  created_at: string;
};

export type RegistrationRow = {
  id: string;
  tryout_id: string;
  user_id: string;
  status: RegistrationStatus;
  created_at: string;
  profile?: PersonSummary | null;
};

export type TeamMemberRow = {
  id: string;
  team_id: string;
  user_id: string;
  role: MemberRole;
  active: boolean;
  joined_at: string;
  profile: PersonSummary | null;
};

export type TeamRow = {
  id: string;
  sport_id: string;
  name: string;
  category: string;
  season: string;
  description: string | null;
  status: TeamStatus;
  responsible_id: string | null;
  responsible: PersonSummary | null;
  tryouts: TryoutRow[];
  team_members: TeamMemberRow[];
};

export type SportRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  created_at: string;
  teams: TeamRow[];
};

export const REGISTRATION_LABELS: Record<RegistrationStatus, string> = {
  inscrito: "Inscrito",
  lista_espera: "Lista de espera",
  aprovado: "Aprovado",
  nao_selecionado: "Não selecionado",
};

export const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
  atleta: "Atleta",
  capitao: "Capitão",
  tecnico: "Técnico",
};

export function isTryoutRegistrationOpen(tryout: TryoutRow): boolean {
  return (
    tryout.status === "agendada" &&
    new Date(tryout.registration_deadline).getTime() > Date.now()
  );
}
