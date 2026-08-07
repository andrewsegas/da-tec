import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppHeader } from "@/components/app-header";
import { getCurrentProfile } from "@/modules/profiles/queries";
import { isStaff } from "@/modules/profiles/types";
import {
  getMyVote,
  getPoll,
  getPollOptions,
  getPollVoteCounts,
} from "@/modules/polls/queries";
import { areResultsVisible, isPollOpen } from "@/modules/polls/types";
import {
  closePollAction,
  deletePollAction,
  reopenPollAction,
} from "@/modules/polls/actions";
import { VoteForm } from "@/modules/polls/components/vote-form";
import { PollResults } from "@/modules/polls/components/poll-results";

export const metadata: Metadata = { title: "Enquete" };

export default async function EnquetePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  const staff = isStaff(profile.role);

  const poll = await getPoll(id);
  if (!poll) notFound();

  const options = await getPollOptions(id);
  const open = isPollOpen(poll);
  const resultsVisible = areResultsVisible(poll, staff);
  const myVote = await getMyVote(id);
  const counts = resultsVisible ? await getPollVoteCounts(id) : {};
  const simpleOptions = options.map((o) => ({ id: o.id, label: o.label }));

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <Link
          href="/enquetes"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← Voltar às enquetes
        </Link>

        <div className="mt-4 mb-2 flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            {poll.question}
          </h1>
          <span
            className={`mt-1 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              open
                ? "bg-emerald-500/15 text-emerald-500"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {open ? "Aberta" : "Encerrada"}
          </span>
        </div>
        {poll.description ? (
          <p className="text-muted-foreground mb-2">{poll.description}</p>
        ) : null}
        {poll.closes_at ? (
          <p className="text-muted-foreground mb-6 text-sm">
            {open ? "Encerra" : "Encerrou"} em{" "}
            {new Date(poll.closes_at).toLocaleString("pt-BR")}
          </p>
        ) : null}

        <Card className="mt-4 mb-6">
          <CardContent className="p-6">
            <VoteForm
              pollId={poll.id}
              options={simpleOptions}
              myVote={myVote}
              isOpen={open}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            {resultsVisible ? (
              <PollResults
                pollId={poll.id}
                options={simpleOptions}
                initialCounts={counts}
              />
            ) : (
              <p className="text-muted-foreground text-sm">
                O resultado ficará visível quando a enquete encerrar.
              </p>
            )}
          </CardContent>
        </Card>

        {staff ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {open ? (
              <form action={closePollAction}>
                <input type="hidden" name="id" value={poll.id} />
                <Button type="submit" variant="outline" size="sm">
                  Encerrar
                </Button>
              </form>
            ) : (
              <form action={reopenPollAction}>
                <input type="hidden" name="id" value={poll.id} />
                <Button type="submit" variant="outline" size="sm">
                  Reabrir
                </Button>
              </form>
            )}
            <Button asChild variant="outline" size="sm">
              <Link href={`/enquetes/${poll.id}/editar`}>Editar</Link>
            </Button>
            <form action={deletePollAction}>
              <input type="hidden" name="id" value={poll.id} />
              <Button type="submit" variant="destructive" size="sm">
                Excluir
              </Button>
            </form>
          </div>
        ) : null}
      </main>
    </div>
  );
}
