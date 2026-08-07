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
    course: "Sistemas de Informação",
    period: 8,
  },
  {
    email: `moderador@${domain}`,
    password: "senha123",
    fullName: "Marcos Moderador",
    role: "moderador",
    course: "Análise e Desenvolvimento de Sistemas",
    period: 6,
  },
  {
    email: `aluno@${domain}`,
    password: "senha123",
    fullName: "Alice Aluna",
    role: "aluno",
    course: "Inteligência Artificial",
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

async function seedPoll(createdBy: string) {
  const question = "Qual deve ser o nome oficial da plataforma?";
  const { data: existing } = await admin
    .from("polls")
    .select("id")
    .eq("question", question)
    .maybeSingle();
  if (existing) {
    console.info("• enquete de exemplo já existe");
    return;
  }

  const { data: poll, error } = await admin
    .from("polls")
    .insert({
      question,
      description: "Primeira votação simbólica da comunidade Tec.",
      hide_results: false,
      created_by: createdBy,
    })
    .select("id")
    .single();
  if (error || !poll) throw error ?? new Error("falha ao criar enquete");

  const pollId = (poll as { id: string }).id;
  const labels = ["da-tec", "TecUnisanta", "ComunidadeTec", "SantaTech"];
  const { error: optionsError } = await admin.from("poll_options").insert(
    labels.map((label, index) => ({
      poll_id: pollId,
      label,
      position: index,
    })),
  );
  if (optionsError) throw optionsError;
  console.info("✓ enquete de exemplo criada");
}

async function seedFeed(authorIds: string[]) {
  const [adminId, moderadorId, alunoId] = authorIds;
  const firstContent = "Bora usar a plataforma da comunidade Tec! 🎉";

  const { data: existing } = await admin
    .from("posts")
    .select("id")
    .eq("content", firstContent)
    .maybeSingle();
  if (existing) {
    console.info("• feed de exemplo já existe");
    return;
  }

  const { data: post, error } = await admin
    .from("posts")
    .insert({ author_id: alunoId, content: firstContent })
    .select("id")
    .single();
  if (error || !post) throw error ?? new Error("falha ao criar post");
  const postId = (post as { id: string }).id;

  await admin.from("posts").insert({
    author_id: moderadorId,
    content:
      "Bem-vindos ao mural da comunidade! Postem, comentem e curtam. 💙",
  });
  await admin.from("comments").insert({
    post_id: postId,
    author_id: moderadorId,
    content: "Boa! Conta pra gente o que você quer ver por aqui.",
  });
  await admin.from("post_likes").insert({ post_id: postId, user_id: adminId });

  console.info("✓ feed de exemplo criado");
}

async function seedMural(authorIds: string[]) {
  const [adminId, moderadorId] = authorIds;
  const title = "Bem-vindos ao mural do DA Tec!";

  const { data: existing } = await admin
    .from("news")
    .select("id")
    .eq("title", title)
    .maybeSingle();
  if (existing) {
    console.info("• mural de exemplo já existe");
    return;
  }

  const day = 86_400_000;
  await admin.from("news").insert({
    author_id: moderadorId,
    title,
    content:
      "Aqui você acompanha notícias, jogos e eventos da comunidade Tec. Fiquem ligados! 💙",
  });
  await admin.from("games").insert({
    created_by: moderadorId,
    modality: "Futsal",
    opponent: "Engenharia",
    location: "Ginásio da Unisanta",
    starts_at: new Date(Date.now() + 7 * day).toISOString(),
    status: "agendado",
  });
  await admin.from("events").insert({
    created_by: adminId,
    title: "Semana da Tecnologia",
    description: "Palestras, oficinas e networking dos cursos de Tecnologia.",
    location: "Bloco C",
    starts_at: new Date(Date.now() + 14 * day).toISOString(),
  });

  console.info("✓ mural de exemplo criado");
}

async function seed(): Promise<void> {
  console.info("Semeando dados de exemplo...\n");
  const ids: string[] = [];
  for (const user of users) {
    ids.push(await upsertUser(user));
  }
  await seedInvite(ids[0]);
  await seedPoll(ids[0]);
  await seedFeed(ids);
  await seedMural(ids);
  console.info("\nSenha de todos os usuários de exemplo: senha123");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Falha ao rodar o seed:", error);
    process.exit(1);
  });
