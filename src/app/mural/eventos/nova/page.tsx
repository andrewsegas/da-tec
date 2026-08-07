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
import { EventForm } from "@/modules/mural/components/event-form";

export const metadata: Metadata = { title: "Novo evento" };

export default async function NovoEventoPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!isStaff(profile.role)) redirect("/mural");

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
            <CardTitle>Novo evento</CardTitle>
          </CardHeader>
          <CardContent>
            <EventForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
