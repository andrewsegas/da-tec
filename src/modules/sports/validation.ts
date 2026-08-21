import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use no máximo ${max} caracteres.`)
    .optional()
    .transform((value) => value || undefined);

export const sportSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da modalidade.").max(60),
  description: optionalText(500),
});

export const teamSchema = z.object({
  sportId: z.uuid("Modalidade inválida."),
  name: z.string().trim().min(2, "Informe o nome da equipe.").max(80),
  category: z.string().trim().min(2, "Informe a categoria.").max(40),
  season: z.string().trim().min(2, "Informe a temporada.").max(30),
  description: optionalText(500),
  responsibleId: z
    .union([z.uuid("Responsável inválido."), z.literal("")])
    .optional(),
});

export const tryoutSchema = z
  .object({
    teamId: z.uuid("Equipe inválida."),
    title: z.string().trim().min(3, "Informe o título da peneira.").max(100),
    description: optionalText(1000),
    location: z.string().trim().min(2, "Informe o local.").max(120),
    startsAt: z.string().min(1, "Informe a data e hora."),
    registrationDeadline: z.string().min(1, "Informe o prazo de inscrição."),
    maxSpots: z
      .union([z.coerce.number().int().min(1).max(500), z.literal("")])
      .optional(),
  })
  .superRefine((value, ctx) => {
    const startsAt = new Date(value.startsAt);
    const deadline = new Date(value.registrationDeadline);
    if (Number.isNaN(startsAt.getTime())) {
      ctx.addIssue({
        code: "custom",
        path: ["startsAt"],
        message: "Data da peneira inválida.",
      });
    }
    if (Number.isNaN(deadline.getTime())) {
      ctx.addIssue({
        code: "custom",
        path: ["registrationDeadline"],
        message: "Prazo de inscrição inválido.",
      });
    } else if (!Number.isNaN(startsAt.getTime()) && deadline >= startsAt) {
      ctx.addIssue({
        code: "custom",
        path: ["registrationDeadline"],
        message: "O prazo deve terminar antes da peneira.",
      });
    }
  });

export const registrationReviewSchema = z.object({
  registrationId: z.uuid("Inscrição inválida."),
  status: z.enum([
    "inscrito",
    "lista_espera",
    "aprovado",
    "nao_selecionado",
  ]),
});

export function slugifySportName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function toIsoDateTime(value: string): string | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
