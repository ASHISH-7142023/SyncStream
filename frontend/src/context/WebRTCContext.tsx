import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import type { IMessage } from '@stomp/stompjs';

interface WebRTCContextType {
  isCallActive: boolean;
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  joinCall: (roomId: string) => Promise<void>;
  leaveCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  startScreenShare: () => Promise<void>;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
}

const WebRTCContext = createContext<WebRTCContextType | undefined>(undefined);

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const WebRTCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { getStompClient } = useSocket();

  const [isCallActive, setIsCallActive] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const peersRef = useRef<Record<string, RTCPeerConnection>>({});
  const subscriptionRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const sendSignal = useCallback((roomId: string, type: string, targetId: string | null, payload: any = {}) => {
    const client = getStompClient();
    if (client && client.active) {
      client.publish({
        destination: `/app/rooms/${roomId}/webrtc`,
        body: JSON.stringify({
          type,
          targetId,
          ...payload,
        }),
      });
    }
  }, [getStompClient]);

  const createPeerConnection = useCallback((roomId: string, targetId: string) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal(roomId, 'candidate', targetId, { candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStreams((prev) => ({
        ...prev,
        [targetId]: event.streams[0],
      }));
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'closed') {
        setRemoteStreams((prev) => {
          const next = { ...prev };
          delete next[targetId];
          return next;
        });
        delete peersRef.current[targetId];
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    peersRef.current[targetId] = pc;
    return pc;
  }, [sendSignal]);

  const handleSignal = useCallback(async (roomId: string, signal: any) => {
    if (signal.senderId === user?.id) return; // Ignore own signals
    if (signal.targetId && signal.targetId !== user?.id) return; // Ignore signals not meant for us

    const { type, senderId, sdp, candidate } = signal;

    if (type === 'join') {
      // Create offer for the new peer
      const pc = createPeerConnection(roomId, senderId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal(roomId, 'offer', senderId, { sdp: pc.localDescription });
    } else if (type === 'offer') {
      const pc = peersRef.current[senderId] || createPeerConnection(roomId, senderId);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal(roomId, 'answer', senderId, { sdp: pc.localDescription });
    } else if (type === 'answer') {
      const pc = peersRef.current[senderId];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      }
    } else if (type === 'candidate') {
      const pc = peersRef.current[senderId];
      if (pc && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e));
      }
    } else if (type === 'leave') {
      const pc = peersRef.current[senderId];
      if (pc) {
        pc.close();
        delete peersRef.current[senderId];
        setRemoteStreams((prev) => {
          const next = { ...prev };
          delete next[senderId];
          return next;
        });
      }
    }
  }, [user, createPeerConnection, sendSignal]);

  const joinCall = async (roomId: string) => {
    if (isCallActive) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      localStreamRef.current = stream;
      setIsCallActive(true);
      setActiveRoomId(roomId);
      setIsMuted(false);
      setIsVideoOff(false);

      const client = getStompClient();
      if (client && client.active) {
        subscriptionRef.current = client.subscribe(`/topic/rooms/${roomId}/webrtc`, (message: IMessage) => {
          const signal = JSON.parse(message.body);
          handleSignal(roomId, signal);
        });

        // Announce join
        sendSignal(roomId, 'join', null);
      }
    } catch (e) {
      console.error('Error accessing media devices.', e);
    }
  };

  const leaveCall = useCallback(() => {
    if (!isCallActive || !activeRoomId) return;

    sendSignal(activeRoomId, 'leave', null);

    Object.values(peersRef.current).forEach(pc => pc.close());
    peersRef.current = {};
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    setLocalStream(null);
    localStreamRef.current = null;
    setRemoteStreams({});
    setIsCallActive(false);
    setActiveRoomId(null);
    setIsScreenSharing(false);
  }, [isCallActive, activeRoomId, sendSignal]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const startScreenShare = async () => {
    if (!localStreamRef.current) return;
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        
        // Listen for user stopping screen share via browser UI
        screenTrack.onended = () => {
          stopScreenShare();
        };

        // Replace track for all peers
        Object.values(peersRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        });

        // Replace local stream video track
        const newStream = new MediaStream([screenTrack, ...localStreamRef.current.getAudioTracks()]);
        setLocalStream(newStream);
        setIsScreenSharing(true);
      } else {
        stopScreenShare();
      }
    } catch (e) {
      console.error('Error sharing screen', e);
    }
  };

  const stopScreenShare = async () => {
    try {
      // Get camera stream back
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const cameraTrack = cameraStream.getVideoTracks()[0];
      cameraTrack.enabled = !isVideoOff;

      Object.values(peersRef.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(cameraTrack);
        }
      });

      if (localStreamRef.current) {
        const newStream = new MediaStream([cameraTrack, ...localStreamRef.current.getAudioTracks()]);
        setLocalStream(newStream);
        localStreamRef.current = newStream;
      }
      setIsScreenSharing(false);
    } catch (e) {
      console.error('Error stopping screen share', e);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isCallActive) leaveCall();
    };
  }, [isCallActive, leaveCall]);

  return (
    <WebRTCContext.Provider
      value={{
        isCallActive,
        localStream,
        remoteStreams,
        joinCall,
        leaveCall,
        toggleMute,
        toggleVideo,
        startScreenShare,
        isMuted,
        isVideoOff,
        isScreenSharing
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
