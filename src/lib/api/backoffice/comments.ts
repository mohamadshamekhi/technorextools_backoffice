import { api, type Paginated } from "../http";
import type { CommentStatus } from "./moderation";

/** نظرات — docs/api/backoffice.md § Comments. Perm: `comments.moderate`. */

export type BackofficeComment = {
  id: string;
  body: string;
  rating: number | null;
  status: CommentStatus;
  authorName: string | null;
  productTitle: string | null;
  productId: string | null;
  createdAt: string;
};

/** GET /backoffice/comments?status= */
export const list = (status?: CommentStatus) =>
  api.get<Paginated<BackofficeComment>>("/backoffice/comments", {
    query: { status },
  });

/** PATCH /backoffice/comments/{id} */
export const moderate = (id: string, status: CommentStatus) =>
  api.patch<BackofficeComment>(`/backoffice/comments/${id}`, { status });
