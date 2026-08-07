"use client";

import { useActionState } from "react";

import { emptyFormState } from "@/lib/forms";
import { SubmitButton } from "@/components/submit-button";
import { voteAction } from "@/modules/polls/actions";

type Option = { id: string; label: string };

export function VoteForm({
  pollId,
  options,
  myVote,
  isOpen,
}: {
  pollId: string;
  options: Option[];
  myVote: string | null;
  isOpen: boolean;
}) {
  const [state, action] = useActionState(voteAction, emptyFormState);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="pollId" value={pollId} />

      <fieldset disabled={!isOpen} className="space-y-2 disabled:opacity-70">
        {options.map((option) => (
          <label
            key={option.id}
            className="border-input has-[:checked]:border-primary has-[:checked]:bg-primary/5 flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm"
          >
            <input
              type="radio"
              name="optionId"
              value={option.id}
              defaultChecked={myVote === option.id}
              required
              className="accent-primary size-4"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>

      {state.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="text-sm text-emerald-500">{state.message}</p>
      ) : null}

      {isOpen ? (
        <SubmitButton>{myVote ? "Alterar voto" : "Votar"}</SubmitButton>
      ) : (
        <p className="text-muted-foreground text-sm">
          Esta enquete está encerrada.
        </p>
      )}
    </form>
  );
}
