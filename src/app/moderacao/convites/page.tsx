import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentProfile } from "@/modules/profiles/queries";
import { isStaff } from "@/modules/profiles/types";
import { listInvites } from "@/modules/auth/invites-queries";
import { setInviteStatusAction } from "@/modules/auth/invites-actions";
import { INVITE_STATUS_LABELS, type InviteStatus } from "@/modules/auth/types";
import { InviteCreateForm } from "@/modules/auth/components/invite-create-form";

export const metadata: Metadata = { title: "Convites do DA" };

const statusClass: Record<InviteStatus, string> = {
  pendente: "bg-amber-500/15 text-amber-500",
  aprovado: "bg-emerald-500/15 text-emerald-500",
  rejeitado: "bg-destructive/15 text-destructive",
};

function StatusButton({
  id,
  status,
  children,
  variant,
}: {
  id: string;
  status: InviteStatus;
  children: React.ReactNode;
  variant?: "outline" | "destructive";
}) {
  return (
    <form action={setInviteStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" size="sm" variant={variant ?? "outline"}>
        {children}
      </Button>
    </form>
  );
}

export default async function ConvitesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!isStaff(profile.role)) redirect("/perfil");

  const invites = await listInvites();

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <Link
        href="/perfil"
        className="text-muted-foreground hover:text-foreground mb-4 inline-block text-sm"
      >
        ← Voltar ao perfil
      </Link>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Convites do DA</CardTitle>
          <CardDescription>
            Convide quem não tem e-mail institucional. O convite já entra como
            aprovado e libera o cadastro daquele e-mail.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteCreateForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Convites emitidos</CardTitle>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhum convite ainda.
            </p>
          ) : (
            <ul className="divide-border divide-y">
              {invites.map((invite) => (
                <li
                  key={invite.id}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{invite.email}</p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(invite.created_at).toLocaleDateString("pt-BR")}
                      {invite.note ? ` · ${invite.note}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass[invite.status]}`}
                    >
                      {INVITE_STATUS_LABELS[invite.status]}
                    </span>
                    {invite.status !== "aprovado" ? (
                      <StatusButton id={invite.id} status="aprovado">
                        Aprovar
                      </StatusButton>
                    ) : null}
                    {invite.status !== "rejeitado" ? (
                      <StatusButton
                        id={invite.id}
                        status="rejeitado"
                        variant="destructive"
                      >
                        Revogar
                      </StatusButton>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
