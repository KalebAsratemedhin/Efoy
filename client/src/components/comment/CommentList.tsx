import { useFindAllCommentsQuery } from "../../redux/api/commentAPI";
import { useGetCurrentUserQuery } from "../../redux/api/userAPI";
import CommentCard from "./CommentCard";
import Spinner from "../utils/Spinner";
import Error from "../utils/Error";

const CommentList = ({ doctorId }: { doctorId: string }) => {
  const { data: comments, isLoading, isError, error, refetch } = useFindAllCommentsQuery(doctorId);
  const { data: user } = useGetCurrentUserQuery(undefined, {
    skip: !localStorage.getItem("accessToken"),
  });

  if (isLoading) return <Spinner size="sm" className="py-6" />;
  if (isError) return <Error error={error} />;

  if (!comments || comments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
        <p className="text-slate-600 text-sm">No reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment: any) => {
        const commenter =
          comment.commenterId && typeof comment.commenterId === "object"
            ? comment.commenterId
            : null;
        const commenterId =
          commenter?.id ??
          (typeof comment.commenterId === "string" ? comment.commenterId : undefined);

        return (
          <CommentCard
            key={comment.id}
            isEditable={!!user?.id && user.id === commenterId}
            comment={{
              id: comment.id,
              commenterId,
              commenterName: commenter?.fullName,
              commenterPic: commenter?.profilePic,
              content: comment.content,
              doctorId:
                typeof comment.doctorId === "string"
                  ? comment.doctorId
                  : comment.doctorId?.id ?? doctorId,
              created_at: comment.created_at,
              updated_at: comment.updated_at,
            }}
            refetch={refetch}
          />
        );
      })}
    </div>
  );
};

export default CommentList;
