/**
 * Datas e horas sempre no fuso da comunidade (Santos/SP).
 *
 * Por que isso existe: o `<input type="datetime-local">` manda só
 * "YYYY-MM-DDTHH:mm", sem fuso. Se o servidor fizer `new Date(valor)`, ele
 * interpreta no fuso DO SERVIDOR — em produção (Docker) é UTC, então "19:00"
 * virava 16:00 de Brasília e prazos fechavam 3 horas antes. O mesmo vale para
 * exibir: `toLocaleString` no servidor usa UTC se não passarmos `timeZone`.
 */
export const APP_TIME_ZONE = "America/Sao_Paulo";

const LOCAL_DATETIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

/** Partes de data/hora de um instante, vistas no fuso informado. */
function zonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

/** Diferença (ms) entre o relógio do fuso e o UTC naquele instante. */
function offsetMs(date: Date, timeZone: string): number {
  const p = zonedParts(date, timeZone);
  const asUtc = Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day),
    Number(p.hour),
    Number(p.minute),
    Number(p.second),
  );
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/**
 * Converte o valor de um input datetime-local ("2026-11-20T19:00") no instante
 * correspondente ao horário de Brasília. Valores com fuso explícito (ISO com
 * "Z" ou offset) são aceitos como estão. Retorna null se vazio/inválido.
 */
export function parseLocalDateTime(
  value: string | null | undefined,
  timeZone: string = APP_TIME_ZONE,
): Date | null {
  const trimmed = value?.trim() ?? "";
  if (trimmed === "") return null;

  const match = LOCAL_DATETIME.exec(trimmed);
  if (!match) {
    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const [, y, mo, d, h, mi, s] = match;
  const wallClock = Date.UTC(+y, +mo - 1, +d, +h, +mi, s ? +s : 0);
  // Primeiro chute com o offset do próprio horário; refaz se cair numa
  // transição de horário de verão (o offset do resultado pode ser outro).
  let instant = wallClock - offsetMs(new Date(wallClock), timeZone);
  const corrected = wallClock - offsetMs(new Date(instant), timeZone);
  if (corrected !== instant) instant = corrected;
  return new Date(instant);
}

/** Igual a `parseLocalDateTime`, mas já em ISO (formato que vai para o banco). */
export function localDateTimeToIso(
  value: string | null | undefined,
  timeZone: string = APP_TIME_ZONE,
): string | null {
  return parseLocalDateTime(value, timeZone)?.toISOString() ?? null;
}

/** ISO do banco → valor para preencher um input datetime-local (horário de Brasília). */
export function toDateTimeLocalInput(
  iso: string | null | undefined,
  timeZone: string = APP_TIME_ZONE,
): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const p = zonedParts(date, timeZone);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** Data e hora para exibir na UI, em pt-BR e no horário de Brasília. */
export function formatDateTime(
  iso: string,
  options: Intl.DateTimeFormatOptions = {},
): string {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: APP_TIME_ZONE,
    ...options,
  });
}

/** Só a data, em pt-BR e no horário de Brasília. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: APP_TIME_ZONE });
}
