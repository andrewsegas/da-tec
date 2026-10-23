import { z } from "zod";

import { localDateTimeToIso } from "@/lib/datetime";

export const pollBaseSchema = z.object({
  question: z
    .string()
    .trim()
    .min(5, "A pergunta precisa ter ao menos 5 caracteres.")
    .max(200, "Pergunta muito longa."),
  description: z.string().trim().max(1000, "Descrição muito longa.").optional(),
  hideResults: z.boolean(),
  // "YYYY-MM-DDTHH:mm" de um input datetime-local, ou vazio.
  closesAt: z.string().trim().optional(),
});

export const createPollSchema = pollBaseSchema.extend({
  options: z
    .array(z.string().trim().min(1).max(120))
    .min(2, "Adicione ao menos 2 opções.")
    .max(10, "No máximo 10 opções."),
});

export type CreatePollInput = z.infer<typeof createPollSchema>;
export type PollBaseInput = z.infer<typeof pollBaseSchema>;

/** Converte o valor de um input datetime-local (horário de Brasília) em ISO (ou null). */
export function parseClosesAt(value: string | undefined): string | null {
  return localDateTimeToIso(value);
}
