import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOutAction } from "@/modules/auth/actions";

/** Cabeçalho das áreas autenticadas. */
export function AppHeader() {
  return (
    <header className="border-border/60 border-b">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            da<span className="text-primary">-tec</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            <Link
              href="/mural"
              className="text-muted-foreground hover:text-foreground rounded-md px-2 py-1"
            >
              Mural
            </Link>
            <Link
              href="/comunidade"
              className="text-muted-foreground hover:text-foreground rounded-md px-2 py-1"
            >
              Comunidade
            </Link>
            <Link
              href="/enquetes"
              className="text-muted-foreground hover:text-foreground rounded-md px-2 py-1"
            >
              Enquetes
            </Link>
            <Link
              href="/esportes"
              className="text-muted-foreground hover:text-foreground rounded-md px-2 py-1"
            >
              Esportes
            </Link>
            <Link
              href="/perfil"
              className="text-muted-foreground hover:text-foreground rounded-md px-2 py-1"
            >
              Perfil
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm">
              Sair
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
