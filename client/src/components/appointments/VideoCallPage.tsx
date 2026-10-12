import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import VideoCall from "./VideoCall";
import { FaVideo, FaUserMd, FaCalendar, FaPhone } from "react-icons/fa";
import { PageLoader, InlineSpinner } from "../utils/Spinner";
import FormError from "../utils/FormError";
import BackButton from "../utils/BackButton";
import { useJoinVideoCallMutation, useEndVideoCallMutation } from "../../redux/api/videoAPI";
import { authSelector } from "../../redux/slices/authSlice";

interface CallData {
  call_id: string;
  token: string;
  api_key: string;
  user_id: string;
  user_name: string;
  booking: {
    id: string;
    appointmentDate: string;
    time: string;
    reason: string;
    status: string;
  };
}

const VideoCallPage: React.FC = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [callData, setCallData] = useState<CallData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useSelector(authSelector);
  const [joinVideoCall, { isLoading: isJoining, isError: isJoinError, error: joinError }] = useJoinVideoCallMutation();
  const [endVideoCall] = useEndVideoCallMutation();

  useEffect(() => {
    if (!user.id) {
      navigate("/signin");
      return;
    }
    setIsLoading(false);
  }, [user.id, navigate]);

  const handleJoinCall = async () => {
    if (!bookingId) return;
    try {
      const result = await joinVideoCall(bookingId).unwrap();
      setCallData(result);
      setError(null);
    } catch (err: any) {
      setError(err.data?.detail || "Failed to join video call");
    }
  };

  const handleEndCall = async () => {
    if (!bookingId) return;
    try {
      await endVideoCall(bookingId).unwrap();
    } catch (err) {
      console.error("Failed to end call:", err);
    }
    navigate("/appointments");
  };

  if (isLoading) return <PageLoader label="Joining call…" />;

  if (callData) {
    return (
      <VideoCall
        callId={callData.call_id}
        apiKey={callData.api_key}
        token={callData.token}
        userId={callData.user_id}
        userName={callData.user_name}
        onCallEnd={handleEndCall}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <BackButton onClick={() => navigate(-1)} className="mb-6" />

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 sm:px-8 py-6 border-b border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <FaVideo className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-ink">Video consultation</h1>
            <p className="text-slate-600 text-sm mt-0.5">Join your scheduled appointment</p>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {(error || isJoinError) && (
            <>
              <FormError error={error || joinError} />
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Couldn’t join the call. Please try again.
              </div>
            </>
          )}

          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-4">
              <FaVideo className="text-slate-500 w-7 h-7" />
            </div>
            <h2 className="text-lg font-semibold text-ink mb-2">Ready to join?</h2>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              Join your video call when you’re ready. Use a stable connection and a quiet, well-lit space.
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-3">
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              <FaCalendar className="text-slate-500 w-4 h-4" />
              Appointment
            </h3>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
              <span>Booking: {bookingId?.slice(-8) ?? "—"}</span>
              <span className="flex items-center gap-1.5">
                <FaUserMd className="text-slate-400 w-3.5 h-3.5" />
                {user?.role}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleJoinCall}
            disabled={isJoining}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isJoining ? (
              <>
                <InlineSpinner className="text-white" />
                Joining…
              </>
            ) : (
              <>
                <FaPhone className="w-4 h-4" />
                Join video call
              </>
            )}
          </button>

          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <h3 className="text-sm font-semibold text-ink mb-2">Tips</h3>
            <ul className="text-sm text-slate-600 space-y-1.5">
              <li>• Stable internet connection</li>
              <li>• Quiet, well-lit environment</li>
              <li>• Test microphone and camera first</li>
              <li>• Have your notes or details ready</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallPage;
