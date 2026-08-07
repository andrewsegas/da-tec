import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { AppHeader } from "@/components/app-header";
import { getCurrentProfile } from "@/modules/profiles/queries";
import { isStaff } from "@/modules/profiles/types";
import { listFeed } from "@/modules/feed/queries";
import { PostComposer } from "@/modules/feed/components/post-composer";
import { PostCard } from "@/modules/feed/components/post-card";
import { FeedRealtime } from "@/modules/feed/components/feed-realtime";

export const metadata: Metadata = { title: "Comunidade" };

export default async function ComunidadePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const staff = isStaff(profile.role);
  const posts = await listFeed();

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <FeedRealtime channel="feed" />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <h1 className="mb-4 text-2xl font-semibold tracking-tight">
          Comunidade
        </h1>

        <Card className="mb-6">
          <CardContent className="p-4">
            <PostComposer />
          </CardContent>
        </Card>

        {posts.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Ainda não há posts. Seja o primeiro a publicar! 🚀
          </p>
        ) : (
          <ul className="space-y-3">
            {posts.map((post) => (
              <li key={post.id}>
                <PostCard
                  post={post}
                  canDelete={post.author_id === profile.id || staff}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
