import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/modules/auth/components/auth-shell";
import { SignInForm } from "@/modules/auth/components/sign-in-form";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const redirectTo =
    typeof params.redirect === "string" ? params.redirect : undefined;

  return (
    <AuthShell title="Entrar" description="Acesse sua conta da comunidade.">
      <SignInForm redirectTo={redirectTo} />
      <p className="text-muted-foreground text-center text-sm">
        Não tem conta?{" "}
        <Link href="/cadastro" className="text-primary hover:underline">
          Criar conta
        </Link>
      </p>
    </AuthShell>
  );
}
