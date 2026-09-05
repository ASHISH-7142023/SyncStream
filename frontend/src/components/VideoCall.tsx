import React, { useEffect, useRef } from 'react';
import { useWebRTC } from '../context/WebRTCContext';
import { PhoneOff, Mic, MicOff, Video, VideoOff, MonitorUp } from 'lucide-react';

const VideoStream: React.FC<{ stream: MediaStream; muted?: boolean; isLocal?: boolean }> = ({ stream, muted = false, isLocal = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative rounded-xl overflow-hidden bg-surface-900 border border-surface-700/50 aspect-video flex-1 min-w-[200px] max-w-full shadow-lg">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
      />
      <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-xs font-medium text-white/90">
        {isLocal ? 'You' : 'Participant'}
      </div>
    </div>
  );
};

export const VideoCall: React.FC = () => {
  const {
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

  return (
    <div className="flex flex-col h-64 md:h-80 lg:h-96 w-full bg-surface-950 border-b border-surface-800 p-4 gap-4 transition-all duration-300">
      
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
