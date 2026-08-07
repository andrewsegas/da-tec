import { z } from "zod";

import { COURSES } from "./constants";

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
});

export type ProfileInput = z.infer<typeof profileSchema>;
