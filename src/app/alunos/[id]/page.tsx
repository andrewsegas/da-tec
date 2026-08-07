import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/app-header";
import {
  getCurrentProfile,
  getProfileById,
} from "@/modules/profiles/queries";
import { ProfileView } from "@/modules/profiles/components/profile-view";

export const metadata: Metadata = { title: "Perfil" };

export default async function AlunoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const me = await getCurrentProfile();
  if (!me) redirect("/login");

  const profile = await getProfileById(id);
  if (!profile) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <ProfileView profile={profile} />
        {profile.id === me.id ? (
          <div className="mt-6">
            <Button asChild>
              <Link href="/perfil/editar">Editar perfil</Link>
            </Button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
