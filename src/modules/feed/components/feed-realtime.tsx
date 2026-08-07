"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

const TABLES = ["posts", "comments", "post_likes", "comment_likes"] as const;

/** Atualiza a página (server component) sempre que o feed muda no banco. */
export function FeedRealtime({ channel }: { channel: string }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const ch = supabase.channel(channel);
    for (const table of TABLES) {
      ch.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => router.refresh(),
      );
    }
    ch.subscribe();

    return () => {
      void supabase.removeChannel(ch);
    };
  }, [channel, router]);

  return null;
}
