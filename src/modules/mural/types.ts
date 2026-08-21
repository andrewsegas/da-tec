import type { Author } from "@/modules/feed/types";

export type GameStatus = "agendado" | "encerrado";

export type NewsRow = {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author: Author | null;
  created_at: string;
  updated_at: string;
};

export type GameRow = {
  id: string;
  team_id: string | null;
  modality: string;
  opponent: string;
  location: string | null;
  starts_at: string;
  home_score: number | null;
  away_score: number | null;
  status: GameStatus;
  created_at: string;
};

export type EventRow = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
};

export type EventWithRsvp = EventRow & {
  rsvpCount: number;
  rsvpedByMe: boolean;
};
