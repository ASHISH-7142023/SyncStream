import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import type { ChatMessage } from '../context/SocketContext';
import api from '../services/api';
import { 
  Send, Users, Loader, LogOut, 
  X, Sparkles, MessageSquare, RefreshCw,
  Search, Mic, MicOff, Volume2, VolumeX, Smile, Paperclip, Crown,
  ThumbsUp, Heart, Flame, Laugh, Home, Settings, Bell, Phone, Video, MoreHorizontal
} from 'lucide-react';
import gsap from 'gsap';

interface RoomDetails {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: string[];
}

interface MessageGroup {
  senderName: string;
  senderId: string;
  avatarGradient: string;
  messages: ChatMessage[];
}

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { 
    connectionStatus, messages, typingUsers, presenceUsers,
    joinRoom, leaveRoom, sendMessage, sendTyping, loadMessages,
    hasMoreMessages, loadMoreMessages 
  } = useSocket();

  const [room, setRoom] = useState<RoomDetails | null>(null);
  const [inputText, setInputText] = useState('');
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [rooms, setRooms] = useState<any[]>([]);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [channelSearchQuery, setChannelSearchQuery] = useState('');

  // Interactive controls
  const [showMembers, setShowMembers] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({});
  
  const feedEndRef = useRef<HTMLDivElement | null>(null);
  const feedContainerRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
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

  // GSAP animation on incoming message or list size change
  useEffect(() => {
    if (activeMessages.length > 0 && chatContainerRef.current) {
      const lastMsgGroup = chatContainerRef.current.querySelector('.msg-group-el:last-child');
      if (lastMsgGroup) {
        gsap.fromTo(
          lastMsgGroup,
          { opacity: 0, y: 12, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power2.out' }
        );
      }
      feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages.length]);

  // Handle typing event throttle
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
    }, 2500);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !roomId) return;

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

  // Generate dynamic gradients from user hash
  const getAvatarGradient = (username: string = 'U') => {
    const gradients = [
      'from-[#F97316] to-[#EF4444]',
      'from-[#10B981] to-[#047857]',
      'from-[#38BDF8] to-[#1D4ED8]',
      'from-[#8B5CF6] to-[#EC4899]',
      'from-[#FBBF24] to-[#D97706]',
      'from-[#06B6D4] to-[#0891B2]',
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  // Toggle emoji reactions
  const toggleReaction = (msgUid: string, emoji: string) => {
    setReactions(prev => {
      const msgReactions = prev[msgUid] || {};
      const currentVal = msgReactions[emoji] || 0;
      return {
        ...prev,
        [msgUid]: {
          ...msgReactions,
          [emoji]: currentVal + 1
        }
      };
    });
  };

  // Append emoji to text bar
  const handleEmojiClick = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Filter messages locally
  const filteredMessages = activeMessages.filter(msg => 
    msg.content.toLowerCase().includes(localSearchQuery.toLowerCase())
  );

  // Group messages consecutively by user within 2 minutes
  const messageGroups: MessageGroup[] = [];
  let currentGroup: MessageGroup | null = null;

  filteredMessages.forEach((msg) => {
    const msgTime = new Date(msg.createdAt).getTime();
    const shouldGroup = currentGroup && 
      currentGroup.senderName === msg.senderName && 
      (msgTime - new Date(currentGroup.messages[currentGroup.messages.length - 1].createdAt).getTime()) < 120000;

    if (shouldGroup && currentGroup) {
      currentGroup.messages.push(msg);
    } else {
      currentGroup = {
        senderName: msg.senderName,
        senderId: msg.senderName,
        avatarGradient: getAvatarGradient(msg.senderName),
        messages: [msg]
      };
      messageGroups.push(currentGroup);
    }
  });

  const typingUserNames = Object.entries(roomTyping)
    .filter(([username, isTyping]) => isTyping && username !== user?.username)
    .map(([username]) => username);

  // Filter other channels based on query
  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(channelSearchQuery.toLowerCase())
  );

  // Separate members into ONLINE and OFFLINE
  const onlineMembers: string[] = [];
  const offlineMembers: string[] = [];

  room?.members.forEach((mId) => {
    const presence = presenceUsers[mId];
    if (presence && presence.status === 'ONLINE') {
      onlineMembers.push(mId);
    } else {
      offlineMembers.push(mId);
    }
  });

  if (loadingRoom) {
    return (
      <div className="min-h-screen bg-[#09090B] flex flex-col justify-center items-center gap-4">
        <Loader className="w-8 h-8 text-[#10B981] animate-spin" />
        <span className="text-xs uppercase tracking-widest font-mono text-zinc-400">
          Syncing Channel ledgers...
        </span>
      </div>
    );
  }

  return (
    <div className="h-screen text-[#F8FAFC] flex items-center justify-center p-4 md:p-6 lg:p-8 font-sans relative z-10">
      
      {/* Outer Floating Desktop Window matching reference */}
      <div className="w-full max-w-7xl h-[88vh] bg-glass rounded-[2.5rem] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] flex overflow-hidden p-6 gap-6 relative">
        
        {/* Column 1: Left Vertical Dock Sidebar (Exactly like reference left dock) */}
        <aside className="w-16 bg-white/5 backdrop-blur-xl border border-white/5 rounded-3xl flex flex-col items-center justify-between py-6 shrink-0 z-20">
          <div className="flex flex-col items-center space-y-8 w-full">
            {/* Top User Profile Avatar with Online Status Indicator */}
            <Link to="/profile" className="relative group">
              <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${getAvatarGradient(user?.username)} flex items-center justify-center font-bold text-xs text-[#09090B] select-none border border-white/20 transition-transform duration-300 group-hover:scale-105`}>
                {user?.username?.substring(0, 1).toUpperCase()}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-900 bg-[#10B981] ${
                connectionStatus === 'CONNECTED' ? 'animate-status-pulse' : 'bg-red-500'
              }`} />
            </Link>

            {/* Navigation Icons list */}
            <div className="flex flex-col items-center space-y-6 pt-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="p-2.5 text-zinc-400 hover:text-white transition-colors hover:bg-white/5 rounded-2xl"
                title="Workspace Dashboard"
              >
                <Home className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setShowMembers(!showMembers)}
                className={`p-2.5 rounded-2xl border transition-colors ${
                  showMembers ? 'text-[#10B981] border-[#10B981]/20 bg-white/5' : 'text-zinc-400 border-transparent hover:text-white hover:bg-white/5'
                }`}
                title="Workspace Members Registry"
              >
                <Users className="w-4 h-4" />
              </button>
              <button 
                className="p-2.5 text-zinc-400 hover:text-white transition-colors hover:bg-white/5 rounded-2xl"
                title="Notifications"
                onClick={() => alert('No new notifications.')}
              >
                <Bell className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigate('/profile')}
                className="p-2.5 text-zinc-400 hover:text-white transition-colors hover:bg-white/5 rounded-2xl"
                title="Session Telemetry Parameters"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Logout Power button */}
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="p-2.5 text-red-400 hover:text-[#09090B] hover:bg-red-500 rounded-2xl transition-all border border-red-500/10"
            title="Terminate Active Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </aside>

        {/* Column 2: Middle Channels Column (Exactly like reference left-middle layout) */}
        <section className="w-64 bg-white/5 border border-white/5 rounded-3xl flex flex-col justify-between shrink-0 overflow-hidden">
          <div className="flex-grow flex flex-col min-h-0 p-4 space-y-4">
            
            {/* Search Pill Input bar */}
            <div className="relative shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="SEARCH ROOMS..."
                value={channelSearchQuery}
                onChange={(e) => setChannelSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-full pl-9 pr-4 py-2 text-[9px] text-white placeholder-zinc-500 focus:outline-none focus:border-[#10B981] font-mono tracking-wider uppercase"
              />
            </div>

            {/* Channels lists */}
            <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin">
              <div>
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block mb-2 pl-2">
                  Groups
                </span>
                <div className="space-y-1.5">
                  {filteredRooms.map((r) => (
                    <Link
                      key={r.id}
                      to={`/rooms/${r.id}`}
                      className={`text-[10px] font-bold uppercase tracking-wider p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                        r.id === roomId 
                          ? 'bg-[#10B981] text-slate-950 border-transparent shadow-md shadow-emerald-500/10' 
                          : 'text-white border-transparent bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <span className={`text-[10px] ${r.id === roomId ? 'text-slate-900' : 'text-zinc-500'}`}>#</span>
                      <span className="truncate">{r.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom user dashboard block containing audio controls */}
          <div className="p-4 border-t border-white/5 bg-black/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-7 h-7 bg-gradient-to-tr ${getAvatarGradient(user?.username)} flex items-center justify-center font-bold text-[10px] text-[#09090B] shrink-0`}>
                {user?.username?.substring(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-white truncate max-w-[80px]">
                  {user?.username}
                </div>
              </div>
            </div>

            {/* Mute and Deafen Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-1.5 border border-white/5 rounded-lg hover:text-white transition-colors relative group ${
                  isMuted ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-zinc-400 bg-white/5'
                }`}
                title={isMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
              </button>
              <button
                onClick={() => setIsDeafened(!isDeafened)}
                className={`p-1.5 border border-white/5 rounded-lg hover:text-white transition-colors relative group ${
                  isDeafened ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-zinc-400 bg-white/5'
                }`}
                title={isDeafened ? "Enable Audio" : "Deafen Audio"}
              >
                {isDeafened ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </section>

        {/* Column 3: Chat conversation frame (Exactly like reference right chat layout) */}
        <section className="flex-1 flex flex-col min-w-0 bg-white/5 border border-white/5 rounded-3xl overflow-hidden relative">
          
          {/* Active Chat Header */}
          <header className="px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/5">
            <div className="flex items-center space-x-3.5 min-w-0">
              <div className="relative shrink-0 select-none">
                <div className={`w-9 h-9 bg-gradient-to-tr ${getAvatarGradient(room?.name)} flex items-center justify-center font-bold text-xs text-[#09090B]`}>
                  {room?.name?.substring(0, 1).toUpperCase()}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-900 bg-[#10B981] animate-status-pulse" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-bold text-white uppercase tracking-wide truncate"># {room?.name}</h2>
                <p className="text-[9px] text-zinc-400 font-medium truncate max-w-sm">{room?.description || 'Active cluster channel'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-zinc-300">
              {/* Local Search input */}
              <div className="relative hidden lg:block mr-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="FILTER FEED..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  className="bg-[#09090b]/40 border border-white/5 pl-9 pr-6 py-1.5 text-[9px] text-white placeholder-zinc-700 focus:outline-none focus:border-[#10B981] font-mono uppercase w-36 rounded-full"
                />
                {localSearchQuery && (
                  <button
                    onClick={() => setLocalSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <button className="p-1.5 hover:text-white transition-colors hover:bg-white/5 rounded-lg">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:text-white transition-colors hover:bg-white/5 rounded-lg">
                <Video className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:text-white transition-colors hover:bg-white/5 rounded-lg">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Conversation Messages area */}
          <div 
            ref={feedContainerRef}
            className="flex-grow overflow-y-auto p-6 space-y-6 flex flex-col scrollbar-thin"
          >
            {/* Sync more tag */}
            {hasMoreMessages[roomId || ''] && (
              <button
                onClick={() => loadMoreMessages(roomId || '')}
                className="mx-auto flex items-center gap-2 px-4 py-2 border border-white/5 bg-white/5 rounded-full text-[9px] font-bold uppercase tracking-wider text-zinc-400 hover:text-[#10B981] transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
                Sync Older Telemetry Logs
              </button>
            )}

            {messageGroups.length === 0 ? (
              <div className="flex-grow flex flex-col justify-center items-center text-center space-y-3">
                <div className="w-11 h-11 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-zinc-600">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">Beginning of Stream</h3>
                  <p className="text-[9px] text-zinc-500 max-w-xs mt-0.5">
                    This marks the start of the #{room?.name} transaction ledger.
                  </p>
                </div>
              </div>
            ) : (
              <div ref={chatContainerRef} className="space-y-6">
                {messageGroups.map((group, groupIdx) => (
                  <div key={groupIdx} className="msg-group-el flex flex-col space-y-2.5">
                    
                    {/* Timestamp separator block */}
                    <div className="flex items-center space-x-2 pl-1.5 opacity-60">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${group.avatarGradient} flex items-center justify-center font-bold text-[8px] text-[#09090B]`}>
                        {group.senderName.substring(0, 1).toUpperCase()}
                      </div>
                      <span className="text-[9px] font-extrabold uppercase tracking-wide text-zinc-300">{group.senderName}</span>
                      <span className="text-[8px] font-mono text-zinc-500">
                        {new Date(group.messages[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Messages bubbles stack */}
                    <div className="space-y-2">
                      {group.messages.map((msg, index) => {
                        const isSelf = msg.senderName === user?.username;
                        const isFailed = msg.status === 'FAILED';
                        const isSending = msg.status === 'SENDING';
                        const msgUid = msg.id || msg.clientMessageId || `msg-${index}`;
                        const msgReactions = reactions[msgUid] || {};

                        return (
                          <div 
                            key={msgUid} 
                            className={`flex ${isSelf ? 'justify-end' : 'justify-start'} relative group/msg py-0.5`}
                          >
                            <div className="flex flex-col max-w-[70%]">
                              {/* Conversation speech bubble mimicking reference shapes */}
                              <div 
                                className={`px-4 py-3 rounded-2xl text-xs leading-relaxed border relative ${
                                  isSelf 
                                    ? 'bg-[#0d4734]/55 border-[#0d4734]/35 text-white rounded-tr-none shadow-md shadow-[#0d4734]/10' 
                                    : 'bg-white/10 border-white/5 text-white rounded-tl-none shadow-md'
                                }`}
                              >
                                <p className={isSending ? 'text-zinc-600' : isFailed ? 'text-red-800' : ''}>
                                  {msg.content}
                                </p>

                                {/* Delivery states */}
                                {isSending && (
                                  <span className="text-[8px] font-mono uppercase text-[#71717A] flex items-center gap-1 mt-1">
                                    <Loader className="w-2.5 h-2.5 animate-spin text-[#10B981]" />
                                    Pushing
                                  </span>
                                )}
                                {isFailed && (
                                  <button
                                    onClick={() => handleRetry(msg)}
                                    className="px-2 py-0.5 border border-[#EF4444]/20 bg-[#EF4444]/5 rounded-lg text-[9px] font-mono uppercase text-[#EF4444] hover:bg-[#EF4444] hover:text-[#09090b] transition-all flex items-center gap-1 mt-1"
                                  >
                                    <RefreshCw className="w-2.5 h-2.5" />
                                    Retry
                                  </button>
                                )}
                              </div>

                              {/* Reactions badges underneath */}
                              {Object.keys(msgReactions).length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2.5">
                                  {Object.entries(msgReactions).map(([emoji, count]) => (
                                    <button
                                      key={emoji}
                                      onClick={() => toggleReaction(msgUid, emoji)}
                                      className="flex items-center gap-1.5 px-2 py-0.5 border border-white/5 bg-white/5 hover:border-[#10B981] rounded-full text-[10px]"
                                    >
                                      <span>{emoji}</span>
                                      <span className="font-bold text-zinc-500 font-mono">{count}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Floating emoji hover bar */}
                            {!isSending && !isFailed && (
                              <div className="absolute top-1/2 -translate-y-1/2 bg-[#0c0c0e] border border-white/10 rounded-full py-1 px-2 flex items-center space-x-2 shadow-xl opacity-0 group-hover/msg:opacity-100 transition-opacity z-20"
                                   style={isSelf ? { left: '-10px', transform: 'translate(-100%, -50%)' } : { right: '-10px', transform: 'translate(100%, -50%)' }}>
                                <button 
                                  onClick={() => toggleReaction(msgUid, '👍')}
                                  className="p-1 text-zinc-500 hover:text-white transition-colors"
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => toggleReaction(msgUid, '❤️')}
                                  className="p-1 text-zinc-500 hover:text-white transition-colors"
                                >
                                  <Heart className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => toggleReaction(msgUid, '🔥')}
                                  className="p-1 text-zinc-500 hover:text-white transition-colors"
                                >
                                  <Flame className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => toggleReaction(msgUid, '😂')}
                                  className="p-1 text-zinc-500 hover:text-white transition-colors"
                                >
                                  <Laugh className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div ref={feedEndRef} />
          </div>

          {/* Bottom input composer bar - Floating pill styling matching reference */}
          <div className="p-4 bg-white/5 border-t border-white/5 shrink-0 relative">
            
            {/* Transmitting package text */}
            {typingUserNames.length > 0 && (
              <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 mb-2 pl-2">
                <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-ping" />
                {typingUserNames.join(', ')} Transmitting packets...
              </div>
            )}

            {/* Emoji menu */}
            {showEmojiPicker && (
              <div className="absolute left-6 bottom-16 bg-[#0c0c0e] border border-white/10 p-2 rounded-2xl flex space-x-2 shadow-2xl z-40">
                {['👍', '❤️', '🔥', '😂', '🙌', '🚀', '⚡', '🎯'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiClick(emoji)}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-base transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSend} className="flex gap-2.5 items-center">
              
              {/* Attachment selector icon */}
              <button
                type="button"
                className="p-2 text-zinc-400 hover:text-white transition-colors border border-white/5 rounded-full bg-white/5"
                onClick={() => alert('Attachments disabled for local file storage constraints.')}
                title="Attach Payload (Mock)"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                maxLength={500}
                value={inputText}
                onChange={handleInputChange}
                disabled={connectionStatus === 'DISCONNECTED'}
                placeholder={
                  connectionStatus === 'DISCONNECTED' 
                    ? "SESSION COMPROMISED OR DISCONNECTED..." 
                    : "TYPE YOUR MESSAGE HERE..."
                }
                className="flex-1 bg-white/5 border border-white/5 rounded-full px-5 py-3 text-[10px] text-white focus:outline-none placeholder-zinc-500 font-mono tracking-wider uppercase"
              />

              {/* Emoji smile selector button */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2 border rounded-full transition-colors bg-white/5 ${
                  showEmojiPicker ? 'border-[#10B981] text-[#10B981]' : 'border-white/5 text-zinc-400 hover:text-white'
                }`}
                title="Select Emoji"
              >
                <Smile className="w-4 h-4" />
              </button>

              {/* Send circular icon button */}
              <button
                type="submit"
                disabled={!inputText.trim() || connectionStatus === 'DISCONNECTED'}
                className="p-3 bg-white/10 hover:bg-[#10B981] text-zinc-300 hover:text-[#09090b] rounded-full border border-white/5 hover:border-transparent transition-all disabled:opacity-30 disabled:pointer-events-none shrink-0 flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </section>

        {/* Collapsible right sidebar overlay containing Online / Offline peers lists */}
        {showMembers && (
          <aside className="absolute md:static top-6 bottom-6 right-6 w-56 bg-slate-950/90 md:bg-white/5 border border-white/10 md:border-white/5 rounded-3xl flex flex-col shrink-0 z-30 transition-all">
            <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/5 rounded-t-3xl">
              <span className="text-[10px] font-mono text-white flex items-center gap-2 uppercase tracking-widest">
                <Users className="w-4 h-4 text-[#10B981]" />
                Peer Registry
              </span>
              <button 
                onClick={() => setShowMembers(false)}
                className="p-1 border border-white/5 rounded-full text-zinc-500 hover:text-white bg-white/5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
              
              {/* ONLINE PEERS */}
              <div>
                <span className="text-[8px] font-mono text-[#10B981] uppercase tracking-widest block mb-3">
                  ONLINE — {onlineMembers.length}
                </span>
                <div className="space-y-3">
                  {onlineMembers.map((mId) => {
                    const presence = presenceUsers[mId];
                    const username = presence ? presence.username : mId === user?.id ? user.username : 'Unknown Peer';
                    
                    return (
                      <div key={mId} className="flex items-center gap-2.5 py-0.5">
                        <div className="relative shrink-0 select-none">
                          <div className={`w-7 h-7 bg-gradient-to-tr ${getAvatarGradient(username)} flex items-center justify-center font-bold text-[10px] text-[#09090B] rounded-full`}>
                            {username.charAt(0).toUpperCase()}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-900 bg-[#10B981]" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-white truncate max-w-[120px] uppercase flex items-center gap-1">
                            {username}
                            {room?.ownerId === mId && <Crown className="w-2.5 h-2.5 text-[#F97316]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* OFFLINE PEERS */}
              <div>
                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block mb-3">
                  OFFLINE — {offlineMembers.length}
                </span>
                <div className="space-y-3">
                  {offlineMembers.map((mId) => {
                    const presence = presenceUsers[mId];
                    const username = presence ? presence.username : mId === user?.id ? user.username : 'Offline Member';
                    
                    return (
                      <div key={mId} className="flex items-center gap-2.5 py-0.5 opacity-55 hover:opacity-100 transition-opacity">
                        <div className="relative shrink-0 select-none">
                          <div className="w-7 h-7 bg-zinc-800 flex items-center justify-center font-bold text-[10px] text-zinc-500 rounded-full">
                            {username.charAt(0).toUpperCase()}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-900 bg-zinc-700" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-zinc-400 truncate max-w-[120px] uppercase flex items-center gap-1">
                            {username}
                            {room?.ownerId === mId && <Crown className="w-2.5 h-2.5 text-zinc-600" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default Room;
