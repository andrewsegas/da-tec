"use client";

import { useOptimistic, useTransition } from "react";
import { CalendarCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toggleRsvpAction } from "@/modules/mural/actions";

export function RsvpButton({
  eventId,
  going,
  count,
}: {
  eventId: string;
  going: boolean;
  count: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useOptimistic({ going, count });

  const onClick = () => {
    const formData = new FormData();
    formData.append("eventId", eventId);
    startTransition(async () => {
      setState({
        going: !state.going,
        count: state.count + (state.going ? -1 : 1),
      });
      await toggleRsvpAction(formData);
    });
  };

  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={isPending}
      variant={state.going ? "default" : "outline"}
      size="sm"
    >
      <CalendarCheck className="size-4" />
      {state.going ? "Presença confirmada" : "Confirmar presença"} ·{" "}
      {state.count}
    </Button>
  );
}
