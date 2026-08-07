/** Handle de rede social: letras, números e `. _ -`, com `@` opcional. */
export const HANDLE_REGEX = /^@?[A-Za-z0-9._-]{1,39}$/;

/** Normaliza um handle: remove `@` do início e espaços; vazio vira null. */
export function normalizeHandle(value: string | null | undefined): string | null {
  const v = (value ?? "").trim().replace(/^@+/, "");
  return v.length > 0 ? v : null;
}

export function githubUrl(handle: string): string {
  return `https://github.com/${handle}`;
}

export function linkedinUrl(handle: string): string {
  return `https://www.linkedin.com/in/${handle}`;
}

export function instagramUrl(handle: string): string {
  return `https://instagram.com/${handle}`;
}
