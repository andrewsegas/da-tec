import { z } from "zod";

import { localDateTimeToIso } from "@/lib/datetime";

export const newsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "O título precisa ter ao menos 3 caracteres.")
    .max(150, "Título muito longo."),
  content: z
    .string()
    .trim()
    .min(1, "Escreva o conteúdo da notícia.")
    .max(5000, "Conteúdo muito longo."),
});

export const gameSchema = z.object({
  teamId: z.union([z.uuid("Equipe inválida."), z.literal("")]).optional(),
  modality: z
    .string()
    .trim()
    .min(2, "Informe a modalidade.")
    .max(50, "Modalidade muito longa."),
  opponent: z
    .string()
    .trim()
    .min(1, "Informe o adversário.")
    .max(80, "Nome muito longo."),
  location: z.string().trim().max(120, "Local muito longo.").optional(),
  status: z.enum(["agendado", "encerrado"]),
  homeScore: z.number().int().min(0).max(999).nullable(),
  awayScore: z.number().int().min(0).max(999).nullable(),
});

export const eventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "O título precisa ter ao menos 3 caracteres.")
    .max(120, "Título muito longo."),
  description: z.string().trim().max(2000, "Descrição muito longa.").optional(),
  location: z.string().trim().max(120, "Local muito longo.").optional(),
});

/** Converte um input datetime-local (horário de Brasília) em ISO (ou null se vazio/inválido). */
export function parseDateTime(value: string | undefined | null): string | null {
  return localDateTimeToIso(value);
}
