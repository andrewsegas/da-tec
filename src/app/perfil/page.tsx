import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOutAction } from "@/modules/auth/actions";
import { getCurrentProfile } from "@/modules/profiles/queries";
import { isStaff, ROLE_LABELS } from "@/modules/profiles/types";

export const metadata: Metadata = { title: "Meu perfil" };

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

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
        <Card>
          <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
            <div className="bg-primary/10 text-primary flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full text-2xl font-semibold">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={`Avatar de ${profile.full_name}`}
                  className="size-full object-cover"
                />
              ) : (
                initials(profile.full_name)
              )}
            </div>

            <div className="flex flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {profile.full_name}
                </h1>
                <span className="bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium">
                  {staff ? <ShieldCheck className="size-3" /> : null}
                  {ROLE_LABELS[profile.role]}
                </span>
              </div>
              <p className="text-muted-foreground">
                {profile.course}
                {profile.period ? ` · ${profile.period}º período` : ""}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/perfil/editar">Editar perfil</Link>
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
