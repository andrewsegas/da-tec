import { describe, it, expect } from "vitest";

import {
  eventSchema,
  gameSchema,
  newsSchema,
  parseDateTime,
} from "@/modules/mural/validation";

describe("newsSchema", () => {
  it("aceita notícia válida", () => {
    expect(
      newsSchema.safeParse({ title: "Aviso importante", content: "corpo" })
        .success,
    ).toBe(true);
  });
  it("rejeita título curto", () => {
    expect(newsSchema.safeParse({ title: "ab", content: "x" }).success).toBe(
      false,
    );
  });
});

describe("gameSchema", () => {
  it("aceita jogo agendado sem placar", () => {
    expect(
      gameSchema.safeParse({
        modality: "Futsal",
        opponent: "Engenharia",
        status: "agendado",
        homeScore: null,
        awayScore: null,
      }).success,
    ).toBe(true);
  });
  it("aceita jogo encerrado com placar", () => {
    const r = gameSchema.safeParse({
      modality: "Vôlei",
      opponent: "Medicina",
      status: "encerrado",
      homeScore: 3,
      awayScore: 1,
    });
    expect(r.success).toBe(true);
  });
  it("rejeita modalidade vazia", () => {
    expect(
      gameSchema.safeParse({
        modality: "",
        opponent: "x",
        status: "agendado",
        homeScore: null,
        awayScore: null,
      }).success,
    ).toBe(false);
  });
});

describe("eventSchema", () => {
  it("aceita evento válido", () => {
    expect(eventSchema.safeParse({ title: "Semana Tec" }).success).toBe(true);
  });
});

describe("parseDateTime", () => {
  it("retorna null para vazio", () => {
    expect(parseDateTime("")).toBeNull();
    expect(parseDateTime(null)).toBeNull();
  });
  it("converte datetime-local em ISO", () => {
    const iso = parseDateTime("2030-05-01T09:30");
    expect(iso).not.toBeNull();
    expect(new Date(iso as string).getFullYear()).toBe(2030);
  });
});
