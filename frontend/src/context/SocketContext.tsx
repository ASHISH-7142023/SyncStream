import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Client } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
import { useAuth } from './AuthContext';
import api from '../services/api';

export type ConnectionStatus = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED';

export interface ChatMessage {
  id?: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  messageType: 'TEXT' | 'JOIN' | 'LEAVE' | 'SYSTEM';
  createdAt: string;
  sequenceNumber: number;
  // Local state helper for message reliability
  status?: 'SENDING' | 'SENT' | 'FAILED';
  clientMessageId?: string;
}

export interface UserPresence {
  userId: string;
  username: string;
  serverId: string | null;
  status: 'ONLINE' | 'AWAY' | 'OFFLINE';
  lastSeen: string;
}

interface SocketContextType {
  connectionStatus: ConnectionStatus;
  messages: Record<string, ChatMessage[]>;
  typingUsers: Record<string, Record<string, boolean>>; // roomId -> { username: isTyping }
  presenceUsers: Record<string, UserPresence>; // userId -> presence
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, content: string, clientMessageId: string) => void;
  sendTyping: (roomId: string, isTyping: boolean) => void;
  loadMessages: (roomId: string) => Promise<void>;
  hasMoreMessages: Record<string, boolean>;
  loadMoreMessages: (roomId: string) => Promise<void>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('DISCONNECTED');
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, Record<string, boolean>>>({});
  const [presenceUsers, setPresenceUsers] = useState<Record<string, UserPresence>>({});
  
  // Track pagination metadata
  const [messagePages, setMessagePages] = useState<Record<string, number>>({});
  const [hasMoreMessages, setHasMoreMessages] = useState<Record<string, boolean>>({});

  const clientRef = useRef<Client | null>(null);
  const activeRoomsRef = useRef<Set<String>>(new Set());
  const subscriptionsRef = useRef<Record<string, any>>({}); // topic -> subscription object
  const messagesRef = useRef<Record<string, ChatMessage[]>>({}); // keep mutable ref of messages to avoid closures

  // Keep ref up to date
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Connect / Disconnect WebSocket based on Auth state
  useEffect(() => {
    if (user && token) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [user, token]);

  const connectSocket = () => {
    if (clientRef.current && clientRef.current.active) return;

    setConnectionStatus('CONNECTING');

    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log('[STOMP DEBUG]', str);
      },
    });

    client.onConnect = () => {
      console.log('STOMP Connected successfully!');
      setConnectionStatus('CONNECTED');

      // Subscribe to global presence channel
      const presenceSub = client.subscribe('/topic/presence', (message: IMessage) => {
        try {
          const presence: UserPresence = JSON.parse(message.body);
          setPresenceUsers((prev) => ({
            ...prev,
            [presence.userId]: presence,
          }));
        } catch (e) {
          console.error('Error parsing presence update', e);
        }
      });
      subscriptionsRef.current['/topic/presence'] = presenceSub;

      // Re-subscribe to existing rooms and sync missed messages
      const activeRooms = Array.from(activeRoomsRef.current);
      activeRooms.forEach(async (roomId) => {
        subscribeToRoom(client, roomId as string);
        await syncMissedMessages(roomId as string);
        fetchRoomPresence(roomId as string);
      });
    };

    client.onDisconnect = () => {
      console.log('STOMP Disconnected!');
      setConnectionStatus('DISCONNECTED');
    };

    client.onStompError = (frame) => {
      console.error('STOMP broker error:', frame.headers['message']);
      console.error('Additional details:', frame.body);
      setConnectionStatus('DISCONNECTED');
    };

    client.onWebSocketClose = () => {
      console.log('WebSocket closed.');
      setConnectionStatus('DISCONNECTED');
    };

    clientRef.current = client;
    client.activate();
  };

  const disconnectSocket = () => {
    if (clientRef.current) {
      // Unsubscribe all
      Object.keys(subscriptionsRef.current).forEach((topic) => {
        subscriptionsRef.current[topic].unsubscribe();
      });
      subscriptionsRef.current = {};
      
      clientRef.current.deactivate();
      clientRef.current = null;
    }
    setConnectionStatus('DISCONNECTED');
  };

  const subscribeToRoom = (client: Client, roomId: string) => {
    const chatTopic = `/topic/rooms/${roomId}`;
    const typingTopic = `/topic/rooms/${roomId}/typing`;

    // Subscribe to chat messages
    if (!subscriptionsRef.current[chatTopic]) {
      const chatSub = client.subscribe(chatTopic, (message: IMessage) => {
        try {
          const chatMsg: ChatMessage = JSON.parse(message.body);
          
          setMessages((prev) => {
            const currentRoomMsgs = prev[roomId] || [];
            
            // Avoid duplicate rendering by checking sequence number or clientMessageId
            const duplicate = currentRoomMsgs.some(
              (m) => m.sequenceNumber === chatMsg.sequenceNumber || 
                     (chatMsg.clientMessageId && m.clientMessageId === chatMsg.clientMessageId)
            );
            
            if (duplicate) {
              // Update status from SENDING to SENT for matching local messages
              return {
                ...prev,
                [roomId]: currentRoomMsgs.map((m) => {
                  if (chatMsg.clientMessageId && m.clientMessageId === chatMsg.clientMessageId) {
                    return { ...chatMsg, status: 'SENT' as const };
                  }
                  return m;
                }),
              };
            }

            return {
              ...prev,
              [roomId]: [...currentRoomMsgs, { ...chatMsg, status: 'SENT' as const }].sort(
                (a, b) => a.sequenceNumber - b.sequenceNumber
              ),
            };
          });
        } catch (e) {
          console.error('Error parsing room message', e);
        }
      });
      subscriptionsRef.current[chatTopic] = chatSub;
    }

    // Subscribe to typing notifications
    if (!subscriptionsRef.current[typingTopic]) {
      const typingSub = client.subscribe(typingTopic, (message: IMessage) => {
        try {
          const event = JSON.parse(message.body);
          const { username, isTyping } = event;
          
          setTypingUsers((prev) => {
            const roomTyping = prev[roomId] || {};
            return {
              ...prev,
              [roomId]: {
                ...roomTyping,
                [username]: isTyping,
              },
            };
          });
        } catch (e) {
          console.error('Error parsing typing event', e);
        }
      });
      subscriptionsRef.current[typingTopic] = typingSub;
    }
  };

  const syncMissedMessages = async (roomId: string) => {
    const currentRoomMsgs = messagesRef.current[roomId] || [];
    if (currentRoomMsgs.length === 0) return;

    // Get max sequence number currently stored locally
    const maxSeq = currentRoomMsgs.reduce(
      (max, m) => (m.sequenceNumber > max ? m.sequenceNumber : max),
      0
    );

    try {
      const response = await api.get(`/api/rooms/${roomId}/messages/after`, {
        params: { seq: maxSeq },
      });
      
      const missedMsgs: ChatMessage[] = response.data;
      if (missedMsgs.length > 0) {
        console.log(`Syncing ${missedMsgs.length} missed messages for room: ${roomId}`);
        setMessages((prev) => {
          const existing = prev[roomId] || [];
          const merged = [...existing];
          
          missedMsgs.forEach((msg) => {
            const index = merged.findIndex(
              (m) => m.sequenceNumber === msg.sequenceNumber ||
                     (msg.clientMessageId && m.clientMessageId === msg.clientMessageId)
            );
            if (index !== -1) {
              merged[index] = { ...msg, status: 'SENT' };
            } else {
              merged.push({ ...msg, status: 'SENT' });
            }
          });

          return {
            ...prev,
            [roomId]: merged.sort((a, b) => a.sequenceNumber - b.sequenceNumber),
          };
        });
      }
    } catch (e) {
      console.error('Failed to sync missed messages', e);
    }
  };

  const fetchRoomPresence = async (roomId: string) => {
    try {
      const response = await api.get(`/api/rooms/${roomId}/presence`);
      const presenceData = response.data;
      setPresenceUsers((prev) => ({
        ...prev,
        ...presenceData,
      }));
    } catch (e) {
      console.error('Failed to fetch room presence', e);
    }
  };

  const joinRoom = (roomId: string) => {
    activeRoomsRef.current.add(roomId);
    fetchRoomPresence(roomId);
    if (clientRef.current && connectionStatus === 'CONNECTED') {
      subscribeToRoom(clientRef.current, roomId);
    }
  };

  const leaveRoom = (roomId: string) => {
    activeRoomsRef.current.delete(roomId);
    
    // Unsubscribe from STOMP topics
    const chatTopic = `/topic/rooms/${roomId}`;
    const typingTopic = `/topic/rooms/${roomId}/typing`;

    if (subscriptionsRef.current[chatTopic]) {
      subscriptionsRef.current[chatTopic].unsubscribe();
      delete subscriptionsRef.current[chatTopic];
    }
    if (subscriptionsRef.current[typingTopic]) {
      subscriptionsRef.current[typingTopic].unsubscribe();
      delete subscriptionsRef.current[typingTopic];
    }
  };

  const sendMessage = (roomId: string, content: string, clientMessageId: string) => {
    if (!clientRef.current || connectionStatus !== 'CONNECTED') {
      // Append as failed message locally
      const failedMsg: ChatMessage = {
        roomId,
        senderId: user?.id || 'me',
        senderName: user?.username || 'me',
        content,
        messageType: 'TEXT',
        createdAt: new Date().toISOString(),
        sequenceNumber: -1,
        status: 'FAILED',
        clientMessageId,
      };

      setMessages((prev) => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), failedMsg],
      }));
      return;
    }

    // Append as sending message locally
    const sendingMsg: ChatMessage = {
      roomId,
      senderId: user?.id || 'me',
      senderName: user?.username || 'me',
      content,
      messageType: 'TEXT',
      createdAt: new Date().toISOString(),
      sequenceNumber: -1,
      status: 'SENDING',
      clientMessageId,
    };

    setMessages((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), sendingMsg],
    }));

    clientRef.current.publish({
      destination: `/app/rooms/${roomId}/message`,
      body: JSON.stringify({ content, clientMessageId }),
    });
  };

  const sendTyping = (roomId: string, isTyping: boolean) => {
    if (!clientRef.current || connectionStatus !== 'CONNECTED') return;

    clientRef.current.publish({
      destination: `/app/rooms/${roomId}/typing`,
      body: JSON.stringify({ isTyping }),
    });
  };

  const loadMessages = async (roomId: string) => {
    if (messages[roomId] && messages[roomId].length > 0) return; // already loaded

    try {
      const response = await api.get(`/api/rooms/${roomId}/messages`, {
        params: { page: 0, size: 40 },
      });
      const data = response.data;
      
      // Reverse history messages from Mongo so they render chronological (ascending seq)
      const formattedMsgs = [...data.content].reverse().map((m: ChatMessage) => ({
        ...m,
        status: 'SENT' as const,
      }));

      setMessages((prev) => ({
        ...prev,
        [roomId]: formattedMsgs,
      }));

      setMessagePages((prev) => ({ ...prev, [roomId]: 0 }));
      setHasMoreMessages((prev) => ({ ...prev, [roomId]: !data.last }));
    } catch (e) {
      console.error('Failed to load room messages', e);
    }
  };

  const loadMoreMessages = async (roomId: string) => {
    if (!hasMoreMessages[roomId]) return;

    const nextPage = (messagePages[roomId] || 0) + 1;

    try {
      const response = await api.get(`/api/rooms/${roomId}/messages`, {
        params: { page: nextPage, size: 40 },
      });
      const data = response.data;
      
      const formattedMsgs = [...data.content].reverse().map((m: ChatMessage) => ({
        ...m,
        status: 'SENT' as const,
      }));

      setMessages((prev) => {
        const existing = prev[roomId] || [];
        // Prepend older messages at the start of the array
        return {
          ...prev,
          [roomId]: [...formattedMsgs, ...existing],
        };
      });

      setMessagePages((prev) => ({ ...prev, [roomId]: nextPage }));
      setHasMoreMessages((prev) => ({ ...prev, [roomId]: !data.last }));
    } catch (e) {
      console.error('Failed to load more messages', e);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        connectionStatus,
        messages,
        typingUsers,
        presenceUsers,
        joinRoom,
        leaveRoom,
        sendMessage,
        sendTyping,
        loadMessages,
        hasMoreMessages,
        loadMoreMessages,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
