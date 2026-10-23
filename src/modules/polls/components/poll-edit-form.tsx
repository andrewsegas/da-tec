"use client";

import { useActionState } from "react";

import { toDateTimeLocalInput } from "@/lib/datetime";
import { emptyFormState } from "@/lib/forms";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/field-error";
import { SubmitButton } from "@/components/submit-button";
import { updatePollAction } from "@/modules/polls/actions";

type Props = {
  poll: {
    id: string;
    question: string;
    description: string | null;
    hide_results: boolean;
    closes_at: string | null;
  };
};

export function PollEditForm({ poll }: Props) {
  const [state, action] = useActionState(updatePollAction, emptyFormState);

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="id" value={poll.id} />

      {state.error ? (
        <p
          role="alert"
          className="bg-destructive/10 text-destructive rounded-md border border-destructive/30 px-3 py-2 text-sm"
        >
          {state.error}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="question">Pergunta</Label>
        <Input
          id="question"
          name="question"
          defaultValue={poll.question}
          required
        />
        <FieldError messages={state.fieldErrors?.question} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={poll.description ?? ""}
        />
      </div>

      <div className="flex items-start gap-2">
        <input
          id="hideResults"
          name="hideResults"
          type="checkbox"
          defaultChecked={poll.hide_results}
          className="accent-primary mt-1 size-4"
        />
        <Label htmlFor="hideResults" className="font-normal">
          Ocultar o resultado até a enquete encerrar
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="closesAt">Encerrar em (opcional)</Label>
        <Input
          id="closesAt"
          name="closesAt"
          type="datetime-local"
          defaultValue={toDateTimeLocalInput(poll.closes_at)}
        />
      </div>

      <SubmitButton>Salvar alterações</SubmitButton>
    </form>
  );
}
