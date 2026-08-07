import Link from "next/link";
import {
  BarChart3,
  FileSignature,
  GraduationCap,
  Megaphone,
  UserCircle,
  Vote,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentProfile } from "@/modules/profiles/queries";

const REPO_URL = "https://github.com/unisanta-tec/da-tec";

const modules = [
  {
    icon: UserCircle,
    title: "Identidade e perfil",
    description:
      "Cadastro com e-mail institucional, perfil do aluno e papéis da comunidade.",
  },
  {
    icon: Vote,
    title: "Enquetes e votações",
    description:
      "Voto único por aluno, resultado em tempo real ou oculto até encerrar.",
  },
  {
    icon: FileSignature,
    title: "Abaixo-assinados",
    description:
      "Petições com meta de assinaturas e resposta oficial pública do DA.",
  },
  {
    icon: Megaphone,
    title: "Mural",
    description: "Notícias do DA, calendário de jogos e eventos com presença.",
  },
  {
    icon: GraduationCap,
    title: "Avaliação de disciplinas",
    description:
      "Rubrica estruturada e anônima, com agregados protegidos por k-anonimato.",
  },
  {
    icon: BarChart3,
    title: "Participação com dados",
    description:
      "Transparência e engajamento para dar voz aos alunos de Tecnologia.",
  },
];

export default async function Home() {
  const profile = await getCurrentProfile();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-border/60 border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight">
            da<span className="text-primary">-tec</span>
          </span>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href={REPO_URL}>Repositório</Link>
            </Button>
            {profile ? (
              <Button asChild variant="ghost" size="sm">
                <Link href="/enquetes">Enquetes</Link>
              </Button>
            ) : null}
            {profile ? (
              <Button asChild size="sm">
                <Link href="/perfil">Meu perfil</Link>
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link href="/login">Entrar</Link>
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6">
        <section className="flex flex-col items-start gap-6 py-20 sm:py-28">
          <span className="border-border bg-secondary/40 text-muted-foreground rounded-full border px-3 py-1 text-xs font-medium">
            Comunidade Tec Unisanta · open source
          </span>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            A plataforma que dá{" "}
            <span className="text-primary">voz, voto e participação</span> aos
            alunos de Tecnologia.
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
            Votar, assinar abaixo-assinados, acompanhar o mural do DA e avaliar
            disciplinas — reunindo a comunidade em um só lugar e servindo de
            ferramenta pedagógica construída pelos próprios alunos.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            {profile ? (
              <Button asChild size="lg">
                <Link href="/perfil">Ir para meu perfil</Link>
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link href="/cadastro">Participar da comunidade</Link>
              </Button>
            )}
            <Button asChild size="lg" variant="outline">
              <Link href="#modulos">Conhecer os módulos</Link>
            </Button>
          </div>
        </section>

        <section id="modulos" className="pb-24">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight">
            Módulos da Fase 1
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="border-border bg-card text-card-foreground rounded-lg border p-5 transition-colors hover:border-primary/50"
              >
                <div className="bg-primary/10 text-primary mb-4 flex size-10 items-center justify-center rounded-md">
                  <Icon className="size-5" />
                </div>
                <h3 className="mb-1 font-semibold">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-border/60 text-muted-foreground border-t">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm sm:flex-row">
          <span>Diretório Acadêmico de Tecnologia · Unisanta</span>
          <Link href={REPO_URL} className="hover:text-foreground">
            Código aberto no GitHub
          </Link>
        </div>
      </footer>
    </div>
  );
}
