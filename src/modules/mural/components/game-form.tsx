"use client";

import { useActionState } from "react";

import { toDateTimeLocalInput } from "@/lib/datetime";
import { emptyFormState, type FormState } from "@/lib/forms";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/field-error";
import { SubmitButton } from "@/components/submit-button";

const selectClass =
  "border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none";

type Defaults = {
  teamId?: string | null;
  modality?: string;
  opponent?: string;
  location?: string | null;
  startsAt?: string | null;
  status?: string;
  homeScore?: number | null;
  awayScore?: number | null;
};

export function GameForm({
  action,
  submitLabel,
  gameId,
  defaults,
  teams = [],
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  gameId?: string;
  defaults?: Defaults;
  teams?: { id: string; label: string }[];
}) {
  const [state, formAction] = useActionState(action, emptyFormState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {gameId ? <input type="hidden" name="id" value={gameId} /> : null}

      {state.error ? (
        <p
          role="alert"
          className="bg-destructive/10 text-destructive rounded-md border border-destructive/30 px-3 py-2 text-sm"
        >
          {state.error}
        </p>
      ) : null}

      {teams.length > 0 ? (
        <div className="space-y-2">
          <Label htmlFor="teamId">Equipe do DA (opcional)</Label>
          <select
            id="teamId"
            name="teamId"
            defaultValue={defaults?.teamId ?? ""}
            className={selectClass}
          >
            <option value="">Jogo sem equipe vinculada</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.label}
              </option>
            ))}
          </select>
          <FieldError messages={state.fieldErrors?.teamId} />
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="modality">Modalidade</Label>
          <Input
            id="modality"
            name="modality"
            placeholder="Ex.: Futsal"
            defaultValue={defaults?.modality ?? ""}
            required
          />
          <FieldError messages={state.fieldErrors?.modality} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="opponent">Adversário</Label>
          <Input
            id="opponent"
            name="opponent"
            defaultValue={defaults?.opponent ?? ""}
            required
          />
          <FieldError messages={state.fieldErrors?.opponent} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Local (opcional)</Label>
        <Input
          id="location"
          name="location"
          defaultValue={defaults?.location ?? ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startsAt">Data e hora</Label>
          <Input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            defaultValue={toDateTimeLocalInput(defaults?.startsAt)}
            required
          />
          <FieldError messages={state.fieldErrors?.startsAt} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Situação</Label>
          <select
            id="status"
            name="status"
            defaultValue={defaults?.status ?? "agendado"}
            className={selectClass}
          >
            <option value="agendado">Agendado</option>
            <option value="encerrado">Encerrado</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="homeScore">Placar Tec</Label>
          <Input
            id="homeScore"
            name="homeScore"
            type="number"
            min={0}
            inputMode="numeric"
            defaultValue={defaults?.homeScore ?? ""}
            placeholder="—"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="awayScore">Placar adversário</Label>
          <Input
            id="awayScore"
            name="awayScore"
            type="number"
            min={0}
            inputMode="numeric"
            defaultValue={defaults?.awayScore ?? ""}
            placeholder="—"
          />
        </div>
      </div>

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
