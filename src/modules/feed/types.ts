import type { UserRole } from "@/lib/constants";

export type Author = {
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
};

/** Post pronto para exibição (autor + contagens + se o usuário curtiu). */
export type FeedPost = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author: Author | null;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
};

/** Comentário pronto para exibição. */
export type FeedComment = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author: Author | null;
  likeCount: number;
  likedByMe: boolean;
};
