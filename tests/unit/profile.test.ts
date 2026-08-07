import { describe, it, expect } from "vitest";

import { profileSchema } from "@/modules/profiles/validation";
import {
  githubUrl,
  instagramUrl,
  linkedinUrl,
  normalizeHandle,
} from "@/modules/profiles/social";

const base = {
  fullName: "Fulano Tal",
  course: "Inteligência Artificial",
  period: "2",
  avatarUrl: "",
};

describe("profileSchema (bio + redes)", () => {
  it("aceita bio e handles válidos (com @)", () => {
    const r = profileSchema.safeParse({
      ...base,
      bio: "Oi, sou eu.",
      github: "@fulano",
      linkedin: "fulano-tal",
      instagram: "",
    });
    expect(r.success).toBe(true);
  });

  it("rejeita handle inválido", () => {
    expect(
      profileSchema.safeParse({ ...base, github: "não vale!" }).success,
    ).toBe(false);
  });

  it("rejeita bio acima de 300", () => {
    expect(
      profileSchema.safeParse({ ...base, bio: "a".repeat(301) }).success,
    ).toBe(false);
  });
});

describe("helpers de redes sociais", () => {
  it("normaliza handle removendo @ e vazio vira null", () => {
    expect(normalizeHandle("@fulano")).toBe("fulano");
    expect(normalizeHandle("   ")).toBeNull();
    expect(normalizeHandle(null)).toBeNull();
  });

  it("monta as URLs corretas", () => {
    expect(githubUrl("fulano")).toBe("https://github.com/fulano");
    expect(linkedinUrl("fulano")).toContain("/in/fulano");
    expect(instagramUrl("fulano")).toContain("instagram.com/fulano");
  });
});
