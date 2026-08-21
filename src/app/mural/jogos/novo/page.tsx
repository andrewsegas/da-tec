import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppHeader } from "@/components/app-header";
import { getCurrentProfile } from "@/modules/profiles/queries";
import { isStaff } from "@/modules/profiles/types";
import { GameForm } from "@/modules/mural/components/game-form";
import { createGameAction } from "@/modules/mural/actions";
import { listSports } from "@/modules/sports/queries";

export const metadata: Metadata = { title: "Novo jogo" };

export default async function NovoJogoPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!isStaff(profile.role)) redirect("/mural");
  const sports = await listSports(true);
  const teams = sports.flatMap((sport) =>
    sport.teams.map((team) => ({
      id: team.id,
      label: `${sport.name} — ${team.name} (${team.category})`,
    })),
  );

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <Link
          href="/mural"
          className="text-muted-foreground hover:text-foreground mb-4 inline-block text-sm"
        >
          ← Voltar ao mural
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Novo jogo</CardTitle>
          </CardHeader>
          <CardContent>
            <GameForm action={createGameAction} submitLabel="Criar jogo" teams={teams} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
