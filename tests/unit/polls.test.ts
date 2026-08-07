import { describe, it, expect } from "vitest";

import {
  areResultsVisible,
  isPollOpen,
} from "@/modules/polls/types";
import { parseClosesAt } from "@/modules/polls/validation";

const future = new Date(Date.now() + 3_600_000).toISOString();
const past = new Date(Date.now() - 3_600_000).toISOString();

describe("isPollOpen", () => {
  it("aberta sem prazo está aberta", () => {
    expect(isPollOpen({ status: "aberta", closes_at: null })).toBe(true);
  });
  it("aberta com prazo futuro está aberta", () => {
    expect(isPollOpen({ status: "aberta", closes_at: future })).toBe(true);
  });
  it("aberta com prazo vencido está fechada", () => {
    expect(isPollOpen({ status: "aberta", closes_at: past })).toBe(false);
  });
  it("encerrada está fechada", () => {
    expect(isPollOpen({ status: "encerrada", closes_at: null })).toBe(false);
  });
});

describe("areResultsVisible", () => {
  const open = { status: "aberta" as const, closes_at: null };

  it("resultado público é sempre visível", () => {
    expect(areResultsVisible({ ...open, hide_results: false }, false)).toBe(
      true,
    );
  });
  it("resultado oculto NÃO é visível para aluno enquanto aberta", () => {
    expect(areResultsVisible({ ...open, hide_results: true }, false)).toBe(
      false,
    );
  });
  it("resultado oculto é visível para staff", () => {
    expect(areResultsVisible({ ...open, hide_results: true }, true)).toBe(true);
  });
  it("resultado oculto fica visível após encerrar", () => {
    expect(
      areResultsVisible(
        { status: "encerrada", closes_at: null, hide_results: true },
        false,
      ),
    ).toBe(true);
  });
});

describe("parseClosesAt", () => {
  it("retorna null para vazio", () => {
    expect(parseClosesAt("")).toBeNull();
    expect(parseClosesAt(undefined)).toBeNull();
  });
  it("converte datetime-local em ISO", () => {
    const iso = parseClosesAt("2030-01-01T10:00");
    expect(iso).not.toBeNull();
    expect(new Date(iso as string).getFullYear()).toBe(2030);
  });
});
