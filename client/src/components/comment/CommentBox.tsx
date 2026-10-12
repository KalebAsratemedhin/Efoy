import { useForm } from "react-hook-form";
import { useCreateCommentMutation, useFindAllCommentsQuery } from "../../redux/api/commentAPI";
import { InlineSpinner } from "../utils/Spinner";
import { useEffect } from "react";
import { toast } from "sonner";
import { extractErrorMessage } from "../../utils/errorHandler";

interface FormData {
  content: string;
}

const CommentBox = ({ doctorId }: { doctorId: string }) => {
  const {
    formState: { errors },
    register,
    handleSubmit,
    reset,
  } = useForm<FormData>();
  const [commentDoc, { isLoading, isSuccess, isError, error }] = useCreateCommentMutation();
  const { refetch } = useFindAllCommentsQuery(doctorId);

  const onSubmit = async (data: FormData) => {
    await commentDoc({ ...data, doctorId });
  };

  useEffect(() => {
    if (isSuccess) {
      reset();
      refetch();
      toast.success("Review posted.");
    }
  }, [isSuccess, refetch, reset]);

  useEffect(() => {
    if (isError) toast.error(extractErrorMessage(error));
  }, [isError, error]);

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <textarea
        id="content"
        rows={4}
        placeholder="Share your experience with this doctor…"
        className={`w-full px-3.5 py-2.5 border rounded-xl text-sm text-ink placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-y ${
          errors.content ? "border-red-300" : "border-slate-200"
        }`}
        {...register("content", {
          required: "Please write a short review",
          minLength: { value: 5, message: "At least 5 characters" },
        })}
      />
      {errors.content && (
        <p className="text-sm text-red-600">{errors.content.message}</p>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-70"
      >
        {isLoading && <InlineSpinner className="text-white" />}
        Post review
      </button>
    </form>
  );
};

export default CommentBox;
