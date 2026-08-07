"use client";

import { useActionState } from "react";

import { emptyFormState } from "@/lib/forms";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/field-error";
import { SubmitButton } from "@/components/submit-button";
import { createPostAction } from "@/modules/feed/actions";

export function PostComposer() {
  const [state, action] = useActionState(createPostAction, emptyFormState);

  return (
    <form action={action} className="space-y-2">
      <Textarea
        name="content"
        rows={3}
        maxLength={500}
        required
        placeholder="O que está rolando na comunidade Tec?"
      />
      <FieldError messages={state.fieldErrors?.content} />
      {state.error ? (
        <p className="text-destructive text-sm">{state.error}</p>
      ) : null}
      <div className="flex justify-end">
        <SubmitButton>Publicar</SubmitButton>
      </div>
    </form>
  );
}
