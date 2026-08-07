import type { ZodError } from "zod";

/** Estado retornado por Server Actions de formulário (para `useActionState`). */
export type FormState = {
  ok?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export const emptyFormState: FormState = {};

/**
 * Converte os erros de um ZodError em um mapa `campo -> mensagens`, de forma
 * independente da versão do Zod (não usa APIs marcadas como deprecated).
 */
export function fieldErrorsFrom(error: ZodError): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : "form";
    (result[key] ??= []).push(issue.message);
  }
  return result;
}
