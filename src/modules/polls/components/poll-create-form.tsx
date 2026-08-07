"use client";

import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";

import { emptyFormState } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/field-error";
import { SubmitButton } from "@/components/submit-button";
import { createPollAction } from "@/modules/polls/actions";

export function PollCreateForm() {
  const [state, action] = useActionState(createPollAction, emptyFormState);
  const [options, setOptions] = useState<string[]>(["", ""]);

  const updateOption = (index: number, value: string) =>
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  const addOption = () =>
    setOptions((prev) => (prev.length < 10 ? [...prev, ""] : prev));
  const removeOption = (index: number) =>
    setOptions((prev) =>
      prev.length > 2 ? prev.filter((_, i) => i !== index) : prev,
    );

  return (
    <form action={action} className="space-y-5" noValidate>
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
        <Input id="question" name="question" required />
        <FieldError messages={state.fieldErrors?.question} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Textarea id="description" name="description" rows={3} />
        <FieldError messages={state.fieldErrors?.description} />
      </div>

      <div className="space-y-2">
        <Label>Opções</Label>
        <div className="space-y-2">
          {options.map((value, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                name="option"
                value={value}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Opção ${index + 1}`}
                required
              />
              {options.length > 2 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remover opção ${index + 1}`}
                  onClick={() => removeOption(index)}
                >
                  <X />
                </Button>
              ) : null}
            </div>
          ))}
        </div>
        {options.length < 10 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
          >
            <Plus /> Adicionar opção
          </Button>
        ) : null}
        <FieldError messages={state.fieldErrors?.options} />
      </div>

      <div className="flex items-start gap-2">
        <input
          id="hideResults"
          name="hideResults"
          type="checkbox"
          className="accent-primary mt-1 size-4"
        />
        <Label htmlFor="hideResults" className="font-normal">
          Ocultar o resultado até a enquete encerrar
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="closesAt">Encerrar em (opcional)</Label>
        <Input id="closesAt" name="closesAt" type="datetime-local" />
        <FieldError messages={state.fieldErrors?.closesAt} />
      </div>

      <SubmitButton>Criar enquete</SubmitButton>
    </form>
  );
}
