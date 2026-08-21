"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { fieldErrorsFrom, type FormState } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import { isStaff } from "@/modules/profiles/types";
import {
  registrationReviewSchema,
  slugifySportName,
  sportSchema,
  teamSchema,
  toIsoDateTime,
  tryoutSchema,
} from "./validation";

const SPORTS_PATH = "/esportes";
const MANAGEMENT_PATH = "/moderacao/esportes";
const idSchema = z.uuid();

async function getActionContext(staffOnly = false) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (staffOnly) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    const role = (profile as { role?: "aluno" | "moderador" | "admin" } | null)
      ?.role;
    if (!role || !isStaff(role)) redirect(SPORTS_PATH);
  }

  return { supabase, user };
}

function revalidateSports(slug?: string) {
  revalidatePath(SPORTS_PATH);
  revalidatePath(MANAGEMENT_PATH);
  revalidatePath("/perfil");
  if (slug) revalidatePath(`${SPORTS_PATH}/${slug}`);
}

export async function createSportAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = sportSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? undefined,
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  const { supabase, user } = await getActionContext(true);
  const slug = slugifySportName(parsed.data.name);
  if (!slug) return { error: "Informe um nome válido para a modalidade." };

  const { error } = await supabase.from("sports").insert({
    name: parsed.data.name,
    slug,
    description: parsed.data.description ?? null,
    created_by: user.id,
  });
  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Essa modalidade já está cadastrada."
          : "Não foi possível criar a modalidade.",
    };
  }

  revalidateSports(slug);
  return { ok: true, message: "Modalidade criada com sucesso." };
}

export async function toggleSportActiveAction(
  formData: FormData,
): Promise<void> {
  const id = formData.get("id");
  const active = formData.get("active") === "true";
  if (typeof id !== "string" || !idSchema.safeParse(id).success) return;
  const { supabase } = await getActionContext(true);
  const { data } = await supabase
    .from("sports")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("slug")
    .maybeSingle();
  revalidateSports((data as { slug?: string } | null)?.slug);
}

export async function createTeamAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = teamSchema.safeParse({
    sportId: formData.get("sportId"),
    name: formData.get("name"),
    category: formData.get("category"),
    season: formData.get("season"),
    description: formData.get("description") ?? undefined,
    responsibleId: formData.get("responsibleId") ?? undefined,
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  const { supabase, user } = await getActionContext(true);
  const responsibleId = parsed.data.responsibleId || null;
  if (responsibleId) {
    const { data: responsible } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", responsibleId)
      .maybeSingle();
    const role = (responsible as { role?: "aluno" | "moderador" | "admin" } | null)
      ?.role;
    if (!role || !isStaff(role)) {
      return { error: "O responsável precisa fazer parte da diretoria do DA." };
    }
  }

  const { error } = await supabase.from("teams").insert({
    sport_id: parsed.data.sportId,
    name: parsed.data.name,
    category: parsed.data.category,
    season: parsed.data.season,
    description: parsed.data.description ?? null,
    responsible_id: responsibleId,
    created_by: user.id,
  });
  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Já existe uma equipe com esse nome e temporada."
          : "Não foi possível criar a equipe.",
    };
  }

  revalidateSports();
  return { ok: true, message: "Equipe criada com sucesso." };
}

export async function createTryoutAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = tryoutSchema.safeParse({
    teamId: formData.get("teamId"),
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    location: formData.get("location"),
    startsAt: formData.get("startsAt"),
    registrationDeadline: formData.get("registrationDeadline"),
    maxSpots: formData.get("maxSpots") ?? undefined,
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  const startsAt = toIsoDateTime(parsed.data.startsAt);
  const deadline = toIsoDateTime(parsed.data.registrationDeadline);
  if (!startsAt || !deadline) return { error: "Datas inválidas." };
  if (new Date(deadline).getTime() <= Date.now()) {
    return { error: "O prazo de inscrição precisa estar no futuro." };
  }

  const { supabase, user } = await getActionContext(true);
  const { error } = await supabase.from("tryouts").insert({
    team_id: parsed.data.teamId,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    location: parsed.data.location,
    starts_at: startsAt,
    registration_deadline: deadline,
    max_spots:
      typeof parsed.data.maxSpots === "number" ? parsed.data.maxSpots : null,
    created_by: user.id,
  });
  if (error) return { error: "Não foi possível agendar a peneira." };

  revalidateSports();
  return { ok: true, message: "Peneira agendada com sucesso." };
}

export async function setTeamStatusAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  const status = formData.get("status");
  if (
    typeof id !== "string" ||
    !idSchema.safeParse(id).success ||
    (status !== "recrutando" && status !== "formado" && status !== "inativo")
  ) {
    return;
  }
  const { supabase } = await getActionContext(true);
  await supabase
    .from("teams")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidateSports();
}

export async function setTryoutStatusAction(
  formData: FormData,
): Promise<void> {
  const id = formData.get("id");
  const status = formData.get("status");
  if (
    typeof id !== "string" ||
    !idSchema.safeParse(id).success ||
    (status !== "agendada" && status !== "encerrada" && status !== "cancelada")
  ) {
    return;
  }
  const { supabase } = await getActionContext(true);
  await supabase
    .from("tryouts")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidateSports();
}

export async function registerForTryoutAction(
  formData: FormData,
): Promise<void> {
  const tryoutId = formData.get("tryoutId");
  if (
    typeof tryoutId !== "string" ||
    !idSchema.safeParse(tryoutId).success
  ) {
    return;
  }
  const { supabase, user } = await getActionContext();
  await supabase.from("tryout_registrations").insert({
    tryout_id: tryoutId,
    user_id: user.id,
    status: "inscrito",
  });
  revalidateSports();
}

export async function withdrawTryoutRegistrationAction(
  formData: FormData,
): Promise<void> {
  const registrationId = formData.get("registrationId");
  if (
    typeof registrationId !== "string" ||
    !idSchema.safeParse(registrationId).success
  ) {
    return;
  }
  const { supabase, user } = await getActionContext();
  await supabase
    .from("tryout_registrations")
    .delete()
    .eq("id", registrationId)
    .eq("user_id", user.id)
    .eq("status", "inscrito");
  revalidateSports();
}

export async function reviewTryoutRegistrationAction(
  formData: FormData,
): Promise<void> {
  const parsed = registrationReviewSchema.safeParse({
    registrationId: formData.get("registrationId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;

  const { supabase } = await getActionContext(true);
  const { data: registration } = await supabase
    .from("tryout_registrations")
    .select("id, user_id, status, tryout_id")
    .eq("id", parsed.data.registrationId)
    .maybeSingle();
  const row = registration as {
    id: string;
    user_id: string;
    status: string;
    tryout_id: string;
  } | null;
  if (!row) return;

  const { data: tryout } = await supabase
    .from("tryouts")
    .select("team_id")
    .eq("id", row.tryout_id)
    .maybeSingle();
  const teamId = (tryout as { team_id?: string } | null)?.team_id;
  if (!teamId) return;

  const { error } = await supabase
    .from("tryout_registrations")
    .update({
      status: parsed.data.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);
  if (error) return;

  if (parsed.data.status === "aprovado") {
    const { error: memberError } = await supabase.from("team_members").upsert(
      {
        team_id: teamId,
        user_id: row.user_id,
        role: "atleta",
        active: true,
      },
      { onConflict: "team_id,user_id" },
    );
    if (memberError) {
      await supabase
        .from("tryout_registrations")
        .update({ status: row.status })
        .eq("id", row.id);
      return;
    }
  } else if (row.status === "aprovado") {
    await supabase
      .from("team_members")
      .delete()
      .eq("team_id", teamId)
      .eq("user_id", row.user_id);
  }

  revalidateSports();
}

export async function setTeamMemberRoleAction(
  formData: FormData,
): Promise<void> {
  const memberId = formData.get("memberId");
  const role = formData.get("role");
  if (
    typeof memberId !== "string" ||
    !idSchema.safeParse(memberId).success ||
    (role !== "atleta" && role !== "capitao" && role !== "tecnico")
  ) {
    return;
  }
  const { supabase } = await getActionContext(true);
  await supabase.from("team_members").update({ role }).eq("id", memberId);
  revalidateSports();
}

export async function removeTeamMemberAction(
  formData: FormData,
): Promise<void> {
  const memberId = formData.get("memberId");
  if (typeof memberId !== "string" || !idSchema.safeParse(memberId).success) {
    return;
  }
  const { supabase } = await getActionContext(true);
  await supabase.from("team_members").delete().eq("id", memberId);
  revalidateSports();
}
