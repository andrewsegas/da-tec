import { z } from "zod";

/**
 * Validação das variáveis de ambiente com Zod.
 *
 * `parseEnv()` é uma função (não é executada na importação) para não quebrar o
 * `build` quando o ambiente ainda não tem segredos configurados. Chame-a onde
 * as variáveis forem realmente necessárias (ex.: criação de clients no servidor).
 */
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  DATABASE_URL: z.string().url(),
  // Domínio institucional permitido no cadastro (ver regras de negócio).
  NEXT_PUBLIC_UNISANTA_EMAIL_DOMAIN: z.string().min(1).default("unisanta.br"),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Variáveis de ambiente inválidas:\n${issues}`);
  }
  return result.data;
}
