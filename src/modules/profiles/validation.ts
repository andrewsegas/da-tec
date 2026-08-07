import { z } from "zod";

import { COURSES } from "./constants";
import { HANDLE_REGEX } from "./social";

const handleField = z
  .union([
    z.literal(""),
    z
      .string()
      .trim()
      .regex(HANDLE_REGEX, "Use apenas letras, números e . _ -"),
  ])
  .optional();

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Informe seu nome completo.")
    .max(120, "Nome muito longo."),
  course: z.enum(COURSES, { message: "Selecione um curso." }),
  period: z.coerce
    .number({ message: "Selecione um período." })
    .int()
    .min(1, "Período inválido.")
    .max(10, "Período inválido."),
  avatarUrl: z
    .union([z.url("URL inválida."), z.literal("")])
    .optional(),
  bio: z.string().trim().max(300, "A bio pode ter no máximo 300 caracteres.").optional(),
  github: handleField,
  linkedin: handleField,
  instagram: handleField,
});

export type ProfileInput = z.infer<typeof profileSchema>;
