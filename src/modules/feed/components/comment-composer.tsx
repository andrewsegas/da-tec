"use client";

import { useActionState } from "react";

import { emptyFormState } from "@/lib/forms";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/field-error";
import { SubmitButton } from "@/components/submit-button";
import { createCommentAction } from "@/modules/feed/actions";

export function CommentComposer({ postId }: { postId: string }) {
  const [state, action] = useActionState(createCommentAction, emptyFormState);

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="postId" value={postId} />
      <Textarea
        name="content"
        rows={2}
        maxLength={300}
        required
        placeholder="Escreva um comentário..."
      />
      <FieldError messages={state.fieldErrors?.content} />
      {state.error ? (
        <p className="text-destructive text-sm">{state.error}</p>
      ) : null}
      <div className="flex justify-end">
        <SubmitButton size="sm">Comentar</SubmitButton>
      </div>
    </form>
  );
}
