import { createClient } from "@/lib/supabase/server";
import type { Author, FeedComment, FeedPost } from "./types";

type RawPost = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author: Author | null;
  post_likes: { count: number }[];
  comments: { count: number }[];
};

type RawComment = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author: Author | null;
  comment_likes: { count: number }[];
};

const POST_SELECT =
  "id, content, created_at, author_id, author:profiles(full_name, avatar_url, role), post_likes(count), comments(count)";
const COMMENT_SELECT =
  "id, content, created_at, author_id, author:profiles(full_name, avatar_url, role), comment_likes(count)";

/** Ids (dentre os informados) que o usuário atual curtiu na tabela dada. */
async function likedIds(
  table: "post_likes" | "comment_likes",
  column: "post_id" | "comment_id",
  targetIds: string[],
): Promise<Set<string>> {
  if (targetIds.length === 0) return new Set();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data } = await supabase
    .from(table)
    .select(column)
    .eq("user_id", user.id)
    .in(column, targetIds);

  const rows = (data as Record<string, string>[] | null) ?? [];
  return new Set(rows.map((row) => row[column]));
}

export async function listFeed(): Promise<FeedPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .order("created_at", { ascending: false })
    .limit(50);

  const rows = (data as unknown as RawPost[] | null) ?? [];
  const liked = await likedIds(
    "post_likes",
    "post_id",
    rows.map((r) => r.id),
  );

  return rows.map((r) => ({
    id: r.id,
    content: r.content,
    created_at: r.created_at,
    author_id: r.author_id,
    author: r.author,
    likeCount: r.post_likes[0]?.count ?? 0,
    commentCount: r.comments[0]?.count ?? 0,
    likedByMe: liked.has(r.id),
  }));
}

export async function getPost(id: string): Promise<FeedPost | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("id", id)
    .maybeSingle();

  const r = data as unknown as RawPost | null;
  if (!r) return null;

  const liked = await likedIds("post_likes", "post_id", [r.id]);
  return {
    id: r.id,
    content: r.content,
    created_at: r.created_at,
    author_id: r.author_id,
    author: r.author,
    likeCount: r.post_likes[0]?.count ?? 0,
    commentCount: r.comments[0]?.count ?? 0,
    likedByMe: liked.has(r.id),
  };
}

export async function listComments(postId: string): Promise<FeedComment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("comments")
    .select(COMMENT_SELECT)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  const rows = (data as unknown as RawComment[] | null) ?? [];
  const liked = await likedIds(
    "comment_likes",
    "comment_id",
    rows.map((r) => r.id),
  );

  return rows.map((r) => ({
    id: r.id,
    content: r.content,
    created_at: r.created_at,
    author_id: r.author_id,
    author: r.author,
    likeCount: r.comment_likes[0]?.count ?? 0,
    likedByMe: liked.has(r.id),
  }));
}
