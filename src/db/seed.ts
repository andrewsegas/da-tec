/**
 * Seed do banco — dados de exemplo para desenvolvimento.
 *
 * Etapa 0 (Fundação): placeholder. Cada fase adiciona seus próprios dados de
 * exemplo (perfis, enquetes, petições…) reaproveitando os schemas dos módulos.
 * Rode com `npm run db:seed` (requer DATABASE_URL configurada).
 */
async function seed(): Promise<void> {
  console.info(
    "Nada para semear ainda — o seed real começa na Etapa 1 (perfis).",
  );
}

seed().catch((error) => {
  console.error("Falha ao rodar o seed:", error);
  process.exit(1);
});
