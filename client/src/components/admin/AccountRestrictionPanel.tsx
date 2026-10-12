import { useState } from "react";
import { toast } from "sonner";
import { FaBan, FaUnlock, FaExclamationTriangle } from "react-icons/fa";
import {
  useRestrictUserMutation,
  useUnrestrictUserMutation,
} from "../../redux/api/userAPI";
import { InlineSpinner } from "../utils/Spinner";
import { extractErrorMessage } from "../../utils/errorHandler";

interface AccountRestrictionPanelProps {
  userId: string;
  accountLabel?: string;
  isRestricted?: boolean;
  restrictedAt?: string;
  restrictionReason?: string | null;
}

const AccountRestrictionPanel = ({
  userId,
  accountLabel = "account",
  isRestricted = false,
  restrictedAt,
  restrictionReason,
}: AccountRestrictionPanelProps) => {
  const [reason, setReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [restrictUser, { isLoading: restricting }] = useRestrictUserMutation();
  const [unrestrictUser, { isLoading: unrestricting }] = useUnrestrictUserMutation();
  const busy = restricting || unrestricting;

  const onRestrict = async () => {
    try {
      await restrictUser({
        id: userId,
        body: { reason: reason.trim() || undefined },
      }).unwrap();
      toast.success("Account restricted.");
      setReason("");
      setConfirmOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const onUnrestrict = async () => {
    if (!window.confirm(`Restore access for this ${accountLabel}?`)) return;
    try {
      await unrestrictUser(userId).unwrap();
      toast.success("Account unrestricted.");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const restrictedDate = restrictedAt
    ? new Date(restrictedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            isRestricted ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600"
          }`}
        >
          {isRestricted ? <FaBan className="w-4 h-4" /> : <FaUnlock className="w-4 h-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-ink">Account access</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Admins can restrict this {accountLabel} from signing in and appearing publicly.
          </p>
        </div>
      </div>

      {isRestricted ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3">
            <p className="text-sm font-medium text-red-800 flex items-center gap-2">
              <FaExclamationTriangle className="w-3.5 h-3.5 shrink-0" />
              Currently restricted
            </p>
            {restrictedDate && (
              <p className="text-xs text-red-700/80 mt-1">Since {restrictedDate}</p>
            )}
            {restrictionReason && (
              <p className="text-sm text-red-900 mt-2 whitespace-pre-wrap">{restrictionReason}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onUnrestrict}
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-70"
          >
            {unrestricting ? <InlineSpinner className="text-white" /> : <FaUnlock className="w-3.5 h-3.5" />}
            Unrestrict account
          </button>
        </div>
      ) : confirmOpen ? (
        <div className="mt-4 space-y-3">
          <div>
            <label htmlFor="restriction-reason" className="block text-xs font-medium text-slate-500 mb-1.5">
              Reason (optional)
            </label>
            <textarea
              id="restriction-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, 500))}
              rows={3}
              maxLength={500}
              placeholder="Why is this account being restricted?"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-ink placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-y"
            />
            <p className="text-[11px] text-slate-400 mt-1 text-right">{reason.length}/500</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={onRestrict}
              disabled={busy}
              className="inline-flex flex-1 items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-70"
            >
              {restricting ? <InlineSpinner className="text-white" /> : <FaBan className="w-3.5 h-3.5" />}
              Confirm restrict
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmOpen(false);
                setReason("");
              }}
              disabled={busy}
              className="inline-flex flex-1 items-center justify-center px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-ink hover:bg-slate-50 disabled:opacity-70"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-700 text-sm font-medium hover:bg-red-50"
        >
          <FaBan className="w-3.5 h-3.5" />
          Restrict account
        </button>
      )}
    </div>
  );
};

export default AccountRestrictionPanel;
