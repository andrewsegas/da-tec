import Link from "next/link";
import { MessageCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import { ROLE_LABELS } from "@/modules/profiles/types";
import { deletePostAction, togglePostLikeAction } from "@/modules/feed/actions";
import type { FeedPost } from "@/modules/feed/types";
import { LikeButton } from "./like-button";

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PostCard({
  post,
  canDelete,
  linkToDetail = true,
}: {
  post: FeedPost;
  canDelete: boolean;
  linkToDetail?: boolean;
}) {
  const name = post.author?.full_name ?? "Aluno";
  const staff = post.author && post.author.role !== "aluno";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <UserAvatar
            name={name}
            avatarUrl={post.author?.avatar_url}
            className="size-10 shrink-0 text-sm"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 text-sm">
              <span className="font-medium">{name}</span>
              {staff && post.author ? (
                <span className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                  {ROLE_LABELS[post.author.role]}
                </span>
              ) : null}
              <span className="text-muted-foreground text-xs">
                {formatDateTime(post.created_at)}
              </span>
            </div>

            <p className="mt-1 break-words whitespace-pre-wrap">
              {post.content}
            </p>

            <div className="mt-3 flex items-center gap-4">
              <LikeButton
                action={togglePostLikeAction}
                fields={{ postId: post.id }}
                liked={post.likedByMe}
                count={post.likeCount}
              />
              {linkToDetail ? (
                <Link
                  href={`/comunidade/${post.id}`}
                  className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-sm"
                >
                  <MessageCircle className="size-4" /> {post.commentCount}
                </Link>
              ) : (
                <span className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
                  <MessageCircle className="size-4" /> {post.commentCount}
                </span>
              )}
              {canDelete ? (
                <form action={deletePostAction} className="ml-auto">
                  <input type="hidden" name="id" value={post.id} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    aria-label="Excluir post"
                    className="text-muted-foreground hover:text-destructive size-8"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
