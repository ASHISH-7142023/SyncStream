import React, { useEffect, useRef } from 'react';
import { useWebRTC } from '../context/WebRTCContext';

const VideoPlayer: React.FC<{ stream: MediaStream; isLocal?: boolean }> = ({ stream, isLocal }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isLocal}
      className={`w-full h-full object-cover rounded-xl border border-white/10 shadow-lg ${isLocal ? 'transform scale-x-[-1]' : ''}`}
    />
  );
};

export const VideoCall: React.FC = () => {
  const { 
    localStream, 
    remoteStreams, 
    isCalling, 
    endCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    audioEnabled,
    videoEnabled,
    isScreenSharing
  } = useWebRTC();

  if (!isCalling) return null;

  const remoteUsers = Object.keys(remoteStreams);

  return (
    <div className="w-full bg-[#151722] p-4 rounded-xl mb-4 border border-[#7c3aed]/20 shadow-xl relative animate-fade-in-up">
      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[200px]">
        {/* Local Video */}
        {localStream && (
          <div className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center">
            <VideoPlayer stream={localStream} isLocal={!isScreenSharing} />
            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white backdrop-blur-md flex items-center gap-2">
              <span>You {isScreenSharing ? '(Screen)' : ''}</span>
              {!audioEnabled && (
                <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path></svg>
              )}
            </div>
          </div>
        )}

        {/* Remote Videos */}
        {remoteUsers.map(userId => (
          <div key={userId} className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center">
            <VideoPlayer stream={remoteStreams[userId]} />
            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white backdrop-blur-md">
              Peer
            </div>
          </div>
        ))}
      </div>

      {/* Call Controls */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button 
          onClick={toggleAudio}
          className={`p-3 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${audioEnabled ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50'}`}
        >
          {audioEnabled ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path></svg>
          )}
        </button>
        <button 
          onClick={toggleVideo}
          className={`p-3 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${videoEnabled ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50'}`}
        >
          {videoEnabled ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
          )}
        </button>
        <button 
          onClick={toggleScreenShare}
          className={`p-3 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${isScreenSharing ? 'bg-[#7c3aed] text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]' : 'bg-white/10 hover:bg-white/20 text-white'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
        </button>
        <button 
          onClick={endCall}
          className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 11l-2 2m0 0l-2-2m2 2l2-2m-2 2l-2 2M10.5 19.5L12 21l1.5-1.5M12 21v-8m0 0V5m0 8h8m-8 0H4"></path></svg>
        </button>
      </div>
    </div>
  );
};
