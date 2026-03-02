import React, { useEffect, useState } from 'react';
import {
  CallControls,
  CallingState,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  useCallStateHooks,
  User,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { FaPhoneSlash } from 'react-icons/fa';

interface VideoCallProps {
  callId: string;
  apiKey: string;
  token: string;
  userId: string;
  userName: string;
  onCallEnd: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({
  callId,
  apiKey,
  token,
  userId,
  userName,
  onCallEnd,
}) => {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const initializeCall = async () => {
      try {
        // Create user object
        const user: User = {
          id: userId,
          name: userName,
          image: `https://getstream.io/random_svg/?id=${userId}&name=${userName}`,
        };

        // Create Stream client
        const streamClient = new StreamVideoClient({ apiKey, user, token });
        
        if (!isMounted) {
          streamClient.disconnectUser();
          return;
        }
        
        setClient(streamClient);

        // Create and join call
        const streamCall = streamClient.call('default', callId);
        await streamCall.join({ create: true });
        
        if (!isMounted) {
          streamCall.leave();
          streamClient.disconnectUser();
          return;
        }
        
        setCall(streamCall);
        setIsConnecting(false);
      } catch (err) {
        console.error('Failed to initialize video call:', err);
        if (isMounted) {
          setError('Failed to connect to video call. Please try again.');
          setIsConnecting(false);
        }
      }
    };

    initializeCall();

    // Cleanup function
    return () => {
      isMounted = false;
      if (call) {
        call.leave();
      }
      if (client) {
        client.disconnectUser();
      }
    };
  }, []); // Empty dependency array - only run once on mount

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 max-w-md w-full shadow-sm">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4" aria-hidden>⚠️</div>
            <h2 className="text-xl font-semibold text-ink mb-2">Connection error</h2>
            <p className="text-slate-600 text-sm mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-accent text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isConnecting || !client || !call) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-slate-200">
          <div className="w-12 h-12 border-2 border-slate-400 border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Connecting to call</h2>
          <p className="text-slate-400 text-sm">Establishing your video connection…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <CallUI onCallEnd={onCallEnd} />
        </StreamCall>
      </StreamVideo>
    </div>
  );
};

const CallUI: React.FC<{ onCallEnd: () => void }> = ({ onCallEnd }) => {
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-slate-200">
          <div className="w-12 h-12 border-2 border-slate-400 border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Joining call</h2>
          <p className="text-slate-400 text-sm">Please wait…</p>
        </div>
      </div>
    );
  }

  return (
    <StreamTheme>
      <div className="relative h-screen">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 text-slate-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-white">Video consultation</h1>
              <p className="text-sm text-slate-400">
                {participantCount} participant{participantCount !== 1 ? 's' : ''} in call
              </p>
            </div>
            <button
              onClick={onCallEnd}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              <FaPhoneSlash className="w-4 h-4" />
              End call
            </button>
          </div>
        </div>

        {/* Video Layout */}
        <div className="h-full pt-20">
          <SpeakerLayout participantsBarPosition="bottom" />
        </div>

        {/* Call Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <CallControls />
        </div>
      </div>
    </StreamTheme>
  );
};

export default VideoCall; 