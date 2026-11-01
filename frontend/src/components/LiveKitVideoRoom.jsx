import React, { useState, useEffect, useRef } from 'react';
import { Room, RoomEvent, Track } from 'livekit-client';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  MonitorUp, 
  PhoneOff, 
  Users, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  Maximize2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LiveKitVideoRoom({ 
  initialRoomName = 'ai01-ops-room',
  onClose,
  embedded = false 
}) {
  const { user, authFetch } = useAuth();
  const [roomName, setRoomName] = useState(initialRoomName);
  const [displayName, setDisplayName] = useState(user?.full_name || user?.username || 'AI Operator');
  const [inCall, setInCall] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected'); // 'connecting' | 'connected' | 'reconnecting' | 'disconnected'
  const [errorMsg, setErrorMsg] = useState(null);

  // Device controls
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Participants & Tracks
  const [remoteParticipants, setRemoteParticipants] = useState([]);
  const [activeSpeaker, setActiveSpeaker] = useState(null);

  const roomRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, []);

  // Join LiveKit Room
  const handleJoinCall = async (e) => {
    if (e) e.preventDefault();
    setIsConnecting(true);
    setErrorMsg(null);

    try {
      // 1. Fetch short-lived JWT token from backend
      const res = await authFetch(`http://localhost:8000/api/livekit/token?room=${encodeURIComponent(roomName)}&name=${encodeURIComponent(displayName)}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to acquire LiveKit token.');
      }
      const tokenData = await res.json();

      // 2. Instantiate LiveKit Room
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: { width: 1280, height: 720, frameRate: 30 }
        }
      });
      roomRef.current = room;

      // 3. Register Room Event Listeners
      room.on(RoomEvent.ConnectionStateChanged, (state) => {
        setConnectionState(state.toLowerCase());
      });

      room.on(RoomEvent.Connected, () => {
        setInCall(true);
        setIsConnecting(false);
        setConnectionState('connected');
        updateParticipantList(room);
      });

      room.on(RoomEvent.Disconnected, () => {
        setInCall(false);
        setIsConnecting(false);
        setConnectionState('disconnected');
        setRemoteParticipants([]);
      });

      room.on(RoomEvent.ParticipantConnected, () => updateParticipantList(room));
      room.on(RoomEvent.ParticipantDisconnected, () => updateParticipantList(room));

      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        if (speakers.length > 0) {
          setActiveSpeaker(speakers[0].identity);
        } else {
          setActiveSpeaker(null);
        }
      });

      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === Track.Kind.Video) {
          const el = remoteVideoRefs.current[participant.identity];
          if (el) {
            track.attach(el);
          }
        } else if (track.kind === Track.Kind.Audio) {
          const audioEl = track.attach();
          document.body.appendChild(audioEl);
        }
        updateParticipantList(room);
      });

      room.on(RoomEvent.TrackUnsubscribed, (track) => {
        track.detach();
        updateParticipantList(room);
      });

      // 4. Connect to Cloud Cluster
      await room.connect(tokenData.url, tokenData.token);

      // 5. Publish Local Media Tracks
      if (isCameraEnabled) {
        await room.localParticipant.setCameraEnabled(true);
        const camPub = room.localParticipant.getTrackPublication(Track.Source.Camera);
        if (camPub && camPub.track && localVideoRef.current) {
          camPub.track.attach(localVideoRef.current);
        }
      }

      if (isMicEnabled) {
        await room.localParticipant.setMicrophoneEnabled(true);
      }

    } catch (err) {
      console.error('LiveKit connection error:', err);
      setErrorMsg(err.message || 'Could not connect to LiveKit WebRTC Cloud.');
      setIsConnecting(false);
    }
  };

  // Helper to sync remote participant list
  const updateParticipantList = (room) => {
    if (!room) return;
    const participants = Array.from(room.remoteParticipants.values()).map(p => ({
      identity: p.identity,
      name: p.name || p.identity,
      isSpeaking: p.isSpeaking,
      isCameraEnabled: p.isCameraEnabled,
      isMicEnabled: p.isMicrophoneEnabled,
      tracks: Array.from(p.trackPublications.values())
    }));
    setRemoteParticipants(participants);
  };

  // Toggle Camera
  const toggleCamera = async () => {
    if (!roomRef.current) return;
    const nextState = !isCameraEnabled;
    setIsCameraEnabled(nextState);
    await roomRef.current.localParticipant.setCameraEnabled(nextState);

    if (nextState) {
      const pub = roomRef.current.localParticipant.getTrackPublication(Track.Source.Camera);
      if (pub && pub.track && localVideoRef.current) {
        pub.track.attach(localVideoRef.current);
      }
    }
  };

  // Toggle Microphone
  const toggleMicrophone = async () => {
    if (!roomRef.current) return;
    const nextState = !isMicEnabled;
    setIsMicEnabled(nextState);
    await roomRef.current.localParticipant.setMicrophoneEnabled(nextState);
  };

  // Toggle Screen Share
  const toggleScreenShare = async () => {
    if (!roomRef.current) return;
    try {
      const nextState = !isScreenSharing;
      setIsScreenSharing(nextState);
      await roomRef.current.localParticipant.setScreenShareEnabled(nextState);
    } catch (e) {
      console.warn('Screen share toggle cancelled or rejected:', e);
      setIsScreenSharing(false);
    }
  };

  // Leave Call
  const handleLeaveCall = () => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    setInCall(false);
    setConnectionState('disconnected');
    setIsScreenSharing(false);
    if (onClose) onClose();
  };

  return (
    <div className={`w-full rounded-2xl bg-[#0b0f17] border border-slate-800/80 overflow-hidden shadow-2xl flex flex-col ${embedded ? 'min-h-[500px]' : 'h-full'}`}>
      {/* Top Header Bar */}
      <div className="px-5 py-3.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-200 tracking-wider uppercase">
            LiveKit WebRTC Video & Audio Calling
          </span>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
            Room: {roomName}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            {connectionState === 'connected' ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5" /> 14ms LiveKit Cloud
              </span>
            ) : connectionState === 'connecting' ? (
              <span className="text-amber-400 flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 animate-pulse" /> Connecting...
              </span>
            ) : (
              <span className="text-slate-500 flex items-center gap-1">
                <WifiOff className="w-3.5 h-3.5" /> Idle
              </span>
            )}
          </div>

          {onClose && (
            <button
              onClick={handleLeaveCall}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 relative flex flex-col justify-between overflow-y-auto">
        {!inCall ? (
          /* Join Call Interface */
          <div className="max-w-md mx-auto my-auto w-full p-6 rounded-2xl bg-[#0f1523] border border-slate-800 shadow-xl space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Video className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-100">Join Video Conference</h4>
              <p className="text-xs text-slate-400">
                Peer-to-peer and multi-party MSME audio/video room powered by LiveKit Cloud.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleJoinCall} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Room Identifier</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. ai01-ops-room"
                  className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Your Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Operator Name"
                  className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              {/* Pre-join Device Toggles */}
              <div className="flex items-center justify-between pt-1 text-xs text-slate-300">
                <button
                  type="button"
                  onClick={() => setIsMicEnabled(!isMicEnabled)}
                  className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 transition cursor-pointer ${
                    isMicEnabled ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {isMicEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                  <span>{isMicEnabled ? 'Mic Active' : 'Mic Muted'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCameraEnabled(!isCameraEnabled)}
                  className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 transition cursor-pointer ${
                    isCameraEnabled ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {isCameraEnabled ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                  <span>{isCameraEnabled ? 'Camera Active' : 'Camera Off'}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isConnecting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Connecting to LiveKit...</span>
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4" />
                    <span>Join Room Now</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Active Call Video Grid */
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Local Video Tile */}
              <div className="relative aspect-video rounded-xl bg-[#090d15] border border-cyan-500/30 overflow-hidden shadow-lg flex items-center justify-center">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover ${!isCameraEnabled ? 'hidden' : ''}`}
                />
                {!isCameraEnabled && (
                  <div className="text-center space-y-1">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                      <VideoOff className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] text-slate-500">Camera Off</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-cyan-400 border border-slate-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>{displayName} (You)</span>
                </div>
              </div>

              {/* Remote Participants Video Tiles */}
              {remoteParticipants.map((p) => (
                <div 
                  key={p.identity} 
                  className={`relative aspect-video rounded-xl bg-[#090d15] border overflow-hidden shadow-lg flex items-center justify-center ${
                    activeSpeaker === p.identity ? 'border-cyan-400 ring-2 ring-cyan-400/30' : 'border-slate-800'
                  }`}
                >
                  <video
                    ref={(el) => {
                      if (el) remoteVideoRefs.current[p.identity] = el;
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-semibold text-slate-200 border border-slate-800 flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-indigo-400" />
                    <span>{p.name}</span>
                  </div>
                </div>
              ))}

              {/* If no remote participants */}
              {remoteParticipants.length === 0 && (
                <div className="aspect-video rounded-xl bg-[#090d15]/50 border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                  <Users className="w-8 h-8 mb-1.5 text-slate-600" />
                  <span className="text-xs font-semibold">Waiting for other participants...</span>
                  <span className="text-[10px] text-slate-600 mt-0.5">Share room "{roomName}" to connect</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Floating Call Controls (when in call) */}
        {inCall && (
          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={toggleMicrophone}
              className={`p-3 rounded-full border transition cursor-pointer shadow-lg ${
                isMicEnabled ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              }`}
              title={isMicEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleCamera}
              className={`p-3 rounded-full border transition cursor-pointer shadow-lg ${
                isCameraEnabled ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              }`}
              title={isCameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {isCameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`p-3 rounded-full border transition cursor-pointer shadow-lg ${
                isScreenSharing ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-cyan-500/30' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
            >
              <MonitorUp className="w-5 h-5" />
            </button>

            <button
              onClick={handleLeaveCall}
              className="px-5 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition cursor-pointer"
              title="Leave Conference"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Leave Call</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

