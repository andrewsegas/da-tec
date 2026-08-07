import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Informe um e-mail válido."));

export const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Informe seu nome completo.")
    .max(120, "Nome muito longo."),
  email,
  password: z
    .string()
    .min(8, "A senha precisa ter ao menos 8 caracteres.")
    .max(72, "Senha muito longa."),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Informe a senha."),
});
export type SignInInput = z.infer<typeof signInSchema>;
