import { z } from "zod";

export const createInviteSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Informe um e-mail válido.")),
  note: z.string().trim().max(200, "Nota muito longa.").optional(),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>;
