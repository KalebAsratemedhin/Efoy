

import { useState } from "react";
import { useDeleteCommentMutation, useUpdateCommentMutation } from "../../redux/api/commentAPI";
import { CommentI } from "../../types/Comment";
import { FaEdit, FaTrash } from "react-icons/fa";

const CommentCard = ({ comment, refetch, isEditable }: { comment: CommentI; isEditable: boolean; refetch: () => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [deleteComment] = useDeleteCommentMutation();
  const [updateComment] = useUpdateCommentMutation();

  // Since commenterId is a string, we'll use a placeholder for now
  const commenter = { fullName: "User", profilePic: null, email: "user@example.com" };

  const initials = commenter?.fullName.split(' ').map((name: string) => name[0].toUpperCase()).join('');

  const handleDelete = async () => {
    try {
      await deleteComment(comment?.id as string).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateComment({ id: comment?.id as string, update: {content: editedContent} }).unwrap();
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(comment.content); // Reset the edited content if cancel is clicked
  };


  return (
    <div className="bg-white border rounded-md flex flex-wrap w-full">
      <div className="w-20 flex flex-col items-center p-2">
        {commenter?.profilePic ? (
          <img src={commenter.profilePic} alt="Profile" className="w-16 h-16 rounded-full" />
        ) : (
          <div className="w-16 h-16 rounded-full flex justify-center items-center bg-gray-300 text-lg">
            {initials}
          </div>
        )}
      </div>
      <div className="flex-grow pt-2 text-gray-500">
        <p className="text-black">{commenter?.fullName}</p>
        <p className="italic">{commenter?.email}</p>

        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        ) : (
          <p>{comment.content}</p>
        )}
      </div>
      {isEditable && (
        <div className="w-14 flex gap-2 p-2">
          {isEditing ? (
            <>
              <button onClick={handleUpdate} className="text-green-500">Save</button>
              <button onClick={handleCancel} className="text-red-500">Cancel</button>
            </>
          ) : (
            <>
              <FaTrash onClick={handleDelete} className="cursor-pointer" />
              <FaEdit onClick={handleEdit} className="cursor-pointer" />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentCard;
