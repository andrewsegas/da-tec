import { afterEach, describe, expect, it, vi } from "vitest";

import {
  slugifySportName,
  sportSchema,
  teamSchema,
  tryoutSchema,
} from "@/modules/sports/validation";
import {
  isTryoutRegistrationOpen,
  type TryoutRow,
} from "@/modules/sports/types";

describe("sports validation", () => {
  it("normaliza o nome da modalidade em um slug estável", () => {
    expect(slugifySportName("  Vôlei de Praia  ")).toBe("volei-de-praia");
  });

  it("valida modalidade e equipe", () => {
    expect(
      sportSchema.safeParse({ name: "Futsal", description: "Equipe do DA" })
        .success,
    ).toBe(true);
    expect(
      teamSchema.safeParse({
        sportId: "2d58d0a5-1c5f-48b9-9b78-adc262def37b",
        name: "Futsal Tec",
        category: "Misto",
        season: "2026",
        responsibleId: "",
      }).success,
    ).toBe(true);
  });

  it("exige prazo de inscrição anterior à peneira", () => {
    const result = tryoutSchema.safeParse({
      teamId: "2d58d0a5-1c5f-48b9-9b78-adc262def37b",
      title: "Peneira universitária",
      location: "Ginásio",
      registrationDeadline: "2026-09-11T19:00",
      startsAt: "2026-09-10T19:00",
      maxSpots: "12",
    });
    expect(result.success).toBe(false);
  });
});

describe("isTryoutRegistrationOpen", () => {
  afterEach(() => vi.useRealTimers());

  it("só abre inscrições para peneira agendada antes do prazo", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-21T12:00:00Z"));
    const tryout: TryoutRow = {
      id: "tryout",
      team_id: "team",
      title: "Peneira",
      description: null,
      location: "Ginásio",
      starts_at: "2026-08-30T12:00:00Z",
      registration_deadline: "2026-08-28T12:00:00Z",
      max_spots: 12,
      status: "agendada",
      created_at: "2026-08-20T12:00:00Z",
    };

    expect(isTryoutRegistrationOpen(tryout)).toBe(true);
    expect(
      isTryoutRegistrationOpen({ ...tryout, status: "cancelada" }),
    ).toBe(false);
    expect(
      isTryoutRegistrationOpen({
        ...tryout,
        registration_deadline: "2026-08-20T12:00:00Z",
      }),
    ).toBe(false);
  });
});
