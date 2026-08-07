"use client";

import { useActionState } from "react";

import { emptyFormState } from "@/lib/forms";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/field-error";
import { SubmitButton } from "@/components/submit-button";
import { saveProfileAction } from "@/modules/profiles/actions";
import { COURSES, PERIODS } from "@/modules/profiles/constants";

const selectClass =
  "border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

type Props = {
  intent: "onboarding" | "edit";
  submitLabel: string;
  showExtras?: boolean;
  defaultValues?: {
    fullName?: string;
    course?: string | null;
    period?: number | null;
    avatarUrl?: string | null;
    bio?: string | null;
    github?: string | null;
    linkedin?: string | null;
    instagram?: string | null;
  };
};

export function ProfileForm({
  intent,
  submitLabel,
  showExtras = false,
  defaultValues,
}: Props) {
  const [state, action] = useActionState(saveProfileAction, emptyFormState);

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="intent" value={intent} />

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
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          defaultValue={defaultValues?.fullName ?? ""}
          required
        />
        <FieldError messages={state.fieldErrors?.fullName} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="course">Curso</Label>
        <select
          id="course"
          name="course"
          defaultValue={defaultValues?.course ?? ""}
          required
          className={selectClass}
        >
          <option value="" disabled>
            Selecione seu curso
          </option>
          {COURSES.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>
        <FieldError messages={state.fieldErrors?.course} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="period">Período</Label>
        <select
          id="period"
          name="period"
          defaultValue={defaultValues?.period ?? ""}
          required
          className={selectClass}
        >
          <option value="" disabled>
            Selecione o período
          </option>
          {PERIODS.map((period) => (
            <option key={period} value={period}>
              {period}º
            </option>
          ))}
        </select>
        <FieldError messages={state.fieldErrors?.period} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatarUrl">Avatar (URL, opcional)</Label>
        <Input
          id="avatarUrl"
          name="avatarUrl"
          type="url"
          inputMode="url"
          placeholder="https://..."
          defaultValue={defaultValues?.avatarUrl ?? ""}
        />
        <FieldError messages={state.fieldErrors?.avatarUrl} />
      </div>

      {showExtras ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio (opcional)</Label>
            <Textarea
              id="bio"
              name="bio"
              rows={3}
              maxLength={300}
              placeholder="Conte um pouco sobre você, seus interesses, projetos..."
              defaultValue={defaultValues?.bio ?? ""}
            />
            <FieldError messages={state.fieldErrors?.bio} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                name="github"
                placeholder="usuario"
                defaultValue={defaultValues?.github ?? ""}
              />
              <FieldError messages={state.fieldErrors?.github} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                name="linkedin"
                placeholder="usuario"
                defaultValue={defaultValues?.linkedin ?? ""}
              />
              <FieldError messages={state.fieldErrors?.linkedin} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                name="instagram"
                placeholder="usuario"
                defaultValue={defaultValues?.instagram ?? ""}
              />
              <FieldError messages={state.fieldErrors?.instagram} />
            </div>
          </div>
        </>
      ) : null}

      <SubmitButton className="w-full">{submitLabel}</SubmitButton>
    </form>
  );
}
