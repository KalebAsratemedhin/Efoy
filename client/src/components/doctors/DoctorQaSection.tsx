import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  FaComments,
  FaPlus,
  FaReply,
  FaTrash,
  FaTimes,
  FaPen,
} from "react-icons/fa";
import {
  useAnswerDoctorQuestionMutation,
  useCreateDoctorQuestionMutation,
  useDeleteDoctorQuestionMutation,
  useListDoctorQuestionsQuery,
  useUpdateDoctorAnswerMutation,
} from "../../redux/api/doctorQaAPI";
import { DoctorQuestion, QuestionStatus } from "../../types/DoctorBoard";
import { InlineSpinner, Skeleton } from "../utils/Spinner";
import { extractErrorMessage } from "../../utils/errorHandler";
import ReactionBar from "./ReactionBar";
import InfiniteScrollContainer from "../utils/InfiniteScrollContainer";

const PAGE_SIZE = 8;

interface DoctorQaSectionProps {
  doctorUserId: string;
  doctorName: string;
  isOwner: boolean;
  isPatient: boolean;
  currentUserId?: string | null;
  /** When true, omit outer card + title (parent provides tabs/chrome). */
  embedded?: boolean;
}

const statusBadge: Record<string, string> = {
  open: "bg-amber-100 text-amber-800",
  answered: "bg-green-100 text-green-800",
  closed: "bg-slate-100 text-slate-600",
};

const DoctorQaSection = ({
  doctorUserId,
  doctorName,
  isOwner,
  isPatient,
  currentUserId,
  embedded = false,
}: DoctorQaSectionProps) => {
  const [statusFilter, setStatusFilter] = useState<"" | QuestionStatus>("");
  const [page, setPage] = useState(1);
  const [questions, setQuestions] = useState<DoctorQuestion[]>([]);
  const [askOpen, setAskOpen] = useState(false);
  const [askBody, setAskBody] = useState("");
  const [answerTarget, setAnswerTarget] = useState<DoctorQuestion | null>(null);
  const [answerBody, setAnswerBody] = useState("");
  const [editingAnswer, setEditingAnswer] = useState(false);

  const { data, isLoading, isFetching, isError } = useListDoctorQuestionsQuery({
    doctorUserId,
    params: {
      page,
      limit: PAGE_SIZE,
      status: isOwner && statusFilter ? statusFilter : undefined,
    },
  });

  const [createQuestion, { isLoading: asking }] = useCreateDoctorQuestionMutation();
  const [answerQuestion, { isLoading: answering }] = useAnswerDoctorQuestionMutation();
  const [updateAnswer, { isLoading: updatingAnswer }] = useUpdateDoctorAnswerMutation();
  const [deleteQuestion, { isLoading: deleting }] = useDeleteDoctorQuestionMutation();

  useEffect(() => {
    setPage(1);
    setQuestions([]);
  }, [doctorUserId, statusFilter]);

  useEffect(() => {
    if (!data?.items) return;
    setQuestions((prev) => {
      if (page === 1) return data.items;
      const byId = new Map(prev.map((q) => [q.id, q]));
      for (const item of data.items) byId.set(item.id, item);
      const updated = prev.map((q) => byId.get(q.id) ?? q);
      const existing = new Set(prev.map((q) => q.id));
      return [...updated, ...data.items.filter((q) => !existing.has(q.id))];
    });
  }, [data, page]);

  const hasMore = Boolean(data?.has_next);

  const openAnswer = (q: DoctorQuestion, edit = false) => {
    setAnswerTarget(q);
    setAnswerBody(q.answerBody ?? "");
    setEditingAnswer(edit || Boolean(q.answerBody));
  };

  const closeAnswer = () => {
    setAnswerTarget(null);
    setAnswerBody("");
    setEditingAnswer(false);
  };

  const onAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (askBody.trim().length < 5) {
      toast.error("Please write at least 5 characters.");
      return;
    }
    try {
      await createQuestion({ doctorId: doctorUserId, body: askBody.trim() }).unwrap();
      toast.success("Question submitted.");
      setAskBody("");
      setAskOpen(false);
      setPage(1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const onAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerTarget || answerBody.trim().length < 1) {
      toast.error("Answer cannot be empty.");
      return;
    }
    try {
      if (editingAnswer && answerTarget.answerBody) {
        await updateAnswer({
          id: answerTarget.id,
          body: { body: answerBody.trim() },
        }).unwrap();
        toast.success("Answer updated.");
      } else {
        await answerQuestion({
          id: answerTarget.id,
          body: { body: answerBody.trim() },
        }).unwrap();
        toast.success("Answer posted.");
      }
      setPage(1);
      closeAnswer();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const onDelete = async (q: DoctorQuestion) => {
    const canAskerDelete =
      currentUserId === q.askerId && q.status === "open" && !q.answerBody;
    if (!isOwner && !canAskerDelete) return;
    if (!window.confirm("Delete this question?")) return;
    try {
      await deleteQuestion(q.id).unwrap();
      toast.success("Question deleted.");
      setPage(1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div
      className={
        embedded
          ? ""
          : "bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6"
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 mb-4">
        {embedded ? (
          <p className="text-sm text-slate-500 min-w-0 flex-1">
            Patients can ask questions; Dr. {doctorName} answers here.
          </p>
        ) : (
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <FaComments className="text-accent" />
              <h2 className="text-lg font-semibold text-ink">Ask the doctor</h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Patients can ask questions; Dr. {doctorName} answers here.
            </p>
          </div>
        )}
        {(isOwner || (isPatient && !isOwner)) && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isOwner && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "" | QuestionStatus)}
                className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="">All</option>
                <option value="open">Open</option>
                <option value="answered">Answered</option>
                <option value="closed">Closed</option>
              </select>
            )}
            {isPatient && !isOwner && (
              <button
                type="button"
                onClick={() => setAskOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover"
              >
                <FaPlus className="w-3 h-3" />
                Ask a question
              </button>
            )}
          </div>
        )}
      </div>

      {isLoading && page === 1 && questions.length === 0 ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : isError ? (
        <p className="text-sm text-red-600 py-6 text-center">Couldn’t load questions.</p>
      ) : questions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
          <p className="text-slate-600 text-sm">
            {isPatient
              ? "No questions yet. Be the first to ask."
              : "No questions on this profile yet."}
          </p>
        </div>
      ) : (
        <InfiniteScrollContainer
          hasMore={hasMore}
          isFetching={isFetching}
          onLoadMore={() => {
            if (!isFetching && hasMore) setPage((p) => p + 1);
          }}
          maxHeightClassName="max-h-[28rem]"
        >
          <ul className="space-y-3">
            {questions.map((q) => {
              const canAskerDelete =
                currentUserId === q.askerId && q.status === "open" && !q.answerBody;
              const initials = (q.askerName || "P")
                .split(" ")
                .map((n) => n[0]?.toUpperCase())
                .join("")
                .slice(0, 2);

              return (
                <li key={q.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center">
                      {q.askerPic ? (
                        <img
                          src={q.askerPic}
                          alt=""
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-600">{initials}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-ink">
                            {q.askerName || "Patient"}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                                statusBadge[q.status] ?? statusBadge.open
                              }`}
                            >
                              {q.status}
                            </span>
                            {q.created_at && (
                              <span className="text-xs text-slate-400">
                                {new Date(q.created_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {isOwner && q.status !== "closed" && (
                            <button
                              type="button"
                              onClick={() => openAnswer(q, Boolean(q.answerBody))}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-ink hover:bg-white"
                            >
                              {q.answerBody ? (
                                <>
                                  <FaPen className="w-3 h-3" /> Edit answer
                                </>
                              ) : (
                                <>
                                  <FaReply className="w-3 h-3" /> Answer
                                </>
                              )}
                            </button>
                          )}
                          {(isOwner || canAskerDelete) && (
                            <button
                              type="button"
                              onClick={() => onDelete(q)}
                              disabled={deleting}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"
                              aria-label="Delete question"
                            >
                              <FaTrash className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{q.body}</p>

                      <ReactionBar
                        className="mt-2"
                        targetType="question"
                        targetId={q.id}
                        likeCount={q.likeCount}
                        dislikeCount={q.dislikeCount}
                        myReaction={q.myReaction}
                        disabled={currentUserId === q.askerId}
                      />

                      {q.answerBody ? (
                        <div className="mt-3 rounded-xl bg-white border border-slate-200 px-3.5 py-3">
                          <p className="text-xs font-medium text-accent mb-1">
                            Dr. {doctorName} answered
                            {q.answeredAt
                              ? ` · ${new Date(q.answeredAt).toLocaleDateString()}`
                              : ""}
                          </p>
                          <p className="text-sm text-ink whitespace-pre-wrap">{q.answerBody}</p>
                          <ReactionBar
                            className="mt-2"
                            targetType="answer"
                            targetId={q.id}
                            likeCount={q.answerLikeCount}
                            dislikeCount={q.answerDislikeCount}
                            myReaction={q.myAnswerReaction}
                            disabled={isOwner}
                          />
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-slate-400 italic">Awaiting answer</p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </InfiniteScrollContainer>
      )}

      {askOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 p-0 sm:p-4"
          onClick={() => setAskOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl border border-slate-200 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-ink">Ask a question</h3>
                <p className="text-sm text-slate-500 mt-0.5">Dr. {doctorName} will answer here.</p>
              </div>
              <button
                type="button"
                onClick={() => setAskOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-ink hover:bg-slate-100"
                aria-label="Close"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={onAsk} className="p-5 space-y-4">
              <textarea
                value={askBody}
                onChange={(e) => setAskBody(e.target.value)}
                rows={5}
                placeholder="What would you like to know?"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-y"
                required
                minLength={5}
              />
              <button
                type="submit"
                disabled={asking}
                className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-70"
              >
                {asking && <InlineSpinner className="text-white" />}
                Submit question
              </button>
            </form>
          </div>
        </div>
      )}

      {answerTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 p-0 sm:p-4"
          onClick={closeAnswer}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl border border-slate-200 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-ink">
                  {editingAnswer && answerTarget.answerBody ? "Edit answer" : "Answer question"}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{answerTarget.body}</p>
              </div>
              <button
                type="button"
                onClick={closeAnswer}
                className="p-2 rounded-xl text-slate-400 hover:text-ink hover:bg-slate-100"
                aria-label="Close"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={onAnswer} className="p-5 space-y-4">
              <textarea
                value={answerBody}
                onChange={(e) => setAnswerBody(e.target.value)}
                rows={5}
                placeholder="Write your answer…"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-y"
                required
              />
              <button
                type="submit"
                disabled={answering || updatingAnswer}
                className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-70"
              >
                {(answering || updatingAnswer) && <InlineSpinner className="text-white" />}
                {editingAnswer && answerTarget.answerBody ? "Save answer" : "Post answer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorQaSection;
