import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import { AppHeader } from "@/components/app-header";
import { getCurrentProfile } from "@/modules/profiles/queries";
import { isStaff, ROLE_LABELS } from "@/modules/profiles/types";
import { getPost, listComments } from "@/modules/feed/queries";
import {
  deleteCommentAction,
  toggleCommentLikeAction,
} from "@/modules/feed/actions";
import type { FeedComment } from "@/modules/feed/types";
import {
  PostCard,
  formatDateTime,
} from "@/modules/feed/components/post-card";
import { LikeButton } from "@/modules/feed/components/like-button";
import { CommentComposer } from "@/modules/feed/components/comment-composer";
import { FeedRealtime } from "@/modules/feed/components/feed-realtime";

export const metadata: Metadata = { title: "Post" };

function CommentItem({
  comment,
  postId,
  canDelete,
}: {
  comment: FeedComment;
  postId: string;
  canDelete: boolean;
}) {
  const name = comment.author?.full_name ?? "Aluno";
  const staff = comment.author && comment.author.role !== "aluno";

  return (
    <div className="flex gap-3">
      <UserAvatar
        name={name}
        avatarUrl={comment.author?.avatar_url}
        className="size-8 shrink-0 text-xs"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 text-sm">
          <span className="font-medium">{name}</span>
          {staff && comment.author ? (
            <span className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs font-medium">
              {ROLE_LABELS[comment.author.role]}
            </span>
          ) : null}
          <span className="text-muted-foreground text-xs">
            {formatDateTime(comment.created_at)}
          </span>
        </div>
        <p className="mt-0.5 break-words whitespace-pre-wrap text-sm">
          {comment.content}
        </p>
        <div className="mt-2 flex items-center gap-4">
          <LikeButton
            action={toggleCommentLikeAction}
            fields={{ commentId: comment.id, postId }}
            liked={comment.likedByMe}
            count={comment.likeCount}
          />
          {canDelete ? (
            <form action={deleteCommentAction}>
              <input type="hidden" name="id" value={comment.id} />
              <input type="hidden" name="postId" value={postId} />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                aria-label="Excluir comentário"
                className="text-muted-foreground hover:text-destructive size-7"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  const staff = isStaff(profile.role);

  const post = await getPost(id);
  if (!post) notFound();

  const comments = await listComments(id);

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <FeedRealtime channel={`feed-${id}`} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <Link
          href="/comunidade"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← Voltar à comunidade
        </Link>

        <div className="mt-4">
          <PostCard
            post={post}
            canDelete={post.author_id === profile.id || staff}
            linkToDetail={false}
          />
        </div>

        <Card className="mt-4">
          <CardContent className="p-4">
            <CommentComposer postId={id} />
          </CardContent>
        </Card>

        <div className="mt-6 space-y-5">
          {comments.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhum comentário ainda. Comece a conversa!
            </p>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={id}
                canDelete={comment.author_id === profile.id || staff}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
