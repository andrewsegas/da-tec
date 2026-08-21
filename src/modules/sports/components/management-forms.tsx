"use client";

import { useActionState } from "react";

import { FieldError } from "@/components/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { emptyFormState } from "@/lib/forms";
import type { PersonSummary, SportRow } from "../types";
import {
  createSportAction,
  createTeamAction,
  createTryoutAction,
} from "../actions";

const selectClass =
  "border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none";

function Feedback({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  if (!error && !message) return null;
  return (
    <p
      role="status"
      className={`rounded-md border px-3 py-2 text-sm ${
        error
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
      }`}
    >
      {error ?? message}
    </p>
  );
}

export function CreateSportForm() {
  const [state, action] = useActionState(createSportAction, emptyFormState);
  return (
    <form action={action} className="space-y-4" noValidate>
      <Feedback error={state.error} message={state.message} />
      <div className="space-y-2">
        <Label htmlFor="sport-name">Modalidade</Label>
        <Input id="sport-name" name="name" placeholder="Ex.: Futsal" required />
        <FieldError messages={state.fieldErrors?.name} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sport-description">Descrição (opcional)</Label>
        <Textarea id="sport-description" name="description" rows={3} />
        <FieldError messages={state.fieldErrors?.description} />
      </div>
      <SubmitButton>Criar modalidade</SubmitButton>
    </form>
  );
}

export function CreateTeamForm({
  sports,
  staff,
}: {
  sports: Pick<SportRow, "id" | "name">[];
  staff: PersonSummary[];
}) {
  const [state, action] = useActionState(createTeamAction, emptyFormState);
  return (
    <form action={action} className="space-y-4" noValidate>
      <Feedback error={state.error} message={state.message} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="team-sport">Modalidade</Label>
          <select id="team-sport" name="sportId" className={selectClass} required>
            <option value="">Selecione</option>
            {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
          <FieldError messages={state.fieldErrors?.sportId} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="team-name">Nome da equipe</Label>
          <Input id="team-name" name="name" placeholder="Ex.: Futsal Tec" required />
          <FieldError messages={state.fieldErrors?.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="team-category">Categoria</Label>
          <Input
            id="team-category"
            name="category"
            placeholder="Masculino, feminino ou misto"
            required
          />
          <FieldError messages={state.fieldErrors?.category} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="team-season">Temporada</Label>
          <Input
            id="team-season"
            name="season"
            defaultValue={String(new Date().getFullYear())}
            required
          />
          <FieldError messages={state.fieldErrors?.season} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="team-responsible">Responsável do DA (opcional)</Label>
        <select id="team-responsible" name="responsibleId" className={selectClass}>
          <option value="">Sem responsável definido</option>
          {staff.map((person) => (
            <option key={person.id} value={person.id}>
              {person.full_name}
            </option>
          ))}
        </select>
        <FieldError messages={state.fieldErrors?.responsibleId} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="team-description">Descrição (opcional)</Label>
        <Textarea id="team-description" name="description" rows={3} />
      </div>
      <SubmitButton disabled={sports.length === 0}>Criar equipe</SubmitButton>
    </form>
  );
}

export function CreateTryoutForm({ sports }: { sports: SportRow[] }) {
  const [state, action] = useActionState(createTryoutAction, emptyFormState);
  const teams = sports.flatMap((sport) =>
    sport.teams.map((team) => ({
      id: team.id,
      label: `${sport.name} — ${team.name} (${team.category})`,
    })),
  );
  return (
    <form action={action} className="space-y-4" noValidate>
      <Feedback error={state.error} message={state.message} />
      <div className="space-y-2">
        <Label htmlFor="tryout-team">Equipe</Label>
        <select id="tryout-team" name="teamId" className={selectClass} required>
          <option value="">Selecione</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.label}
            </option>
          ))}
        </select>
        <FieldError messages={state.fieldErrors?.teamId} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tryout-title">Título</Label>
        <Input
          id="tryout-title"
          name="title"
          placeholder="Ex.: Peneira para os Jogos Universitários"
          required
        />
        <FieldError messages={state.fieldErrors?.title} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tryout-start">Data e hora</Label>
          <Input id="tryout-start" name="startsAt" type="datetime-local" required />
          <FieldError messages={state.fieldErrors?.startsAt} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tryout-deadline">Prazo de inscrição</Label>
          <Input
            id="tryout-deadline"
            name="registrationDeadline"
            type="datetime-local"
            required
          />
          <FieldError messages={state.fieldErrors?.registrationDeadline} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tryout-location">Local</Label>
          <Input id="tryout-location" name="location" required />
          <FieldError messages={state.fieldErrors?.location} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tryout-spots">Vagas previstas no elenco (opcional)</Label>
          <Input id="tryout-spots" name="maxSpots" type="number" min={1} max={500} />
          <FieldError messages={state.fieldErrors?.maxSpots} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="tryout-description">Orientações (opcional)</Label>
        <Textarea id="tryout-description" name="description" rows={3} />
      </div>
      <SubmitButton disabled={teams.length === 0}>Agendar peneira</SubmitButton>
    </form>
  );
}
