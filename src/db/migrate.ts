/**
 * Aplica as migrations versionadas em `src/db/migrations/` usando o migrator
 * do drizzle-orm (mesma tabela `drizzle.__drizzle_migrations` do drizzle-kit).
 *
 * Usado no deploy (`docker compose run --rm migrate`), onde não queremos o
 * drizzle-kit inteiro — e ele às vezes trava sem aplicar nada.
 * Rode localmente com `npm run db:migrate:deploy`.
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "DATABASE_URL não definida. Configure o .env (veja .env.example).",
  );
}

const client = postgres(url, { max: 1, prepare: false, onnotice: () => {} });

async function run(): Promise<void> {
  await migrate(drizzle(client), { migrationsFolder: "./src/db/migrations" });
  console.info("✓ migrations aplicadas");
}

run()
  .then(() => client.end())
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Falha ao aplicar migrations:", error);
    process.exit(1);
  });
