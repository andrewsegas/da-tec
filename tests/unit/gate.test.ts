import { describe, it, expect } from "vitest";

import { isInstitutionalEmail } from "@/modules/auth/gate";

describe("isInstitutionalEmail", () => {
  it("aceita e-mail do domínio institucional (case-insensitive)", () => {
    expect(isInstitutionalEmail("aluno@unisanta.br", "unisanta.br")).toBe(true);
    expect(isInstitutionalEmail("Aluno@Unisanta.BR", "unisanta.br")).toBe(true);
  });

  it("aceita o domínio configurado com @ na frente", () => {
    expect(isInstitutionalEmail("x@unisanta.br", "@unisanta.br")).toBe(true);
  });

  it("rejeita outros domínios", () => {
    expect(isInstitutionalEmail("aluno@gmail.com", "unisanta.br")).toBe(false);
    expect(isInstitutionalEmail("aluno@sub.unisanta.br", "unisanta.br")).toBe(
      false,
    );
  });

  it("rejeita entradas malformadas", () => {
    expect(isInstitutionalEmail("sem-arroba", "unisanta.br")).toBe(false);
    expect(isInstitutionalEmail("", "unisanta.br")).toBe(false);
  });
});
