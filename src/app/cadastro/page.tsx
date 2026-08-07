import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/modules/auth/components/auth-shell";
import { SignUpForm } from "@/modules/auth/components/sign-up-form";

export const metadata: Metadata = { title: "Criar conta" };

export default function CadastroPage() {
  return (
    <AuthShell
      title="Criar conta"
      description="Junte-se à comunidade Tec da Unisanta."
    >
      <SignUpForm />
      <p className="text-muted-foreground text-center text-sm">
        Já tem conta?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
