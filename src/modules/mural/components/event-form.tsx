"use client";

import { useActionState } from "react";

import { emptyFormState } from "@/lib/forms";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/field-error";
import { SubmitButton } from "@/components/submit-button";
import { createEventAction } from "@/modules/mural/actions";

export function EventForm() {
  const [state, action] = useActionState(createEventAction, emptyFormState);

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
        <Label htmlFor="title">Título do evento</Label>
        <Input id="title" name="title" required />
        <FieldError messages={state.fieldErrors?.title} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Textarea id="description" name="description" rows={3} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Local (opcional)</Label>
        <Input id="location" name="location" placeholder="Ex.: Ginásio da Unisanta" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startsAt">Início</Label>
          <Input id="startsAt" name="startsAt" type="datetime-local" required />
          <FieldError messages={state.fieldErrors?.startsAt} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endsAt">Término (opcional)</Label>
          <Input id="endsAt" name="endsAt" type="datetime-local" />
        </div>
      </div>
      <SubmitButton>Criar evento</SubmitButton>
    </form>
  );
}
