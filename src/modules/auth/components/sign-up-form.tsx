"use client";

import { useActionState } from "react";

import { emptyFormState } from "@/lib/forms";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/field-error";
import { SubmitButton } from "@/components/submit-button";
import { signUpAction } from "@/modules/auth/actions";

const DOMAIN =
  process.env.NEXT_PUBLIC_UNISANTA_EMAIL_DOMAIN ?? "unisanta.br";

export function SignUpForm() {
  const [state, action] = useActionState(signUpAction, emptyFormState);

  return (
    <form action={action} className="space-y-4" noValidate>
      {state.error ? (
        <p
          role="alert"
          className="bg-destructive/10 text-destructive rounded-md border border-destructive/30 px-3 py-2 text-sm"
        >
          {state.error}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="fullName">Nome completo</Label>
        <Input id="fullName" name="fullName" autoComplete="name" required />
        <FieldError messages={state.fieldErrors?.fullName} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail institucional</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={`voce@${DOMAIN}`}
          required
        />
        <FieldError messages={state.fieldErrors?.email} />
        <p className="text-muted-foreground text-xs">
          Use seu e-mail @{DOMAIN}. Sem e-mail institucional? Peça um convite ao
          DA.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
        <FieldError messages={state.fieldErrors?.password} />
      </div>

      <SubmitButton className="w-full">Criar conta</SubmitButton>
    </form>
  );
}
