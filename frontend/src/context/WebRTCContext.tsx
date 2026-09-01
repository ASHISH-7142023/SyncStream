import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useSocket } from './SocketContext';

interface WebRTCContextType {
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>; // userId -> stream
  isCalling: boolean;
  isScreenSharing: boolean;
  startCall: (roomId: string) => Promise<void>;
  joinCall: (roomId: string) => Promise<void>;
  endCall: () => void;
  toggleScreenShare: () => Promise<void>;
  toggleAudio: () => void;
  toggleVideo: () => void;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

const WebRTCContext = createContext<WebRTCContextType | undefined>(undefined);

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const WebRTCProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { sendWebRtcSignal, onWebRtcSignal } = useSocket();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [isCalling, setIsCalling] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const activeRoomId = useRef<string | null>(null);
  const peers = useRef<Record<string, RTCPeerConnection>>({}); // userId -> peerConnection

  useEffect(() => {
    // Listen for WebRTC signals from the socket
    const unsubscribe = onWebRtcSignal(async (signal) => {
      if (!isCalling && signal.type !== 'join-call') return; // Ignore if not in call

      const { type, senderId, roomId } = signal;
      
      // If someone wants to join the call, generate an offer and send it back
      if (type === 'join-call') {
        if (!isCalling) return; // We are not in a call
        const pc = createPeerConnection(senderId, roomId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendWebRtcSignal(roomId, {
          type: 'offer',
          targetId: senderId,
          sdp: offer
        });
      }

      if (type === 'offer') {
        if (!isCalling) return;
        const pc = createPeerConnection(senderId, roomId);
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendWebRtcSignal(roomId, {
          type: 'answer',
          targetId: senderId,
          sdp: answer
        });
      }

      if (type === 'answer') {
        const pc = peers.current[senderId];
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        }
      }

      if (type === 'ice-candidate') {
        const pc = peers.current[senderId];
        if (pc && signal.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          } catch (e) {
            console.error('Error adding ICE candidate', e);
          }
        }
      }
      
      if (type === 'leave-call') {
         cleanupPeer(senderId);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isCalling, onWebRtcSignal, sendWebRtcSignal]);

  const createPeerConnection = (peerId: string, roomId: string) => {
    if (peers.current[peerId]) {
      return peers.current[peerId];
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peers.current[peerId] = pc;

    // Add local stream tracks to the connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendWebRtcSignal(roomId, {
          type: 'ice-candidate',
          targetId: peerId,
          candidate: event.candidate
        });
      }
    };

    // Handle incoming media streams
    pc.ontrack = (event) => {
      const [stream] = event.streams;
      setRemoteStreams(prev => ({
        ...prev,
        [peerId]: stream
      }));
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        cleanupPeer(peerId);
      }
    };

    return pc;
  };

  const cleanupPeer = (peerId: string) => {
    const pc = peers.current[peerId];
    if (pc) {
      pc.close();
      delete peers.current[peerId];
    }
    setRemoteStreams(prev => {
      const updated = { ...prev };
      delete updated[peerId];
      return updated;
    });
  };

  const getMediaStream = async (video: boolean = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video, audio: true });
      setLocalStream(stream);
      return stream;
    } catch (e) {
      console.error('Failed to get media devices', e);
      // Try audio only if video fails (e.g. no webcam)
      const audioStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
      setLocalStream(audioStream);
      return audioStream;
    }
  };

  const startCall = async (roomId: string) => {
    const stream = await getMediaStream();
    if (!stream) return;
    
    setIsCalling(true);
    activeRoomId.current = roomId;
    
    // Announce to the room that we are joining/starting a call
    sendWebRtcSignal(roomId, { type: 'join-call' });
  };

  const joinCall = async (roomId: string) => {
    // Same as startCall for mesh network
    await startCall(roomId);
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    // Clean up all peer connections
    Object.keys(peers.current).forEach(peerId => cleanupPeer(peerId));
    peers.current = {};
    
    if (activeRoomId.current) {
      sendWebRtcSignal(activeRoomId.current, { type: 'leave-call' });
    }
    
    setIsCalling(false);
    setIsScreenSharing(false);
    setRemoteStreams({});
    activeRoomId.current = null;
  };

  const toggleScreenShare = async () => {
    if (!isCalling || !localStream) return;

    if (isScreenSharing) {
       // Revert to camera
       endScreenShare();
       return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      
      // Replace video track for all peers
      Object.values(peers.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenTrack);
        }
      });
      
      // Update local stream to show screen share
      const newStream = new MediaStream([screenTrack, localStream.getAudioTracks()[0]]);
      setLocalStream(newStream);
      setIsScreenSharing(true);
      
      // Listen for browser's native "Stop Sharing" button
      screenTrack.onended = () => {
        endScreenShare();
      };
    } catch (e) {
      console.error('Failed to get display media', e);
    }
  };

  const endScreenShare = async () => {
    // Revert to camera
    const stream = await navigator.mediaDevices.getUserMedia({ video: videoEnabled, audio: audioEnabled });
    const videoTrack = stream.getVideoTracks()[0];
    
    Object.values(peers.current).forEach(pc => {
      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (sender && videoTrack) {
        sender.replaceTrack(videoTrack);
      }
    });
    
    setLocalStream(stream);
    setIsScreenSharing(false);
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  return (
    <WebRTCContext.Provider
      value={{
        localStream,
        remoteStreams,
        isCalling,
        isScreenSharing,
        startCall,
        joinCall,
        endCall,
        toggleScreenShare,
        toggleAudio,
        toggleVideo,
        audioEnabled,
        videoEnabled
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};

export const useWebRTC = () => {
  const context = useContext(WebRTCContext);
  if (context === undefined) {
    throw new Error('useWebRTC must be used within a WebRTCProvider');
  }
  return context;
};
