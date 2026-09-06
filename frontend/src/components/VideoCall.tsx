import React, { useEffect, useRef } from 'react';
import { useWebRTC } from '../context/WebRTCContext';
import { PhoneOff, Mic, MicOff, Video, VideoOff, MonitorUp, Maximize2, Minimize2 } from 'lucide-react';

const VideoStream: React.FC<{ stream: MediaStream; muted?: boolean; isLocal?: boolean }> = ({ stream, muted = false, isLocal = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative rounded-xl overflow-hidden bg-surface-900 border border-surface-700/50 aspect-video flex-1 min-w-[120px] max-w-full shadow-lg">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
      />
      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-medium text-white/90">
        {isLocal ? 'You' : 'Participant'}
      </div>
    </div>
  );
};

export const VideoCall: React.FC = () => {
  const [isMinimized, setIsMinimized] = React.useState(false);
  const {
    isCallActive,
    localStream,
    remoteStreams,
    leaveCall,
    toggleMute,
    toggleVideo,
    startScreenShare,
    isMuted,
    isVideoOff,
    isScreenSharing
  } = useWebRTC();

  const remoteStreamEntries = Object.entries(remoteStreams);
  const totalParticipants = 1 + remoteStreamEntries.length;
  
  // Calculate a decent grid layout
  const gridCols = totalParticipants === 1 ? 'grid-cols-1' :
                   totalParticipants === 2 ? 'grid-cols-2' :
                   totalParticipants <= 4 ? 'grid-cols-2 lg:grid-cols-2' :
                   'grid-cols-2 lg:grid-cols-3';

  if (!isCallActive) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-[100] bg-surface-900 border border-brand-500/30 p-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-scale-in">
        <div className="flex -space-x-2">
          {totalParticipants} in call
        </div>
        <div className="flex gap-2">
          <button onClick={toggleMute} className={`p-2 rounded-full ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-surface-800 text-surface-200'}`}>
            {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          <button onClick={() => setIsMinimized(false)} className="p-2 rounded-full bg-surface-800 hover:bg-surface-700 text-surface-200">
            <Maximize2 size={16} />
          </button>
          <button onClick={leaveCall} className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600">
            <PhoneOff size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col h-[400px] w-[350px] bg-surface-950/95 backdrop-blur-xl border border-surface-800/80 rounded-2xl p-4 gap-4 shadow-2xl transition-all duration-300 animate-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-bold text-white tracking-wider uppercase">Voice Connected</span>
        </div>
        <button onClick={() => setIsMinimized(true)} className="text-surface-400 hover:text-white p-1 rounded-lg transition-colors">
          <Minimize2 size={16} />
        </button>
      </div>
      {/* Video Grid */}
      {isScreenSharing ? (
        <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
          {/* Presentation Area */}
          <div className="lg:flex-[3] h-full flex items-center justify-center bg-black/40 rounded-xl overflow-hidden">
            {localStream && (
              <VideoStream stream={localStream} muted={true} isLocal={false} />
            )}
          </div>
          {/* Sidebar for Participants */}
          <div className="lg:flex-1 flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto custom-scrollbar p-1">
            {remoteStreamEntries.map(([userId, stream]) => (
              <div className="w-32 lg:w-full shrink-0" key={userId}>
                <VideoStream stream={stream} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={`flex-1 grid ${gridCols} gap-4 overflow-y-auto custom-scrollbar content-center justify-items-center`}>
          {localStream && (
            <VideoStream stream={localStream} muted={true} isLocal={true} />
          )}
          {remoteStreamEntries.map(([userId, stream]) => (
            <VideoStream key={userId} stream={stream} />
          ))}
          {!localStream && (
            <div className="flex items-center justify-center text-surface-400 animate-pulse w-full h-full">
              Starting camera...
            </div>
          )}
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex items-center justify-center gap-3 mt-auto pt-2">
        <button
          onClick={toggleMute}
          className={`p-3 rounded-full transition-all ${
            isMuted ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-surface-800 text-surface-200 hover:bg-surface-700'
          }`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full transition-all ${
            isVideoOff ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-surface-800 text-surface-200 hover:bg-surface-700'
          }`}
          title={isVideoOff ? "Turn on camera" : "Turn off camera"}
        >
          {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
        </button>

        <button
          onClick={startScreenShare}
          className={`p-3 rounded-full transition-all ${
            isScreenSharing ? 'bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 ring-1 ring-brand-500/50' : 'bg-surface-800 text-surface-200 hover:bg-surface-700'
          }`}
          title={isScreenSharing ? "Stop sharing screen" : "Share screen"}
        >
          <MonitorUp size={20} />
        </button>

        <div className="w-px h-8 bg-surface-700 mx-2"></div>

        <button
          onClick={leaveCall}
          className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
          title="Leave Call"
        >
          <PhoneOff size={20} />
        </button>
      </div>
    </div>
  );
};
