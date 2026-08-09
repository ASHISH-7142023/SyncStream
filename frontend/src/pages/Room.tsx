import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import type { ChatMessage } from '../context/SocketContext';
import api from '../services/api';
import { 
  Send, Users, ArrowLeft, Loader, AlertTriangle, 
  Menu, X, Sparkles, MessageSquare, AlertCircle, RefreshCw 
} from 'lucide-react';

interface RoomDetails {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: string[];
}

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    connectionStatus, messages, typingUsers, presenceUsers,
    joinRoom, leaveRoom, sendMessage, sendTyping, loadMessages,
    hasMoreMessages, loadMoreMessages 
  } = useSocket();

  const [room, setRoom] = useState<RoomDetails | null>(null);
  const [inputText, setInputText] = useState('');
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [rooms, setRooms] = useState<any[]>([]);
  
  // Responsive sidebar drawers
  const [showSidebar, setShowSidebar] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  
  const feedEndRef = useRef<HTMLDivElement | null>(null);
  const feedContainerRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<any>(null);
  const isTypingRef = useRef(false);

  // Load active room details and other rooms
  useEffect(() => {
    if (!roomId) return;

    const initRoom = async () => {
      setLoadingRoom(true);
      try {
        const [roomRes, roomsRes] = await Promise.all([
          api.get(`/api/rooms/${roomId}`),
          api.get('/api/rooms')
        ]);
        setRoom(roomRes.data);
        setRooms(roomsRes.data);
        joinRoom(roomId);
        await loadMessages(roomId);
      } catch (err) {
        console.error('Failed to load room details', err);
        navigate('/dashboard');
      } finally {
        setLoadingRoom(false);
      }
    };

    initRoom();

    return () => {
      if (roomId) {
        leaveRoom(roomId);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      isTypingRef.current = false;
    };
  }, [roomId, navigate]);

  const activeMessages = roomId ? messages[roomId] || [] : [];
  const roomTyping = roomId ? typingUsers[roomId] || {} : {};

  // Auto-scroll to bottom of feed when new messages arrive
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length]);

  // Handle typing event throttle/debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!roomId) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendTyping(roomId, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      sendTyping(roomId, false);
    }, 2500); // Send typing stop event after 2.5 seconds of inactivity
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !roomId) return;

    // Reset typing status immediately
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    isTypingRef.current = false;
    sendTyping(roomId, false);

    const clientMsgId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sendMessage(roomId, inputText.trim(), clientMsgId);
    setInputText('');
  };

  const handleRetry = (msg: ChatMessage) => {
    if (!roomId || !msg.clientMessageId) return;
    sendMessage(roomId, msg.content, msg.clientMessageId);
  };

  // Get active list of typing users (excluding ourselves)
  const typingUserNames = Object.entries(roomTyping)
    .filter(([username, isTyping]) => isTyping && username !== user?.username)
    .map(([username]) => username);

  if (loadingRoom) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center gap-4">
        <Loader className="w-10 h-10 text-primary animate-spin" />
        <span className="text-xs text-muted">Synchronizing workspace history...</span>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-text flex flex-col overflow-hidden relative">
      
      {/* Top Banner for Connection Status */}
      {connectionStatus === 'CONNECTING' && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 py-2 text-center text-xs font-semibold text-yellow-400 flex items-center justify-center gap-2 animate-pulse shrink-0">
          <Loader className="w-3.5 h-3.5 animate-spin" />
          Connection interrupted. Attempting to recover socket state...
        </div>
      )}
      {connectionStatus === 'DISCONNECTED' && (
        <div className="bg-danger/10 border-b border-danger/20 py-2 text-center text-xs font-semibold text-danger flex items-center justify-center gap-2 shrink-0">
          <AlertCircle className="w-3.5 h-3.5 animate-bounce" />
          Disconnected from broker cluster. Message delivery disabled.
        </div>
      )}

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Sidebar Panel - Desktop persistent, Mobile toggleable drawer */}
        <aside className={`w-64 bg-surface border-r border-border flex flex-col justify-between shrink-0 transition-transform duration-300 z-30
          absolute md:static top-0 bottom-0 left-0 ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        >
          <div className="flex-1 flex flex-col min-h-0">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-background font-bold text-sm">S</div>
                <span className="font-bold text-white text-sm">SyncStream</span>
              </div>
              <button 
                onClick={() => setShowSidebar(false)}
                className="p-1 rounded-lg border border-border md:hidden text-muted hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Room lists */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div>
                <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-3">Rooms List</div>
                <div className="space-y-1">
                  {rooms.map((r) => (
                    <Link
                      key={r.id}
                      to={`/rooms/${r.id}`}
                      onClick={() => setShowSidebar(false)}
                      className={`text-xs font-medium px-3 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
                        r.id === roomId 
                          ? 'bg-primary/10 text-primary border border-primary/20' 
                          : 'text-muted hover:text-text hover:bg-border/20'
                      }`}
                    >
                      <span className="opacity-60 font-bold">#</span>
                      <span className="truncate">{r.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-border bg-background/20">
            <Link
              to="/dashboard"
              className="w-full flex items-center justify-center gap-2 p-2.5 text-xs font-semibold border border-border text-muted hover:text-white hover:bg-border/40 rounded-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              All Workspaces
            </Link>
          </div>
        </aside>

        {/* Center Panel (Chat Frame) */}
        <section className="flex-1 flex flex-col min-w-0 bg-background">
          
          {/* Header */}
          <header className="border-b border-border bg-surface/50 backdrop-blur-md px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3 min-w-0">
              <button
                onClick={() => setShowSidebar(true)}
                className="p-2 rounded-xl border border-border md:hidden text-muted hover:text-white shrink-0"
              >
                <Menu className="w-4.5 h-4.5" />
              </button>
              
              <div className="min-w-0">
                <h2 className="text-base font-bold text-white truncate"># {room?.name}</h2>
                <p className="text-[10px] text-muted truncate max-w-sm mt-0.5">{room?.description || 'Collaborative room chat'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Member toggle button for Mobile */}
              <button
                onClick={() => setShowMembers(!showMembers)}
                className={`p-2 rounded-xl border border-border text-muted hover:text-white lg:hidden ${
                  showMembers ? 'bg-primary/10 text-primary border-primary/20' : ''
                }`}
              >
                <Users className="w-4.5 h-4.5" />
              </button>
            </div>
          </header>

          {/* Messages List Area */}
          <div 
            ref={feedContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col"
          >
            {/* Load More Button */}
            {hasMoreMessages[roomId || ''] && (
              <button
                onClick={() => loadMoreMessages(roomId || '')}
                className="mx-auto flex items-center gap-2 px-4 py-2 border border-border hover:border-primary bg-surface/50 rounded-xl text-xs text-muted hover:text-primary transition-all font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Load older message history
              </button>
            )}

            {activeMessages.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center text-muted">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-semibold text-white">Beginning of chat history</h3>
                <p className="text-[10px] text-muted max-w-xs">
                  This is the start of the #{room?.name} workspace channel. Write your first message to begin!
                </p>
              </div>
            ) : (
              activeMessages.map((msg, index) => {
                const isFailed = msg.status === 'FAILED';
                const isSending = msg.status === 'SENDING';
                
                return (
                  <div key={msg.id || msg.clientMessageId || index} className="flex items-start space-x-3 group animate-fadeIn">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0 select-none">
                      {msg.senderName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-xs font-semibold text-white">{msg.senderName}</span>
                        <span className="text-[9px] text-muted">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        
                        {/* Status Badges */}
                        {isSending && (
                          <span className="text-[8px] text-muted flex items-center gap-1">
                            <Loader className="w-2 h-2 animate-spin text-primary" />
                            sending
                          </span>
                        )}
                        {isFailed && (
                          <span className="text-[8px] text-danger flex items-center gap-1 font-bold">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            failed
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between gap-4 mt-0.5">
                        <p className={`text-xs break-words leading-relaxed ${
                          isSending ? 'text-muted/60' : isFailed ? 'text-danger/60' : 'text-muted-foreground'
                        }`}>
                          {msg.content}
                        </p>
                        
                        {/* Retry Handler for failed deliveries */}
                        {isFailed && (
                          <button
                            onClick={() => handleRetry(msg)}
                            className="p-1 rounded bg-danger/10 border border-danger/20 text-[9px] font-bold text-danger hover:bg-danger hover:text-white transition-all flex items-center gap-1"
                          >
                            <RefreshCw className="w-2.5 h-2.5" />
                            Retry
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={feedEndRef} />
          </div>

          {/* Chat Composer Input */}
          <div className="p-4 border-t border-border bg-surface/30 shrink-0">
            {/* Typing Indicator Display */}
            {typingUserNames.length > 0 && (
              <div className="text-[10px] text-muted italic flex items-center gap-1.5 mb-2 pl-2 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                {typingUserNames.join(', ')} {typingUserNames.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}

            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                maxLength={500}
                value={inputText}
                onChange={handleInputChange}
                disabled={connectionStatus === 'DISCONNECTED'}
                placeholder={
                  connectionStatus === 'DISCONNECTED' 
                    ? "Chat disabled while disconnected..." 
                    : `Message #${room?.name}...`
                }
                className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || connectionStatus === 'DISCONNECTED'}
                className="p-3 bg-primary text-background font-semibold rounded-xl hover:bg-primary/95 transition-all hover:shadow-lg hover:shadow-primary/10 disabled:opacity-50 shrink-0 flex items-center justify-center"
              >
                <Send className="w-4.5 h-4.5 stroke-[2.5]" />
              </button>
            </form>
          </div>
        </section>

        {/* Members Sidebar Panel - Desktop persistent, Mobile toggleable drawer */}
        <aside className={`w-56 bg-surface border-l border-border flex flex-col shrink-0 transition-transform duration-300 z-30
          absolute lg:static top-0 bottom-0 right-0 ${showMembers ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}
        >
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Members List
            </div>
            <button 
              onClick={() => setShowMembers(false)}
              className="p-1 rounded-lg border border-border lg:hidden text-muted hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {room?.members.map((memberId) => {
              const presence = presenceUsers[memberId];
              const isOnline = presence && presence.status === 'ONLINE';
              const isAway = presence && presence.status === 'AWAY';
              
              // Fallback username if presence hasn't loaded yet
              const username = presence ? presence.username : memberId === user?.id ? user.username : 'Workspace Member';
              
              return (
                <div key={memberId} className="flex items-center gap-2.5 p-1 rounded-lg">
                  <div className="relative shrink-0 select-none">
                    <div className="w-7 h-7 rounded-lg bg-border flex items-center justify-center font-bold text-[10px] text-muted">
                      {username.charAt(0).toUpperCase()}
                    </div>
                    {/* Status dot */}
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface ${
                      isOnline ? 'bg-success' : isAway ? 'bg-yellow-500' : 'bg-zinc-600'
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate max-w-[120px]">{username}</div>
                    <div className="text-[9px] text-muted truncate max-w-[120px]">
                      {isOnline ? 'Active now' : 'Offline'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Room;
