import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentProfile } from "@/modules/profiles/queries";
import { ProfileForm } from "@/modules/profiles/components/profile-form";

export const metadata: Metadata = { title: "Complete seu perfil" };

export default async function OnboardingPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.onboarded_at) redirect("/perfil");

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Complete seu perfil</CardTitle>
          <CardDescription>
            Falta pouco! Conte seu curso e período para participar da comunidade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            intent="onboarding"
            submitLabel="Concluir cadastro"
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
