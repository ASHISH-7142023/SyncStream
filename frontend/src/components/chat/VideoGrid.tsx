import React, { useEffect, useRef } from 'react';
import { getAvatarForUser } from '../../utils/avatarHelper';

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  isMicOn: boolean;
  isVideoOn: boolean;
  toggleMic: () => void;
  toggleVideo: () => void;
  leaveCall: () => void;
  presenceUsers: Record<string, any>;
  currentUsername: string;
}

const VideoStream: React.FC<{ stream: MediaStream; muted?: boolean; username: string; presenceUsers: any }> = ({ stream, muted = false, username, presenceUsers }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideoEnabled = stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled;

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative bg-[#0f111a] rounded-xl overflow-hidden shadow-lg border border-white/5 aspect-video flex items-center justify-center">
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
      />
      
      {/* Avatar Fallback if video is disabled */}
      {!isVideoEnabled && (
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-16 h-16 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center text-3xl">
            {getAvatarForUser(username, presenceUsers)}
          </div>
          <span className="text-white font-medium text-sm">{username}</span>
        </div>
      )}

      {/* Name Overlay */}
      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md flex items-center gap-2 text-xs font-medium text-white border border-white/10">
        {!stream.getAudioTracks()[0]?.enabled && (
          <i className="fa-solid fa-microphone-slash text-red-500"></i>
        )}
        <span>{username} {muted ? '(You)' : ''}</span>
      </div>
    </div>
  );
};

export const VideoGrid: React.FC<VideoGridProps> = ({
  localStream,
  remoteStreams,
  isMicOn,
  isVideoOn,
  toggleMic,
  toggleVideo,
  leaveCall,
  presenceUsers,
  currentUsername
}) => {
  // Determine grid columns based on number of participants
  const totalParticipants = 1 + Object.keys(remoteStreams).length;
  const gridCols = totalParticipants === 1 ? 'grid-cols-1' :
                   totalParticipants === 2 ? 'grid-cols-2' :
                   totalParticipants <= 4 ? 'grid-cols-2 lg:grid-cols-2' :
                   'grid-cols-2 lg:grid-cols-3';

  return (
    <div className="flex flex-col bg-[#1f2233] border-b border-white/5 shadow-md z-10 p-4 transition-all animate-scale-in">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          <h2 className="text-white font-semibold">Video Call in Progress</h2>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMic}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isMicOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
            }`}
            title={isMicOn ? 'Mute' : 'Unmute'}
          >
            <i className={`fa-solid ${isMicOn ? 'fa-microphone' : 'fa-microphone-slash'}`}></i>
          </button>
          
          <button
            onClick={toggleVideo}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isVideoOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
            }`}
            title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
          >
            <i className={`fa-solid ${isVideoOn ? 'fa-video' : 'fa-video-slash'}`}></i>
          </button>
          
          <button
            onClick={leaveCall}
            className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all shadow-lg"
            title="Leave Call"
          >
            <i className="fa-solid fa-phone-slash"></i>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className={`grid gap-4 w-full ${gridCols}`}>
        {/* Local Stream */}
        {localStream && (
          <VideoStream
            stream={localStream}
            muted={true}
            username={currentUsername}
            presenceUsers={presenceUsers}
          />
        )}

        {/* Remote Streams */}
        {Object.entries(remoteStreams).map(([userId, stream]) => {
          // Find username from presence
          const username = Object.values(presenceUsers).find(p => p.userId === userId)?.username || 'User';
          return (
            <VideoStream
              key={userId}
              stream={stream}
              username={username}
              presenceUsers={presenceUsers}
            />
          );
        })}
      </div>
    </div>
  );
};
