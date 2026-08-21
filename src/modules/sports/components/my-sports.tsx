import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  MySportRegistration,
  MyTeamMembership,
} from "../queries";
import { MEMBER_ROLE_LABELS, REGISTRATION_LABELS } from "../types";

export function MySports({
  registrations,
  memberships,
}: {
  registrations: MySportRegistration[];
  memberships: MyTeamMembership[];
}) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Meus esportes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {memberships.length === 0 && registrations.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Você ainda não participa de uma equipe ou peneira. Veja as{" "}
            <Link href="/esportes" className="text-primary hover:underline">
              modalidades disponíveis
            </Link>
            .
          </p>
        ) : null}

        {memberships.length > 0 ? (
          <div>
            <h3 className="mb-2 text-sm font-medium">Equipes</h3>
            <ul className="space-y-2 text-sm">
              {memberships.map((membership) => (
                <li key={membership.id} className="rounded-md border p-3">
                  <Link
                    href={`/esportes/${membership.team?.sport?.slug ?? ""}`}
                    className="font-medium hover:underline"
                  >
                    {membership.team?.sport?.name} — {membership.team?.name}
                  </Link>
                  <p className="text-muted-foreground text-xs">
                    {membership.team?.category} · {MEMBER_ROLE_LABELS[membership.role]}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {registrations.length > 0 ? (
          <div>
            <h3 className="mb-2 text-sm font-medium">Inscrições em peneiras</h3>
            <ul className="space-y-2 text-sm">
              {registrations.map((registration) => (
                <li
                  key={registration.id}
                  className="flex items-center justify-between gap-3 rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{registration.tryout?.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {registration.tryout?.team?.sport?.name} ·{" "}
                      {registration.tryout?.team?.name}
                    </p>
                  </div>
                  <span className="bg-secondary shrink-0 rounded-full px-2.5 py-1 text-xs">
                    {REGISTRATION_LABELS[registration.status]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
