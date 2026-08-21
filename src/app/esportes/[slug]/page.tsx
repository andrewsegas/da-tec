import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CalendarDays, MapPin, Users } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/modules/profiles/queries";
import { isStaff } from "@/modules/profiles/types";
import {
  registerForTryoutAction,
  withdrawTryoutRegistrationAction,
} from "@/modules/sports/actions";
import {
  getMyTryoutRegistrations,
  getSportBySlug,
} from "@/modules/sports/queries";
import {
  isTryoutRegistrationOpen,
  MEMBER_ROLE_LABELS,
  REGISTRATION_LABELS,
} from "@/modules/sports/types";

export const metadata: Metadata = { title: "Modalidade esportiva" };

export default async function SportDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const [sport, registrations] = await Promise.all([
    getSportBySlug(slug),
    getMyTryoutRegistrations(profile.id),
  ]);
  if (!sport || (!sport.active && !isStaff(profile.role))) notFound();
  const registrationByTryout = new Map(
    registrations.map((registration) => [registration.tryout_id, registration]),
  );

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <Link href="/esportes" className="text-muted-foreground hover:text-foreground text-sm">
          ← Voltar aos esportes
        </Link>
        <div className="mt-5 mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">{sport.name}</h1>
          {sport.description ? (
            <p className="text-muted-foreground mt-2 max-w-2xl">{sport.description}</p>
          ) : null}
        </div>

        {sport.teams.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Ainda não há equipes publicadas para esta modalidade.
          </p>
        ) : (
          <div className="space-y-6">
            {sport.teams.map((team) => (
              <Card key={team.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle>{team.name}</CardTitle>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {team.category} · Temporada {team.season}
                      </p>
                    </div>
                    <span className="bg-secondary rounded-full px-2.5 py-1 text-xs capitalize">
                      {team.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {team.description ? (
                    <p className="text-muted-foreground text-sm">{team.description}</p>
                  ) : null}
                  {team.responsible ? (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Responsável do DA:</span>{" "}
                      {team.responsible.full_name}
                    </p>
                  ) : null}

                  <section>
                    <h3 className="mb-3 flex items-center gap-2 font-medium">
                      <CalendarDays className="size-4" /> Peneiras
                    </h3>
                    {team.tryouts.length === 0 ? (
                      <p className="text-muted-foreground text-sm">Nenhuma peneira agendada.</p>
                    ) : (
                      <div className="space-y-3">
                        {team.tryouts.map((tryout) => {
                          const registration = registrationByTryout.get(tryout.id);
                          const open = isTryoutRegistrationOpen(tryout);
                          return (
                            <div key={tryout.id} className="rounded-lg border p-4">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <p className="font-medium">{tryout.title}</p>
                                  <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
                                    <MapPin className="size-3.5" /> {tryout.location}
                                  </p>
                                  <p className="text-muted-foreground mt-1 text-xs">
                                    {new Date(tryout.starts_at).toLocaleString("pt-BR")}
                                  </p>
                                </div>
                                {registration ? (
                                  <span className="bg-primary/10 text-primary rounded-full px-2.5 py-1 text-xs">
                                    {REGISTRATION_LABELS[registration.status]}
                                  </span>
                                ) : null}
                              </div>
                              {tryout.description ? (
                                <p className="text-muted-foreground mt-3 text-sm">{tryout.description}</p>
                              ) : null}
                              <p className="text-muted-foreground mt-3 text-xs">
                                Inscrições até{" "}
                                {new Date(tryout.registration_deadline).toLocaleString("pt-BR")}
                                {tryout.max_spots ? ` · ${tryout.max_spots} vaga(s)` : ""}
                              </p>
                              <div className="mt-4">
                                {!registration && open ? (
                                  <form action={registerForTryoutAction}>
                                    <input type="hidden" name="tryoutId" value={tryout.id} />
                                    <Button type="submit" size="sm">Inscrever-se</Button>
                                  </form>
                                ) : registration?.status === "inscrito" && open ? (
                                  <form action={withdrawTryoutRegistrationAction}>
                                    <input
                                      type="hidden"
                                      name="registrationId"
                                      value={registration.id}
                                    />
                                    <Button type="submit" size="sm" variant="outline">
                                      Cancelar inscrição
                                    </Button>
                                  </form>
                                ) : !registration ? (
                                  <span className="text-muted-foreground text-xs">
                                    Inscrições encerradas
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  <section>
                    <h3 className="mb-3 flex items-center gap-2 font-medium">
                      <Users className="size-4" /> Elenco oficial
                    </h3>
                    {team.team_members.length === 0 ? (
                      <p className="text-muted-foreground text-sm">Elenco ainda não definido.</p>
                    ) : (
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {team.team_members.map((member) => (
                          <li key={member.id} className="rounded-md border px-3 py-2 text-sm">
                            <p className="font-medium">{member.profile?.full_name ?? "Aluno"}</p>
                            <p className="text-muted-foreground text-xs">
                              {MEMBER_ROLE_LABELS[member.role]}
                              {member.profile?.course ? ` · ${member.profile.course}` : ""}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
