import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/modules/profiles/queries";
import { isStaff } from "@/modules/profiles/types";
import {
  removeTeamMemberAction,
  reviewTryoutRegistrationAction,
  setTeamMemberRoleAction,
  setTeamStatusAction,
  setTryoutStatusAction,
  toggleSportActiveAction,
} from "@/modules/sports/actions";
import {
  CreateSportForm,
  CreateTeamForm,
  CreateTryoutForm,
} from "@/modules/sports/components/management-forms";
import {
  listRegistrationsForManagement,
  listSports,
  listStaffProfiles,
} from "@/modules/sports/queries";
import {
  MEMBER_ROLE_LABELS,
  REGISTRATION_LABELS,
  type RegistrationStatus,
} from "@/modules/sports/types";

export const metadata: Metadata = { title: "Gestão de esportes" };

const selectClass =
  "border-input bg-background h-8 rounded-md border px-2 text-xs";

const reviewStatuses: RegistrationStatus[] = [
  "inscrito",
  "lista_espera",
  "aprovado",
  "nao_selecionado",
];

export default async function SportsManagementPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!isStaff(profile.role)) redirect("/esportes");

  const [sports, registrations, staff] = await Promise.all([
    listSports(true),
    listRegistrationsForManagement(),
    listStaffProfiles(),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Gestão de esportes</h1>
            <p className="text-muted-foreground mt-2">
              Organize modalidades, equipes, peneiras, inscrições e elencos.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/esportes">Ver área dos alunos</Link>
          </Button>
        </div>

        <section className="grid gap-5 lg:grid-cols-3">
          <Card>
            <CardHeader><CardTitle className="text-lg">Nova modalidade</CardTitle></CardHeader>
            <CardContent><CreateSportForm /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Nova equipe</CardTitle></CardHeader>
            <CardContent>
              <CreateTeamForm sports={sports} staff={staff} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Nova peneira</CardTitle></CardHeader>
            <CardContent><CreateTryoutForm sports={sports} /></CardContent>
          </Card>
        </section>

        <section className="mt-10">
          <h2 className="mb-5 text-xl font-semibold">Modalidades cadastradas</h2>
          {sports.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhuma modalidade cadastrada.</p>
          ) : (
            <div className="space-y-6">
              {sports.map((sport) => (
                <Card key={sport.id} className={!sport.active ? "opacity-70" : undefined}>
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <CardTitle>{sport.name}</CardTitle>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {sport.active ? "Visível aos alunos" : "Modalidade arquivada"}
                        </p>
                      </div>
                      <form action={toggleSportActiveAction}>
                        <input type="hidden" name="id" value={sport.id} />
                        <input type="hidden" name="active" value={String(!sport.active)} />
                        <Button type="submit" size="sm" variant="outline">
                          {sport.active ? "Arquivar" : "Reativar"}
                        </Button>
                      </form>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {sport.teams.length === 0 ? (
                      <p className="text-muted-foreground text-sm">Nenhuma equipe criada.</p>
                    ) : (
                      <div className="space-y-5">
                        {sport.teams.map((team) => (
                          <div key={team.id} className="rounded-lg border p-4">
                            <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold">{team.name}</h3>
                                <p className="text-muted-foreground text-xs">
                                  {team.category} · {team.season}
                                  {team.responsible
                                    ? ` · Responsável: ${team.responsible.full_name}`
                                    : ""}
                                </p>
                              </div>
                              <form action={setTeamStatusAction} className="flex gap-2">
                                <input type="hidden" name="id" value={team.id} />
                                <select
                                  name="status"
                                  defaultValue={team.status}
                                  className={selectClass}
                                  aria-label="Situação da equipe"
                                >
                                  <option value="recrutando">Recrutando</option>
                                  <option value="formado">Formado</option>
                                  <option value="inativo">Inativo</option>
                                </select>
                                <Button type="submit" size="sm" variant="outline">Salvar</Button>
                              </form>
                            </div>

                            <div className="grid gap-5 xl:grid-cols-2">
                              <div>
                                <h4 className="mb-2 text-sm font-medium">Peneiras e inscritos</h4>
                                {team.tryouts.length === 0 ? (
                                  <p className="text-muted-foreground text-xs">Nenhuma peneira.</p>
                                ) : (
                                  <div className="space-y-3">
                                    {team.tryouts.map((tryout) => {
                                      const applicants = registrations.filter(
                                        (registration) => registration.tryout_id === tryout.id,
                                      );
                                      return (
                                        <div key={tryout.id} className="bg-muted/30 rounded-md border p-3">
                                          <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div>
                                              <p className="text-sm font-medium">{tryout.title}</p>
                                              <p className="text-muted-foreground text-xs">
                                                {new Date(tryout.starts_at).toLocaleString("pt-BR")} ·{" "}
                                                {tryout.location}
                                              </p>
                                            </div>
                                            <form action={setTryoutStatusAction} className="flex gap-2">
                                              <input type="hidden" name="id" value={tryout.id} />
                                              <select
                                                name="status"
                                                defaultValue={tryout.status}
                                                className={selectClass}
                                                aria-label="Situação da peneira"
                                              >
                                                <option value="agendada">Agendada</option>
                                                <option value="encerrada">Encerrada</option>
                                                <option value="cancelada">Cancelada</option>
                                              </select>
                                              <Button type="submit" size="sm" variant="outline">Salvar</Button>
                                            </form>
                                          </div>
                                          <p className="text-muted-foreground mt-2 text-xs">
                                            {applicants.length} inscrição(ões)
                                          </p>
                                          {applicants.length > 0 ? (
                                            <ul className="mt-3 space-y-2">
                                              {applicants.map((applicant) => (
                                                <li
                                                  key={applicant.id}
                                                  className="flex flex-wrap items-center justify-between gap-2 rounded border bg-background p-2"
                                                >
                                                  <div>
                                                    <p className="text-xs font-medium">
                                                      {applicant.profile?.full_name ?? "Aluno"}
                                                    </p>
                                                    <p className="text-muted-foreground text-[11px]">
                                                      {applicant.profile?.course ?? "Curso não informado"}
                                                    </p>
                                                  </div>
                                                  <form
                                                    action={reviewTryoutRegistrationAction}
                                                    className="flex gap-2"
                                                  >
                                                    <input
                                                      type="hidden"
                                                      name="registrationId"
                                                      value={applicant.id}
                                                    />
                                                    <select
                                                      name="status"
                                                      defaultValue={applicant.status}
                                                      className={selectClass}
                                                      aria-label="Resultado da inscrição"
                                                    >
                                                      {reviewStatuses.map((status) => (
                                                        <option key={status} value={status}>
                                                          {REGISTRATION_LABELS[status]}
                                                        </option>
                                                      ))}
                                                    </select>
                                                    <Button type="submit" size="sm">Aplicar</Button>
                                                  </form>
                                                </li>
                                              ))}
                                            </ul>
                                          ) : null}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              <div>
                                <h4 className="mb-2 text-sm font-medium">Elenco oficial</h4>
                                {team.team_members.length === 0 ? (
                                  <p className="text-muted-foreground text-xs">
                                    Aprove uma inscrição para formar o elenco.
                                  </p>
                                ) : (
                                  <ul className="space-y-2">
                                    {team.team_members.map((member) => (
                                      <li
                                        key={member.id}
                                        className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2"
                                      >
                                        <div>
                                          <p className="text-xs font-medium">
                                            {member.profile?.full_name ?? "Aluno"}
                                          </p>
                                          <p className="text-muted-foreground text-[11px]">
                                            {MEMBER_ROLE_LABELS[member.role]}
                                          </p>
                                        </div>
                                        <div className="flex gap-2">
                                          <form action={setTeamMemberRoleAction} className="flex gap-2">
                                            <input type="hidden" name="memberId" value={member.id} />
                                            <select
                                              name="role"
                                              defaultValue={member.role}
                                              className={selectClass}
                                              aria-label="Função no elenco"
                                            >
                                              <option value="atleta">Atleta</option>
                                              <option value="capitao">Capitão</option>
                                              <option value="tecnico">Técnico</option>
                                            </select>
                                            <Button type="submit" size="sm" variant="outline">Salvar</Button>
                                          </form>
                                          <form action={removeTeamMemberAction}>
                                            <input type="hidden" name="memberId" value={member.id} />
                                            <Button type="submit" size="sm" variant="destructive">
                                              Remover
                                            </Button>
                                          </form>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
