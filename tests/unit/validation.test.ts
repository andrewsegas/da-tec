import { describe, it, expect } from "vitest";

import { signUpSchema } from "@/modules/auth/validation";
import { profileSchema } from "@/modules/profiles/validation";
import { fieldErrorsFrom } from "@/lib/forms";

describe("signUpSchema", () => {
  it("normaliza e-mail (trim + lowercase) e aceita dados válidos", () => {
    const result = signUpSchema.safeParse({
      fullName: "  Fulano de Tal  ",
      email: "  ALUNO@Unisanta.BR ",
      password: "senha1234",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("aluno@unisanta.br");
      expect(result.data.fullName).toBe("Fulano de Tal");
    }
  });

  it("rejeita senha curta e produz erro por campo", () => {
    const result = signUpSchema.safeParse({
      fullName: "Fulano",
      email: "aluno@unisanta.br",
      password: "123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = fieldErrorsFrom(result.error);
      expect(errors.password?.length).toBeGreaterThan(0);
    }
  });
});

describe("profileSchema", () => {
  it("coage o período para número e valida o curso", () => {
    const result = profileSchema.safeParse({
      fullName: "Aluna Exemplo",
      course: "Análise e Desenvolvimento de Sistemas",
      period: "3",
      avatarUrl: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.period).toBe(3);
    }
  });

  it("rejeita curso fora da lista e período inválido", () => {
    const result = profileSchema.safeParse({
      fullName: "Aluna Exemplo",
      course: "Curso Inexistente",
      period: "99",
      avatarUrl: "não-é-url",
    });
    expect(result.success).toBe(false);
  });
});
