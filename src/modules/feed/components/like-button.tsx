"use client";

import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  fields: Record<string, string>;
  liked: boolean;
  count: number;
};

/** Botão de curtir com atualização otimista (o servidor reconcilia). */
export function LikeButton({ action, fields, liked, count }: Props) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useOptimistic({ liked, count });

  const onClick = () => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      formData.append(key, value);
    }
    startTransition(async () => {
      setState({
        liked: !state.liked,
        count: state.count + (state.liked ? -1 : 1),
      });
      await action(formData);
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      aria-pressed={state.liked}
      aria-label={state.liked ? "Descurtir" : "Curtir"}
      className={cn(
        "text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-sm transition-colors disabled:opacity-60",
        state.liked && "text-primary",
      )}
    >
      <Heart className={cn("size-4", state.liked && "fill-current")} />
      {state.count}
    </button>
  );
}
