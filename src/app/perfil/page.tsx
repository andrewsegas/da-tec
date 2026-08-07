import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOutAction } from "@/modules/auth/actions";
import { getCurrentProfile } from "@/modules/profiles/queries";
import { isStaff } from "@/modules/profiles/types";
import { ProfileView } from "@/modules/profiles/components/profile-view";

export const metadata: Metadata = { title: "Meu perfil" };

export default async function PerfilPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.onboarded_at) redirect("/onboarding");

  const staff = isStaff(profile.role);

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-border/60 border-b">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            da<span className="text-primary">-tec</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={signOutAction}>
              <Button type="submit" variant="outline" size="sm">
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <ProfileView profile={profile} />

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/perfil/editar">Editar perfil</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/alunos/${profile.id}`}>Ver perfil público</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/mural">Mural</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/enquetes">Enquetes</Link>
          </Button>
          {staff ? (
            <Button asChild variant="outline">
              <Link href="/moderacao/convites">Convites do DA</Link>
            </Button>
          ) : null}
        </div>
      </main>
    </div>
  );
}
