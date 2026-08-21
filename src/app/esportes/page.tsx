import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Shield, Users } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/modules/profiles/queries";
import { isStaff } from "@/modules/profiles/types";
import { getMyTryoutRegistrations, listSports } from "@/modules/sports/queries";
import { isTryoutRegistrationOpen } from "@/modules/sports/types";

export const metadata: Metadata = { title: "Esportes" };

export default async function EsportesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const [sports, registrations] = await Promise.all([
    listSports(),
    getMyTryoutRegistrations(profile.id),
  ]);
  const registeredTryouts = new Set(registrations.map((item) => item.tryout_id));
  const staff = isStaff(profile.role);

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Esportes do DA</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Encontre sua modalidade, conheça os times e inscreva-se nas próximas peneiras.
            </p>
          </div>
          {staff ? (
            <Button asChild>
              <Link href="/moderacao/esportes">Gerenciar esportes</Link>
            </Button>
          ) : null}
        </div>

        {sports.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <Shield className="text-muted-foreground mx-auto mb-3 size-9" />
              <p className="font-medium">Nenhuma modalidade cadastrada</p>
              <p className="text-muted-foreground mt-1 text-sm">
                A diretoria do DA publicará as modalidades disponíveis em breve.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {sports.map((sport) => {
              const tryouts = sport.teams.flatMap((team) => team.tryouts);
              const nextTryout = tryouts.find(isTryoutRegistrationOpen);
              const members = sport.teams.reduce(
                (total, team) => total + team.team_members.length,
                0,
              );
              return (
                <Link key={sport.id} href={`/esportes/${sport.slug}`}>
                  <Card className="hover:border-primary/50 h-full transition-colors">
                    <CardHeader>
                      <CardTitle>{sport.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-5 line-clamp-2 text-sm">
                        {sport.description ?? "Modalidade esportiva da comunidade Tec."}
                      </p>
                      <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
                        <span className="flex items-center gap-1.5">
                          <Users className="size-4" /> {sport.teams.length} equipe(s)
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Shield className="size-4" /> {members} integrante(s)
                        </span>
                      </div>
                      {nextTryout ? (
                        <div className="bg-primary/10 text-primary mt-4 rounded-md px-3 py-2 text-xs">
                          <span className="flex items-center gap-1.5 font-medium">
                            <CalendarDays className="size-4" />
                            {registeredTryouts.has(nextTryout.id)
                              ? "Você está inscrito"
                              : "Peneira com inscrições abertas"}
                          </span>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
