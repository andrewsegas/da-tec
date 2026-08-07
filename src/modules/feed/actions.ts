"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { fieldErrorsFrom, type FormState } from "@/lib/forms";
import { createCommentSchema, createPostSchema } from "./validation";

const FEED_PATH = "/comunidade";

export async function createPostAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = createPostSchema.safeParse({
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("posts")
    .insert({ author_id: user.id, content: parsed.data.content });
  if (error) {
    return { error: "Não foi possível publicar. Tente novamente." };
  }

  revalidatePath(FEED_PATH);
  return { ok: true };
}

export async function deletePostAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (typeof id !== "string") return;
  const supabase = await createClient();
  await supabase.from("posts").delete().eq("id", id);
  redirect(FEED_PATH);
}

export async function createCommentAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const postId = formData.get("postId");
  if (typeof postId !== "string") return { error: "Post inválido." };

  const parsed = createCommentSchema.safeParse({
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    author_id: user.id,
    content: parsed.data.content,
  });
  if (error) {
    return { error: "Não foi possível comentar. Tente novamente." };
  }

  revalidatePath(`${FEED_PATH}/${postId}`);
  revalidatePath(FEED_PATH);
  return { ok: true };
}

export async function deleteCommentAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  const postId = formData.get("postId");
  if (typeof id !== "string") return;
  const supabase = await createClient();
  await supabase.from("comments").delete().eq("id", id);
  if (typeof postId === "string") revalidatePath(`${FEED_PATH}/${postId}`);
}

/** Alterna a curtida do usuário atual num alvo (post ou comentário). */
async function toggleLike(
  table: "post_likes" | "comment_likes",
  column: "post_id" | "comment_id",
  targetId: string,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from(table)
    .select("id")
    .eq(column, targetId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from(table)
      .delete()
      .eq("id", (existing as { id: string }).id);
  } else {
    await supabase
      .from(table)
      .insert({ [column]: targetId, user_id: user.id });
  }
}

export async function togglePostLikeAction(formData: FormData): Promise<void> {
  const postId = formData.get("postId");
  if (typeof postId !== "string") return;
  await toggleLike("post_likes", "post_id", postId);
  revalidatePath(FEED_PATH);
  revalidatePath(`${FEED_PATH}/${postId}`);
}

export async function toggleCommentLikeAction(
  formData: FormData,
): Promise<void> {
  const commentId = formData.get("commentId");
  const postId = formData.get("postId");
  if (typeof commentId !== "string") return;
  await toggleLike("comment_likes", "comment_id", commentId);
  if (typeof postId === "string") revalidatePath(`${FEED_PATH}/${postId}`);
}
