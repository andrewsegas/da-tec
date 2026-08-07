import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Newspaper, Trash2, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppHeader } from "@/components/app-header";
import { getCurrentProfile } from "@/modules/profiles/queries";
import { isStaff } from "@/modules/profiles/types";
import { listEvents, listGames, listNews } from "@/modules/mural/queries";
import {
  deleteEventAction,
  deleteGameAction,
  deleteNewsAction,
} from "@/modules/mural/actions";
import { RsvpButton } from "@/modules/mural/components/rsvp-button";

export const metadata: Metadata = { title: "Mural" };

function fmt(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DeleteButton({
  action,
  id,
  label,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        aria-label={label}
        className="text-muted-foreground hover:text-destructive size-8"
      >
        <Trash2 className="size-4" />
      </Button>
    </form>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  newHref,
  canCreate,
}: {
  icon: typeof Newspaper;
  title: string;
  newHref: string;
  canCreate: boolean;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        <Icon className="text-primary size-5" /> {title}
      </h2>
      {canCreate ? (
        <Button asChild size="sm" variant="outline">
          <Link href={newHref}>Novo</Link>
        </Button>
      ) : null}
    </div>
  );
}

export default async function MuralPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  const staff = isStaff(profile.role);

  const [news, games, events] = await Promise.all([
    listNews(),
    listGames(),
    listEvents(),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-10 px-6 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Mural</h1>

        {/* Notícias */}
        <section>
          <SectionHeader
            icon={Newspaper}
            title="Notícias"
            newHref="/mural/noticias/nova"
            canCreate={staff}
          />
          {news.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhuma notícia.</p>
          ) : (
            <ul className="space-y-3">
              {news.map((n) => (
                <li key={n.id}>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold">{n.title}</h3>
                        {staff ? (
                          <DeleteButton
                            action={deleteNewsAction}
                            id={n.id}
                            label="Excluir notícia"
                          />
                        ) : null}
                      </div>
                      <p className="text-muted-foreground mb-2 text-xs">
                        <Link
                          href={`/alunos/${n.author_id}`}
                          className="hover:underline"
                        >
                          {n.author?.full_name ?? "DA"}
                        </Link>{" "}
                        · {fmt(n.created_at)}
                      </p>
                      <p className="break-words whitespace-pre-wrap text-sm">
                        {n.content}
                      </p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Jogos */}
        <section>
          <SectionHeader
            icon={Trophy}
            title="Jogos e competições"
            newHref="/mural/jogos/novo"
            canCreate={staff}
          />
          {games.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum jogo.</p>
          ) : (
            <ul className="space-y-3">
              {games.map((g) => {
                const showScore =
                  g.status === "encerrado" &&
                  g.home_score !== null &&
                  g.away_score !== null;
                return (
                  <li key={g.id}>
                    <Card>
                      <CardContent className="flex items-center justify-between gap-3 p-4">
                        <div className="min-w-0">
                          <p className="font-semibold">
                            Tec{" "}
                            {showScore
                              ? `${g.home_score} × ${g.away_score}`
                              : "×"}{" "}
                            {g.opponent}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {g.modality} · {fmt(g.starts_at)}
                            {g.location ? ` · ${g.location}` : ""}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              g.status === "agendado"
                                ? "bg-emerald-500/15 text-emerald-500"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {g.status === "agendado" ? "Agendado" : "Encerrado"}
                          </span>
                          {staff ? (
                            <>
                              <Button asChild variant="ghost" size="sm">
                                <Link href={`/mural/jogos/${g.id}/editar`}>
                                  Editar
                                </Link>
                              </Button>
                              <DeleteButton
                                action={deleteGameAction}
                                id={g.id}
                                label="Excluir jogo"
                              />
                            </>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Eventos */}
        <section>
          <SectionHeader
            icon={CalendarDays}
            title="Eventos"
            newHref="/mural/eventos/nova"
            canCreate={staff}
          />
          {events.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum evento.</p>
          ) : (
            <ul className="space-y-3">
              {events.map((e) => (
                <li key={e.id}>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold">{e.title}</h3>
                        {staff ? (
                          <DeleteButton
                            action={deleteEventAction}
                            id={e.id}
                            label="Excluir evento"
                          />
                        ) : null}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {fmt(e.starts_at)}
                        {e.ends_at ? ` até ${fmt(e.ends_at)}` : ""}
                        {e.location ? ` · ${e.location}` : ""}
                      </p>
                      {e.description ? (
                        <p className="mt-2 break-words whitespace-pre-wrap text-sm">
                          {e.description}
                        </p>
                      ) : null}
                      <div className="mt-3">
                        <RsvpButton
                          eventId={e.id}
                          going={e.rsvpedByMe}
                          count={e.rsvpCount}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
