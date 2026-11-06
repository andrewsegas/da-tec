import { describe, it, expect } from "vitest";

import {
  formatDateTime,
  localDateTimeToIso,
  parseLocalDateTime,
  toDateTimeLocalInput,
} from "@/lib/datetime";
import { parseClosesAt } from "@/modules/polls/validation";
import { parseDateTime } from "@/modules/mural/validation";
import { toIsoDateTime } from "@/modules/sports/validation";

// Brasília não tem horário de verão desde 2019: sempre UTC-3.
describe("parseLocalDateTime", () => {
  it("interpreta o input datetime-local no horário de Brasília", () => {
    expect(localDateTimeToIso("2026-11-20T19:00")).toBe(
      "2026-11-20T22:00:00.000Z",
    );
  });

  it("não depende do fuso do servidor (regressão: prazo da peneira)", () => {
    // Um pouco depois da meia-noite em Brasília ainda é "hoje" em UTC-3,
    // não 3 horas antes.
    expect(localDateTimeToIso("2026-10-23T00:30")).toBe(
      "2026-10-23T03:30:00.000Z",
    );
  });

  it("respeita horário de verão em outros fusos", () => {
    expect(localDateTimeToIso("2026-07-01T12:00", "Europe/Lisbon")).toBe(
      "2026-07-01T11:00:00.000Z",
    );
    expect(localDateTimeToIso("2026-01-01T12:00", "Europe/Lisbon")).toBe(
      "2026-01-01T12:00:00.000Z",
    );
  });

  it("aceita ISO com fuso explícito como está", () => {
    expect(localDateTimeToIso("2026-11-20T22:00:00.000Z")).toBe(
      "2026-11-20T22:00:00.000Z",
    );
  });

  it("retorna null para vazio ou inválido", () => {
    expect(parseLocalDateTime("")).toBeNull();
    expect(parseLocalDateTime(null)).toBeNull();
    expect(parseLocalDateTime("amanhã")).toBeNull();
  });
});

describe("toDateTimeLocalInput", () => {
  it("faz o caminho inverso para preencher formulários de edição", () => {
    expect(toDateTimeLocalInput("2026-11-20T22:00:00.000Z")).toBe(
      "2026-11-20T19:00",
    );
    expect(toDateTimeLocalInput(null)).toBe("");
  });
});

describe("formatDateTime", () => {
  it("exibe no horário de Brasília", () => {
    expect(
      formatDateTime("2026-11-20T22:00:00.000Z", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    ).toBe("19:00");
  });
});

describe("conversores dos módulos usam o horário de Brasília", () => {
  it("enquetes, mural e esportes", () => {
    const expected = "2026-11-20T22:00:00.000Z";
    expect(parseClosesAt("2026-11-20T19:00")).toBe(expected);
    expect(parseDateTime("2026-11-20T19:00")).toBe(expected);
    expect(toIsoDateTime("2026-11-20T19:00")).toBe(expected);
  });
});
