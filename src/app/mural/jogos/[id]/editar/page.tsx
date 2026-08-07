import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

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
import { updateGameAction } from "@/modules/mural/actions";
import { getGame } from "@/modules/mural/queries";

export const metadata: Metadata = { title: "Editar jogo" };

export default async function EditarJogoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!isStaff(profile.role)) redirect("/mural");

  const game = await getGame(id);
  if (!game) notFound();

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
            <CardTitle>Editar jogo</CardTitle>
          </CardHeader>
          <CardContent>
            <GameForm
              action={updateGameAction}
              submitLabel="Salvar alterações"
              gameId={game.id}
              defaults={{
                modality: game.modality,
                opponent: game.opponent,
                location: game.location,
                startsAt: game.starts_at,
                status: game.status,
                homeScore: game.home_score,
                awayScore: game.away_score,
              }}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
