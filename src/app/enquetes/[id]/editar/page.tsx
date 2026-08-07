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
import { getPoll } from "@/modules/polls/queries";
import { PollEditForm } from "@/modules/polls/components/poll-edit-form";

export const metadata: Metadata = { title: "Editar enquete" };

export default async function EditarEnquetePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!isStaff(profile.role)) redirect(`/enquetes/${id}`);

  const poll = await getPoll(id);
  if (!poll) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <Link
          href={`/enquetes/${id}`}
          className="text-muted-foreground hover:text-foreground mb-4 inline-block text-sm"
        >
          ← Voltar à enquete
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Editar enquete</CardTitle>
          </CardHeader>
          <CardContent>
            <PollEditForm
              poll={{
                id: poll.id,
                question: poll.question,
                description: poll.description,
                hide_results: poll.hide_results,
                closes_at: poll.closes_at,
              }}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
