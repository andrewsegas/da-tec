import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/modules/profiles/types";
import type {
  PersonSummary,
  RegistrationRow,
  SportRow,
  TeamMemberRow,
  TeamRow,
  TryoutRow,
} from "./types";

type TeamBase = Omit<TeamRow, "tryouts" | "team_members">;

export async function listSports(includeInactive = false): Promise<SportRow[]> {
  const supabase = await createClient();
  let sportsQuery = supabase.from("sports").select("*").order("name");
  if (!includeInactive) sportsQuery = sportsQuery.eq("active", true);

  const { data: sportData } = await sportsQuery;
  const sportRows = (sportData as Omit<SportRow, "teams">[] | null) ?? [];
  if (sportRows.length === 0) return [];

  const { data: teamData } = await supabase
    .from("teams")
    .select(
      "*, responsible:profiles!teams_responsible_id_profiles_id_fk(id, full_name, course, avatar_url)",
    )
    .in(
      "sport_id",
      sportRows.map((sport) => sport.id),
    )
    .order("name");
  const allTeams = (teamData as unknown as TeamBase[] | null) ?? [];
  const teams = includeInactive
    ? allTeams
    : allTeams.filter((team) => team.status !== "inativo");
  const teamIds = teams.map((team) => team.id);

  let tryouts: TryoutRow[] = [];
  let members: TeamMemberRow[] = [];
  if (teamIds.length > 0) {
    const [{ data: tryoutData }, { data: memberData }] = await Promise.all([
      supabase
        .from("tryouts")
        .select("*")
        .in("team_id", teamIds)
        .order("starts_at", { ascending: true }),
      supabase
        .from("team_members")
        .select(
          "*, profile:profiles!team_members_user_id_profiles_id_fk(id, full_name, course, avatar_url)",
        )
        .in("team_id", teamIds)
        .eq("active", true)
        .order("joined_at", { ascending: true }),
    ]);
    tryouts = (tryoutData as TryoutRow[] | null) ?? [];
    members = (memberData as unknown as TeamMemberRow[] | null) ?? [];
  }

  return sportRows.map((sport) => ({
    ...sport,
    teams: teams
      .filter((team) => team.sport_id === sport.id)
      .map((team) => ({
        ...team,
        tryouts: tryouts.filter((tryout) => tryout.team_id === team.id),
        team_members: members.filter((member) => member.team_id === team.id),
      })),
  }));
}

export async function getSportBySlug(slug: string): Promise<SportRow | null> {
  const sports = await listSports(true);
  return sports.find((sport) => sport.slug === slug) ?? null;
}

export async function getMyTryoutRegistrations(
  userId: string,
): Promise<RegistrationRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tryout_registrations")
    .select("id, tryout_id, user_id, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data as RegistrationRow[] | null) ?? [];
}

export type MySportRegistration = RegistrationRow & {
  tryout: (TryoutRow & {
    team: {
      id: string;
      name: string;
      category: string;
      sport: { id: string; name: string; slug: string } | null;
    } | null;
  }) | null;
};

export type MyTeamMembership = {
  id: string;
  role: "atleta" | "capitao" | "tecnico";
  joined_at: string;
  team: {
    id: string;
    name: string;
    category: string;
    sport: { id: string; name: string; slug: string } | null;
  } | null;
};

export async function getMySports(userId: string): Promise<{
  registrations: MySportRegistration[];
  memberships: MyTeamMembership[];
}> {
  const supabase = await createClient();
  const [registrationResult, memberResult] = await Promise.all([
    supabase
      .from("tryout_registrations")
      .select(
        "id, tryout_id, user_id, status, created_at, tryout:tryouts(*, team:teams(id, name, category, sport:sports(id, name, slug)))",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("team_members")
      .select(
        "id, role, joined_at, team:teams(id, name, category, sport:sports(id, name, slug))",
      )
      .eq("user_id", userId)
      .eq("active", true)
      .order("joined_at", { ascending: false }),
  ]);

  return {
    registrations:
      (registrationResult.data as unknown as MySportRegistration[] | null) ??
      [],
    memberships:
      (memberResult.data as unknown as MyTeamMembership[] | null) ?? [],
  };
}

export async function listRegistrationsForManagement(): Promise<
  RegistrationRow[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tryout_registrations")
    .select(
      "id, tryout_id, user_id, status, created_at, profile:profiles!tryout_registrations_user_id_profiles_id_fk(id, full_name, course, avatar_url)",
    )
    .order("created_at", { ascending: true });
  return (data as unknown as RegistrationRow[] | null) ?? [];
}

export async function listStaffProfiles(): Promise<PersonSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, course, avatar_url")
    .in("role", ["moderador", "admin"])
    .order("full_name");
  return (data as PersonSummary[] | null) ?? [];
}

export async function getProfileForSports(
  userId: string,
): Promise<ProfileRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return (data as ProfileRow | null) ?? null;
}
