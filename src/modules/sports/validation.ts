import { z } from "zod";

import { localDateTimeToIso, parseLocalDateTime } from "@/lib/datetime";

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
    const startsAt = parseLocalDateTime(value.startsAt);
    const deadline = parseLocalDateTime(value.registrationDeadline);
    if (!startsAt) {
      ctx.addIssue({
        code: "custom",
        path: ["startsAt"],
        message: "Data da peneira inválida.",
      });
    }
    if (!deadline) {
      ctx.addIssue({
        code: "custom",
        path: ["registrationDeadline"],
        message: "Prazo de inscrição inválido.",
      });
    } else if (startsAt && deadline >= startsAt) {
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

/** Input datetime-local (horário de Brasília) → ISO para o banco. */
export function toIsoDateTime(value: string): string | null {
  return localDateTimeToIso(value);
}
