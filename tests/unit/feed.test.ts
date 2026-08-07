import { describe, it, expect } from "vitest";

import {
  createCommentSchema,
  createPostSchema,
} from "@/modules/feed/validation";

describe("createPostSchema", () => {
  it("aceita conteúdo válido e apara espaços", () => {
    const result = createPostSchema.safeParse({ content: "  Olá comunidade  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.content).toBe("Olá comunidade");
  });

  it("rejeita conteúdo vazio", () => {
    expect(createPostSchema.safeParse({ content: "   " }).success).toBe(false);
  });

  it("rejeita acima de 500 caracteres", () => {
    expect(
      createPostSchema.safeParse({ content: "a".repeat(501) }).success,
    ).toBe(false);
  });
});

describe("createCommentSchema", () => {
  it("aceita comentário válido", () => {
    expect(createCommentSchema.safeParse({ content: "top!" }).success).toBe(
      true,
    );
  });

  it("rejeita acima de 300 caracteres", () => {
    expect(
      createCommentSchema.safeParse({ content: "a".repeat(301) }).success,
    ).toBe(false);
  });
});
