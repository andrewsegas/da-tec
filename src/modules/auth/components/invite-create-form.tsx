"use client";

import { useActionState } from "react";

import { emptyFormState } from "@/lib/forms";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/field-error";
import { SubmitButton } from "@/components/submit-button";
import { createInviteAction } from "@/modules/auth/invites-actions";

export function InviteCreateForm() {
  const [state, action] = useActionState(createInviteAction, emptyFormState);

  return (
    <form action={action} className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="invite-email">E-mail a convidar</Label>
          <Input
            id="invite-email"
            name="email"
            type="email"
            placeholder="pessoa@exemplo.com"
            required
          />
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="invite-note">Nota (opcional)</Label>
          <Input id="invite-note" name="note" placeholder="Ex.: aluno intercâmbio" />
        </div>
        <SubmitButton>Convidar</SubmitButton>
      </div>

      <FieldError messages={state.fieldErrors?.email} />
      {state.error ? (
        <p className="text-destructive text-sm">{state.error}</p>
      ) : null}
      {state.ok && state.message ? (
        <p className="text-sm text-emerald-500">{state.message}</p>
      ) : null}
    </form>
  );
}
