import { useFindAllCommentsQuery } from "../../redux/api/commentAPI";
import { useGetCurrentUserQuery } from "../../redux/api/userAPI";
import { CommentPopulated } from "../../types/Comment";
import CommentCard from "./CommentCard";
import Spinner from "../utils/Spinner";
import Error from "../utils/Error";

const CommentList = ({ doctorId }: { doctorId: string }) => {
  const { data: comments, isLoading, isError, error, refetch } = useFindAllCommentsQuery(doctorId);
  const { data: user } = useGetCurrentUserQuery(undefined, {
    skip: !localStorage.getItem('accessToken')
  });

  if (isLoading) return <Spinner />;
  if (isError) return <Error error={error} />;

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment: CommentPopulated) => {
        // Convert CommentPopulated to CommentI for the CommentCard component
        const commentForCard = {
          id: comment.id,
          commenterId: comment.commenterId.id, // Convert User to string
          content: comment.content,
          doctorId: comment.doctorId,
          created_at: comment.created_at,
          updated_at: comment.updated_at
        };
        
        return <CommentCard 
          key={comment.id} 
          isEditable={user?.id === comment.commenterId.id} 
          comment={commentForCard} 
          refetch={refetch} 
        />
      })}
    </div>
  );
};

export default CommentList