import { ExternalLink, ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import { isStaff, ROLE_LABELS, type ProfileRow } from "@/modules/profiles/types";
import {
  githubUrl,
  instagramUrl,
  linkedinUrl,
} from "@/modules/profiles/social";

type Social = { url: string; label: string };

export function ProfileView({ profile }: { profile: ProfileRow }) {
  const staff = isStaff(profile.role);

  const socials: Social[] = [];
  if (profile.github_username) {
    socials.push({ url: githubUrl(profile.github_username), label: "GitHub" });
  }
  if (profile.linkedin_username) {
    socials.push({
      url: linkedinUrl(profile.linkedin_username),
      label: "LinkedIn",
    });
  }
  if (profile.instagram_username) {
    socials.push({
      url: instagramUrl(profile.instagram_username),
      label: "Instagram",
    });
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
        <UserAvatar
          name={profile.full_name}
          avatarUrl={profile.avatar_url}
          className="size-20 shrink-0 text-2xl"
        />
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {profile.full_name}
            </h1>
            <span className="bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium">
              {staff ? <ShieldCheck className="size-3" /> : null}
              {ROLE_LABELS[profile.role]}
            </span>
          </div>

          <p className="text-muted-foreground">
            {profile.course ?? "Curso não informado"}
            {profile.period ? ` · ${profile.period}º período` : ""}
          </p>

          {profile.bio ? (
            <p className="mt-1 break-words whitespace-pre-wrap text-sm">
              {profile.bio}
            </p>
          ) : null}

          {socials.length > 0 ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {socials.map(({ url, label }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border bg-secondary/40 text-secondary-foreground hover:border-primary/50 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors"
                >
                  {label}
                  <ExternalLink className="size-3" />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
