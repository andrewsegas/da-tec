import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentProfile } from "@/modules/profiles/queries";
import { ProfileForm } from "@/modules/profiles/components/profile-form";

export const metadata: Metadata = { title: "Editar perfil" };

export default async function EditarPerfilPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col px-6 py-12">
      <Link
        href="/perfil"
        className="text-muted-foreground hover:text-foreground mb-4 text-sm"
      >
        ← Voltar ao perfil
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Editar perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            intent="edit"
            submitLabel="Salvar alterações"
            defaultValues={{
              fullName: profile.full_name,
              course: profile.course,
              period: profile.period,
              avatarUrl: profile.avatar_url,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
