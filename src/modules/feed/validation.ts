import { z } from "zod";

export const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Escreva algo para publicar.")
    .max(500, "O post pode ter no máximo 500 caracteres."),
});

export const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Escreva um comentário.")
    .max(300, "O comentário pode ter no máximo 300 caracteres."),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
