import { useState } from "react";
import { useDeleteCommentMutation, useUpdateCommentMutation } from "../../redux/api/commentAPI";
import { CommentI } from "../../types/Comment";
import { FaEllipsisV, FaPen, FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import RatingDisplay from "../rating/RatingDisplay";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const CommentCard = ({
  comment,
  refetch,
  isEditable,
}: {
  comment: CommentI;
  isEditable: boolean;
  refetch: () => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [deleteComment] = useDeleteCommentMutation();
  const [updateComment] = useUpdateCommentMutation();

  const displayName = comment.commenterName || "Patient";
  const initials = displayName
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  const handleDelete = async () => {
    try {
      await deleteComment(comment?.id as string).unwrap();
      toast.success("Review deleted.");
      refetch();
    } catch {
      toast.error("Could not delete review.");
    }
  };

  const handleUpdate = async () => {
    try {
      await updateComment({
        id: comment?.id as string,
        update: { content: editedContent },
      }).unwrap();
      setIsEditing(false);
      toast.success("Review updated.");
      refetch();
    } catch {
      toast.error("Could not update review.");
    }
  };

  const dateLabel = comment.created_at
    ? new Date(comment.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center">
          {comment.commenterPic ? (
            <img
              src={comment.commenterPic}
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-xs font-semibold text-slate-600">{initials}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-ink">{displayName}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {comment.rating != null && comment.rating > 0 && (
                  <div className="flex items-center gap-1.5">
                    <RatingDisplay value={comment.rating} />
                    <span className="text-xs font-medium text-slate-600 tabular-nums">
                      {Number(comment.rating).toFixed(1)}
                    </span>
                  </div>
                )}
                {dateLabel && <p className="text-xs text-slate-500">{dateLabel}</p>}
              </div>
            </div>
            {isEditable && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                    aria-label="Review actions"
                  >
                    <FaEllipsisV className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={() => setIsEditing(true)}
                    className="gap-2 cursor-pointer"
                  >
                    <FaPen className="w-3 h-3" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <FaTrash className="w-3 h-3" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isEditing ? (
            <div className="mt-3 space-y-2">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedContent(comment.content);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{comment.content}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentCard;
