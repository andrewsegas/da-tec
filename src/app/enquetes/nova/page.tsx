import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppHeader } from "@/components/app-header";
import { getCurrentProfile } from "@/modules/profiles/queries";
import { isStaff } from "@/modules/profiles/types";
import { PollCreateForm } from "@/modules/polls/components/poll-create-form";

export const metadata: Metadata = { title: "Nova enquete" };

export default async function NovaEnquetePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!isStaff(profile.role)) redirect("/enquetes");

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <Link
          href="/enquetes"
          className="text-muted-foreground hover:text-foreground mb-4 inline-block text-sm"
        >
          ← Voltar às enquetes
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Nova enquete</CardTitle>
            <CardDescription>
              Só moderadores criam enquetes. Cada aluno vota uma vez (pode
              alterar até encerrar).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PollCreateForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
