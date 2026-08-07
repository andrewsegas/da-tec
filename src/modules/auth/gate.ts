/**
 * Gate de cadastro (regra de negócio): só e-mail institucional OU convite
 * aprovado. Esta função cobre a parte do domínio institucional — o convite é
 * verificado no banco. Mantida pura para ser facilmente testável.
 */
export function isInstitutionalEmail(email: string, domain: string): boolean {
  const emailDomain = email.trim().toLowerCase().split("@")[1] ?? "";
  const allowed = domain.trim().toLowerCase().replace(/^@/, "");
  return emailDomain !== "" && emailDomain === allowed;
}
