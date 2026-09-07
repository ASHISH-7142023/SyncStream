import { useState, useEffect, useRef, useCallback } from 'react';
import type { WebRtcSignal } from '../context/SocketContext';
import { Client } from '@stomp/stompjs';

interface UseWebRTCProps {
  roomId: string;
  userId: string;
  username: string;
  getStompClient: () => Client | null;
  sendWebRtcSignal: (signal: WebRtcSignal) => void;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const useWebRTC = ({ roomId, userId, username, getStompClient, sendWebRtcSignal }: UseWebRTCProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [inCall, setInCall] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Record<string, RTCPeerConnection>>({});
  const subRef = useRef<any>(null);

  // Set up local stream
  const startCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      localStreamRef.current = stream;
      setInCall(true);

      const client = getStompClient();
      if (client && client.connected) {
        // Subscribe to incoming WebRTC signals
        subRef.current = client.subscribe(`/topic/rooms/${roomId}/webrtc`, (message) => {
          const signal: WebRtcSignal = JSON.parse(message.body);
          handleSignal(signal);
        });

        // Broadcast join message
        sendWebRtcSignal({
          type: 'join',
          roomId,
          senderId: userId,
          senderUsername: username,
          targetId: null
        });
      }
    } catch (err) {
      console.error('Failed to get local media', err);
      alert('Could not access camera or microphone.');
    }
  }, [roomId, userId, username, getStompClient, sendWebRtcSignal]);

  const leaveCall = useCallback(() => {
    // Stop local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      setLocalStream(null);
      localStreamRef.current = null;
    }

    // Close all peer connections
    Object.values(peersRef.current).forEach(peer => peer.close());
    peersRef.current = {};
    setRemoteStreams({});

    // Unsubscribe from STOMP
    if (subRef.current) {
      subRef.current.unsubscribe();
      subRef.current = null;
    }

    // Notify others
    sendWebRtcSignal({
      type: 'leave',
      roomId,
      senderId: userId,
      senderUsername: username,
      targetId: null
    });
    
    setInCall(false);
  }, [roomId, userId, username, sendWebRtcSignal]);

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const createPeerConnection = (targetUserId: string) => {
    if (peersRef.current[targetUserId]) {
      return peersRef.current[targetUserId];
    }

    const peer = new RTCPeerConnection(ICE_SERVERS);
    peersRef.current[targetUserId] = peer;

    // Add local stream tracks to the peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        if (localStreamRef.current) {
          peer.addTrack(track, localStreamRef.current);
        }
      });
    }

    // Handle incoming remote tracks
    peer.ontrack = (event) => {
      setRemoteStreams((prev) => ({
        ...prev,
        [targetUserId]: event.streams[0],
      }));
    };

    // Handle ICE candidates
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        sendWebRtcSignal({
          type: 'candidate',
          roomId,
          senderId: userId,
          senderUsername: username,
          targetId: targetUserId,
          candidate: event.candidate,
        });
      }
    };

    // Handle connection state changes
    peer.oniceconnectionstatechange = () => {
      if (peer.iceConnectionState === 'disconnected' || peer.iceConnectionState === 'failed' || peer.iceConnectionState === 'closed') {
        setRemoteStreams((prev) => {
          const newStreams = { ...prev };
          delete newStreams[targetUserId];
          return newStreams;
        });
        peer.close();
        delete peersRef.current[targetUserId];
      }
    };

    return peer;
  };

  const handleSignal = async (signal: WebRtcSignal) => {
    // Ignore our own signals
    if (signal.senderId === userId) return;
    
    // Ignore signals targeted at someone else
    if (signal.targetId && signal.targetId !== userId) return;

    try {
      if (signal.type === 'join') {
        // Another user joined, initiate connection
        const peer = createPeerConnection(signal.senderId);
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        sendWebRtcSignal({
          type: 'offer',
          roomId,
          senderId: userId,
          senderUsername: username,
          targetId: signal.senderId,
          sdp: peer.localDescription
        });
      } else if (signal.type === 'leave') {
        const peer = peersRef.current[signal.senderId];
        if (peer) {
          peer.close();
          delete peersRef.current[signal.senderId];
        }
        setRemoteStreams((prev) => {
          const newStreams = { ...prev };
          delete newStreams[signal.senderId];
          return newStreams;
        });
      } else if (signal.type === 'offer' && signal.sdp) {
        const peer = createPeerConnection(signal.senderId);
        await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        sendWebRtcSignal({
          type: 'answer',
          roomId,
          senderId: userId,
          senderUsername: username,
          targetId: signal.senderId,
          sdp: peer.localDescription
        });
      } else if (signal.type === 'answer' && signal.sdp) {
        const peer = peersRef.current[signal.senderId];
        if (peer && peer.signalingState !== 'stable') {
          await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        }
      } else if (signal.type === 'candidate' && signal.candidate) {
        const peer = peersRef.current[signal.senderId];
        if (peer) {
          await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      }
    } catch (e) {
      console.error('Error handling WebRTC signal', e);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (inCall) {
        leaveCall();
      }
    };
  }, [inCall, leaveCall]);

  return {
    inCall,
    localStream,
    remoteStreams,
    isMicOn,
    isVideoOn,
    startCall,
    leaveCall,
    toggleMic,
    toggleVideo,
  };
};
