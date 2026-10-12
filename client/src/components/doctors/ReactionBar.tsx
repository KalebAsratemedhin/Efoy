import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaRegThumbsDown, FaRegThumbsUp, FaThumbsDown, FaThumbsUp } from "react-icons/fa";
import { toast } from "sonner";
import { authSelector } from "../../redux/slices/authSlice";
import {
  useRemoveReactionMutation,
  useUpsertReactionMutation,
} from "../../redux/api/reactionAPI";
import { ReactionTargetType, ReactionValue } from "../../types/DoctorBoard";
import { extractErrorMessage } from "../../utils/errorHandler";

interface ReactionBarProps {
  targetType: ReactionTargetType;
  targetId: string;
  likeCount?: number;
  dislikeCount?: number;
  myReaction?: ReactionValue | null;
  /** Disable reacting (e.g. own post / question / answer). Counts still show. */
  disabled?: boolean;
  className?: string;
}

type ReactionState = {
  likeCount: number;
  dislikeCount: number;
  myReaction: ReactionValue | null;
};

function applyReactionChange(
  prev: ReactionState,
  next: ReactionValue | null
): ReactionState {
  let { likeCount, dislikeCount, myReaction } = prev;

  if (myReaction === "like") likeCount = Math.max(0, likeCount - 1);
  if (myReaction === "dislike") dislikeCount = Math.max(0, dislikeCount - 1);

  if (next === "like") likeCount += 1;
  if (next === "dislike") dislikeCount += 1;

  return { likeCount, dislikeCount, myReaction: next };
}

const ReactionBar = ({
  targetType,
  targetId,
  likeCount = 0,
  dislikeCount = 0,
  myReaction = null,
  disabled = false,
  className = "",
}: ReactionBarProps) => {
  const auth = useSelector(authSelector);
  const [upsert, { isLoading: upserting }] = useUpsertReactionMutation();
  const [remove, { isLoading: removing }] = useRemoveReactionMutation();
  const busy = upserting || removing;
  const locked = disabled || busy;

  const [state, setState] = useState<ReactionState>({
    likeCount,
    dislikeCount,
    myReaction: myReaction ?? null,
  });

  useEffect(() => {
    setState({
      likeCount,
      dislikeCount,
      myReaction: myReaction ?? null,
    });
  }, [targetId, likeCount, dislikeCount, myReaction]);

  const onReact = async (value: ReactionValue) => {
    if (disabled) {
      toast.error("You can’t react to your own content.");
      return;
    }
    if (!auth.accessToken) {
      toast.error("Sign in to react.");
      return;
    }

    const previous = state;
    const nextValue = previous.myReaction === value ? null : value;
    setState(applyReactionChange(previous, nextValue));

    try {
      if (nextValue === null) {
        await remove({ targetType, targetId }).unwrap();
      } else {
        await upsert({ targetType, targetId, value: nextValue }).unwrap();
      }
    } catch (err) {
      setState(previous);
      toast.error(extractErrorMessage(err));
    }
  };

  const tip = disabled ? "You can’t react to your own content" : undefined;

  return (
    <div className={`inline-flex items-center gap-1 ${className}`} title={tip}>
      <button
        type="button"
        disabled={locked}
        onClick={() => onReact("like")}
        aria-pressed={state.myReaction === "like"}
        aria-label="Like"
        className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          state.myReaction === "like"
            ? "bg-accent/10 text-accent"
            : "text-slate-500 hover:bg-slate-100 hover:text-ink disabled:hover:bg-transparent disabled:hover:text-slate-500"
        }`}
      >
        {state.myReaction === "like" ? (
          <FaThumbsUp className="w-3 h-3" />
        ) : (
          <FaRegThumbsUp className="w-3 h-3" />
        )}
        <span>{state.likeCount}</span>
      </button>
      <button
        type="button"
        disabled={locked}
        onClick={() => onReact("dislike")}
        aria-pressed={state.myReaction === "dislike"}
        aria-label="Dislike"
        className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          state.myReaction === "dislike"
            ? "bg-slate-200 text-slate-800"
            : "text-slate-500 hover:bg-slate-100 hover:text-ink disabled:hover:bg-transparent disabled:hover:text-slate-500"
        }`}
      >
        {state.myReaction === "dislike" ? (
          <FaThumbsDown className="w-3 h-3" />
        ) : (
          <FaRegThumbsDown className="w-3 h-3" />
        )}
        <span>{state.dislikeCount}</span>
      </button>
    </div>
  );
};

export default ReactionBar;
