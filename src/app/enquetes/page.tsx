import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppHeader } from "@/components/app-header";
import { getCurrentProfile } from "@/modules/profiles/queries";
import { isStaff } from "@/modules/profiles/types";
import { listPolls } from "@/modules/polls/queries";
import { isPollOpen } from "@/modules/polls/types";

export const metadata: Metadata = { title: "Enquetes" };

export default async function EnquetesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const staff = isStaff(profile.role);
  const polls = await listPolls();

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Enquetes</h1>
          {staff ? (
            <Button asChild>
              <Link href="/enquetes/nova">Nova enquete</Link>
            </Button>
          ) : null}
        </div>

        {polls.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nenhuma enquete por enquanto.
          </p>
        ) : (
          <ul className="space-y-3">
            {polls.map((poll) => {
              const open = isPollOpen(poll);
              return (
                <li key={poll.id}>
                  <Link href={`/enquetes/${poll.id}`}>
                    <Card className="hover:border-primary/50 transition-colors">
                      <CardContent className="flex items-center justify-between gap-4 p-5">
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {poll.question}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {new Date(poll.created_at).toLocaleDateString(
                              "pt-BR",
                            )}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            open
                              ? "bg-emerald-500/15 text-emerald-500"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {open ? "Aberta" : "Encerrada"}
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
