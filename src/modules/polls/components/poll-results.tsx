"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type Option = { id: string; label: string };

export function PollResults({
  pollId,
  options,
  initialCounts,
}: {
  pollId: string;
  options: Option[];
  initialCounts: Record<string, number>;
}) {
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);

  useEffect(() => {
    const supabase = createClient();

    const refetch = async () => {
      const { data } = await supabase
        .from("poll_votes")
        .select("option_id")
        .eq("poll_id", pollId);
      const next: Record<string, number> = {};
      for (const row of (data as { option_id: string }[] | null) ?? []) {
        next[row.option_id] = (next[row.option_id] ?? 0) + 1;
      }
      setCounts(next);
    };

    const channel = supabase
      .channel(`poll-${pollId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "poll_votes",
          filter: `poll_id=eq.${pollId}`,
        },
        () => {
          void refetch();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [pollId]);

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const count = counts[option.id] ?? 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={option.id}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>{option.label}</span>
              <span className="text-muted-foreground tabular-nums">
                {count} · {pct}%
              </span>
            </div>
            <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-muted-foreground text-xs">
        {total} voto(s) · atualiza em tempo real
      </p>
    </div>
  );
}
