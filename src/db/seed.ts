/**
 * Seed do banco — usuários e convite de exemplo para desenvolvimento.
 *
 * Usa a service_role key (bypassa RLS) para criar usuários no Supabase Auth.
 * O trigger `handle_new_user` cria o perfil; aqui ajustamos papel/curso/período.
 * Rode com `npm run db:seed` (requer `supabase start` e `.env` preenchido).
 */
import "dotenv/config";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const domain = process.env.NEXT_PUBLIC_UNISANTA_EMAIL_DOMAIN ?? "unisanta.br";

if (!url || !serviceKey) {
  throw new Error(
    "Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env (veja `supabase status`).",
  );
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type SeedUser = {
  email: string;
  password: string;
  fullName: string;
  role: "aluno" | "moderador" | "admin";
  course: string;
  period: number;
};

const users: SeedUser[] = [
  {
    email: `admin@${domain}`,
    password: "senha123",
    fullName: "Ana Administradora",
    role: "admin",
    course: "Ciência da Computação",
    period: 8,
  },
  {
    email: `moderador@${domain}`,
    password: "senha123",
    fullName: "Marcos Moderador",
    role: "moderador",
    course: "Engenharia de Software",
    period: 6,
  },
  {
    email: `aluno@${domain}`,
    password: "senha123",
    fullName: "Alice Aluna",
    role: "aluno",
    course: "Jogos Digitais",
    period: 2,
  },
];

async function findUserId(client: SupabaseClient, email: string) {
  const { data } = await client.auth.admin.listUsers();
  return data.users.find((u) => u.email === email)?.id;
}

async function upsertUser(user: SeedUser): Promise<string> {
  const created = await admin.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { full_name: user.fullName },
  });

  let userId = created.data.user?.id;
  if (created.error) {
    userId = await findUserId(admin, user.email);
    if (!userId) throw created.error;
  }
  if (!userId) throw new Error(`Não foi possível obter o id de ${user.email}`);

  const { error } = await admin
    .from("profiles")
    .update({
      full_name: user.fullName,
      role: user.role,
      course: user.course,
      period: user.period,
      onboarded_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (error) throw error;

  console.info(`✓ ${user.role.padEnd(10)} ${user.email}`);
  return userId;
}

async function seedInvite(invitedBy: string) {
  const email = "convidado.exemplo@gmail.com";
  const { data: existing } = await admin
    .from("invites")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    console.info(`• convite já existe para ${email}`);
    return;
  }

  const { error } = await admin.from("invites").insert({
    email,
    status: "aprovado",
    note: "Convidado de exemplo (sem e-mail institucional).",
    invited_by: invitedBy,
    approved_by: invitedBy,
  });
  if (error) throw error;
  console.info(`✓ convite aprovado para ${email}`);
}

async function seed(): Promise<void> {
  console.info("Semeando dados de exemplo...\n");
  const ids: string[] = [];
  for (const user of users) {
    ids.push(await upsertUser(user));
  }
  await seedInvite(ids[0]);
  console.info("\nSenha de todos os usuários de exemplo: senha123");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Falha ao rodar o seed:", error);
    process.exit(1);
  });
