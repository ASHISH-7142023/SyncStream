import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Member {
  id: string;
  username: string;
  role?: string;
  status?: 'ONLINE' | 'AWAY' | 'OFFLINE';
}

interface RoomDetails {
  id: string;
  name: string;
  description?: string;
  isPrivate?: boolean;
}

const RoomChatPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { 
    connectionStatus, messages, typingUsers,
    joinRoom, leaveRoom, sendMessage, sendTyping, loadMessages
  } = useSocket();

  const [room, setRoom] = useState<RoomDetails | null>(null);
  const [inputText, setInputText] = useState('');
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [pinnedClosed, setPinnedClosed] = useState(false);
  const [showMembersSidebar, setShowMembersSidebar] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [localReactions, setLocalReactions] = useState<Record<string, { emoji: string; count: number; active: boolean }[]>>({});

  const feedEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<any>(null);
  const isTypingRef = useRef(false);

  const { rooms, onOpenCreateModal } = useOutletContext<{ 
    rooms: RoomDetails[]; 
    onOpenCreateModal: () => void;
  }>() as any;

  // Initialize Room & subscriptions
  useEffect(() => {
    if (!roomId) return;

    const initRoom = async () => {
      setLoadingRoom(true);
      try {
        const res = await api.get(`/api/rooms/${roomId}`);
        setRoom(res.data);
        
        const mems = await api.get(`/api/rooms/${roomId}/members`);
        setMemberList(mems.data);

        joinRoom(roomId);
        loadMessages(roomId);
      } catch (err) {
        console.error('Failed to initialize room page', err);
      } finally {
        setLoadingRoom(false);
      }
    };

    initRoom();

    return () => {
      leaveRoom(roomId);
    };
  }, [roomId]);

  // Scroll to bottom
  const roomMessages = (roomId && messages[roomId]) || [];
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !inputText.trim()) return;

    sendMessage(roomId, inputText.trim(), Math.random().toString(36).substring(2, 15));
    setInputText('');

    isTypingRef.current = false;
    sendTyping(roomId, false);
  };

  const handleKeyPress = () => {
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
    }, 2000);
  };

  const handleLeaveRoom = async () => {
    if (!roomId) return;
    try {
      await api.post(`/api/rooms/${roomId}/leave`);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to leave room', err);
      navigate('/dashboard');
    }
  };

  const handleAddReaction = (msgId: string, emoji: string) => {
    setLocalReactions(prev => {
      const reactions = prev[msgId] || [];
      const existing = reactions.find(r => r.emoji === emoji);
      if (existing) {
        return {
          ...prev,
          [msgId]: reactions.map(r => r.emoji === emoji ? { ...r, count: r.active ? r.count - 1 : r.count + 1, active: !r.active } : r).filter(r => r.count > 0)
        };
      } else {
        return {
          ...prev,
          [msgId]: [...reactions, { emoji, count: 1, active: true }]
        };
      }
    });
  };

  const onlineMembers = memberList.filter(m => m.status === 'ONLINE' || !m.status);
  const awayMembers = memberList.filter(m => m.status === 'AWAY');
  const offlineMembers = memberList.filter(m => m.status === 'OFFLINE');

  const currentRoomTypingMap = (roomId && typingUsers[roomId]) || {};
  const typingUsernames = Object.keys(currentRoomTypingMap).filter(
    (username) => currentRoomTypingMap[username] && username !== user?.username
  );

  const formatTime = (ts?: string) => {
    if (!ts) return '10:30 AM';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return ts;
    }
  };

  if (loadingRoom) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0f111a] text-white">
        <div className="space-y-4">
          <div className="w-10 h-10 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-[#94a3b8]">Loading workspace chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden text-sm selection:bg-brand selection:text-white bg-[#0f111a] text-[#e2e8f0] font-sans antialiased">
      
      {/* Sidebar Backdrop for Mobile */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden cursor-pointer"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#151723] flex flex-col border-r border-white/5 shrink-0 text-left transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:flex md:z-0
        ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
          <div className="flex items-center gap-2 text-brand-400 font-semibold text-xl tracking-tight cursor-pointer" onClick={() => navigate('/dashboard')}>
            <img src="/chat.png" alt="Logo" className="w-8 h-8 object-contain" />
            <img src="/name.png" alt="SyncStream" className="h-6 w-auto object-contain" />
          </div>
          <button 
            onClick={() => setShowMobileSidebar(false)}
            className="md:hidden p-1 text-text-muted hover:text-white hover:bg-white/10 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-hide">
          <ul className="space-y-1">
            <li>
              <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-colors text-left">
                <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                Home
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/rooms')} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-colors text-left">
                <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="9" x2="15" y1="10" y2="10"></line><line x1="12" x2="12" y1="7" y2="13"></line></svg>
                Rooms Feed
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-colors text-left">
                <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                My Profile
              </button>
            </li>
          </ul>

          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <h3 className="text-xs font-semibold text-text-muted tracking-wider">ROOMS</h3>
              <button onClick={onOpenCreateModal} className="text-text-muted hover:text-white transition-colors">
                <svg fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><line x1="12" x2="12" y1="5" y2="19"></line><line x1="5" x2="19" y1="12" y2="12"></line></svg>
              </button>
            </div>
            <ul className="space-y-0.5">
              {rooms.map((r: any) => {
                const isActive = r.id === roomId;
                return (
                  <li key={r.id}>
                    <button 
                      onClick={() => navigate(`/rooms/${r.id}`)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors text-left ${
                        isActive ? 'bg-[#4c1d95]/40 text-[#ede9fe] font-medium' : 'text-text-muted hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-lg opacity-60 font-light">#</span>
                        <span className="truncate">{r.name}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Upgrade Promo */}
        <div className="p-4">
          <div className="bg-[#1f2233] rounded-2xl p-4 border border-white/5 glow-effect relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/10 to-transparent"></div>
            <div className="relative z-10">
              <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/20 text-[#a78bfa] flex items-center justify-center mb-3">
                <svg fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </div>
              <h4 className="font-medium text-[#a78bfa] text-sm mb-1">Upgrade to Pro</h4>
              <p className="text-xs text-text-muted mb-4 leading-relaxed">Unlock unlimited history and features.</p>
              <button className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-medium py-2 px-4 rounded-xl transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate('/profile')}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-[#8b5cf6] flex items-center justify-center font-bold text-sm text-white">
                {user ? user.username.slice(0, 2).toUpperCase() : 'AJ'}
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-status-online border-2 border-[#151723] rounded-full"></div>
            </div>
            <div>
              <div className="text-sm font-medium text-white">{user ? user.username : 'Alex Johnson'}</div>
              <div className="text-xs text-status-online">Online</div>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              logout();
            }}
            className="text-text-muted hover:text-red-400 p-1"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0f111a]">
        
        {/* Chat Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#151723]/50 backdrop-blur-sm z-10 shrink-0">
          <div className="flex items-center gap-3 text-left">
            <button 
              onClick={() => setShowMobileSidebar(true)}
              className="md:hidden p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors shrink-0 cursor-pointer"
              title="Open Sidebar"
            >
              <i className="fa-solid fa-bars text-lg"></i>
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl text-text-muted">#</span>
                <h1 className="text-lg font-semibold text-white">{room ? room.name : 'developers'}</h1>
                <button className="text-text-muted hover:text-brand-400 transition-colors">
                  <svg fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </button>
              </div>
              <span className="text-xs text-text-muted">{room?.description || 'Development discussions & updates'}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[#94a3b8]">
            <div className="flex items-center -space-x-2">
              {onlineMembers.slice(0, 4).map((m) => (
                <div key={m.id} className="w-7 h-7 rounded-full border-2 border-[#0f111a] bg-[#334155] flex items-center justify-center font-bold text-[9px] text-white select-none">
                  {m.username.slice(0, 2).toUpperCase()}
                </div>
              ))}
              {onlineMembers.length > 4 && (
                <div className="w-7 h-7 rounded-full border-2 border-[#0f111a] bg-[#1a1d2d] flex items-center justify-center text-[10px] text-text-muted font-medium select-none">
                  +{onlineMembers.length - 4}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 border-l border-white/5 pl-4 shrink-0">
              <button className="p-1.5 hover:bg-white/5 hover:text-white rounded-lg transition-all hover:scale-115 active:scale-90 cursor-pointer" title="Search">
                <i className="fa-solid fa-magnifying-glass text-xs"></i>
              </button>
              <button 
                onClick={() => setPinnedClosed(!pinnedClosed)}
                className={`p-1.5 hover:bg-white/5 hover:text-white rounded-lg transition-all hover:scale-115 active:scale-90 cursor-pointer ${!pinnedClosed ? 'text-[#a78bfa]' : ''}`}
                title="Pinned Messages"
              >
                <i className="fa-solid fa-thumbtack text-xs"></i>
              </button>
              <button 
                onClick={() => setShowMembersSidebar(!showMembersSidebar)}
                className={`p-1.5 hover:bg-white/5 hover:text-white rounded-lg transition-all hover:scale-115 active:scale-90 cursor-pointer ${showMembersSidebar ? 'text-[#a78bfa]' : ''}`}
                title="Toggle Members Panel"
              >
                <i className="fa-solid fa-users text-xs"></i>
              </button>
              <button className="p-1.5 hover:bg-white/5 hover:text-white rounded-lg transition-all hover:scale-115 active:scale-90 cursor-pointer" title="More Options">
                <i className="fa-solid fa-ellipsis-vertical text-xs"></i>
              </button>
            </div>
          </div>
        </header>
 
        {/* Pinned Message */}
        {!pinnedClosed && (
          <div className="px-6 py-2 shrink-0 animate-scale-in">
            <div className="bg-[#1f2233] rounded-xl p-3 flex items-center justify-between text-sm border border-white/5 text-left hover:border-[#a78bfa]/20 transition-all hover:scale-[1.01] active:scale-[0.99] duration-300">
              <div className="flex items-center gap-3">
                <svg className="text-brand-400 text-[#a78bfa]" fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg"><line x1="12" x2="12" y1="17" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.68V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v4.68a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>
                <span className="text-[#a78bfa] font-medium">Pinned</span>
                <span className="text-text-muted text-xs">Project Roadmap Q2 is now available in the docs.</span>
              </div>
              <div className="flex items-center gap-3">
                <a href="#docs" className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors text-text-muted font-semibold hover:scale-[1.03] active:scale-[0.97] transition-all">View Doc</a>
                <button onClick={() => setPinnedClosed(true)} className="text-text-muted hover:text-white transition-all hover:scale-115 active:scale-90 cursor-pointer">
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Message Logs */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6 scrollbar-thin">
          {roomMessages.map((msg: any, idx: number) => {
            const reactions = localReactions[msg.id] || [];
            const isMention = msg.content?.includes(`@${user?.username}`);
            return (
              <React.Fragment key={msg.id || msg.sequenceNumber}>
                {idx === roomMessages.length - 2 && roomMessages.length > 2 && (
                  <div className="flex items-center my-2 shrink-0 w-full select-none">
                    <div className="flex-grow h-px bg-purple-500/20"></div>
                    <span className="mx-4 text-[9px] font-bold tracking-widest text-[#a78bfa] uppercase bg-[#0f111a] px-2">New Messages</span>
                    <div className="flex-grow h-px bg-purple-500/20"></div>
                  </div>
                )}
                <div className="flex gap-4 group text-left">
                <div className="w-10 h-10 rounded-full bg-[#8b5cf6]/20 text-[#a78bfa] flex items-center justify-center font-bold text-sm shrink-0 select-none mt-1">
                  {msg.sender?.slice(0, 2).toUpperCase() || 'US'}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">{msg.sender}</span>
                    <span className="text-[10px] text-text-muted">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div className={`text-[15px] leading-relaxed text-gray-200 ${isMention ? 'bg-[#7c3aed]/15 border border-[#7c3aed]/20 rounded px-2.5 py-1.5 w-fit my-1' : ''}`}>
                    {msg.content}
                  </div>
                  
                  {/* Reactions */}
                  <div className="flex gap-2 mt-2 items-center">
                    {reactions.map((react, i) => (
                      <button 
                        key={i}
                        onClick={() => handleAddReaction(msg.id, react.emoji)}
                        className={`flex items-center gap-1.5 border rounded-full px-2.5 py-1 text-xs transition-colors ${
                          react.active 
                            ? 'bg-[#8b5cf6]/20 border-[#8b5cf6] text-white' 
                            : 'bg-[#1f2233] border-white/10 hover:border-white/20 text-text-muted'
                        }`}
                      >
                        <span>{react.emoji}</span>
                        <span>{react.count}</span>
                      </button>
                    ))}
                    <button 
                      onClick={() => handleAddReaction(msg.id, '👍')}
                      className="flex items-center justify-center w-7 h-7 bg-transparent border border-transparent rounded-full hover:bg-[#1f2233] hover:border-white/10 transition-colors text-text-muted opacity-0 group-hover:opacity-100"
                    >
                      👍
                    </button>
                    <button 
                      onClick={() => handleAddReaction(msg.id, '🔥')}
                      className="flex items-center justify-center w-7 h-7 bg-transparent border border-transparent rounded-full hover:bg-[#1f2233] hover:border-white/10 transition-colors text-text-muted opacity-0 group-hover:opacity-100"
                    >
                      🔥
                    </button>
                  </div>
                </div>
              </div>
            </React.Fragment>
            );
          })}
          
          {roomMessages.length === 0 && (
            <div className="my-auto text-center space-y-2">
              <span className="text-3xl">👋</span>
              <h4 className="font-bold text-white text-base">Welcome to #{room?.name || 'room'}</h4>
              <p className="text-xs text-[#94a3b8] max-w-sm mx-auto">This is the start of the #{room?.name || 'room'} channel. Send a message to start collaborating!</p>
            </div>
          )}

          <div ref={feedEndRef} />
        </div>

        {/* Typing indicator & Input composer */}
        <div className="px-6 py-4 bg-[#0f111a] shrink-0 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-[#a78bfa] py-1.5 text-left h-6 select-none">
            {typingUsernames && typingUsernames.length > 0 && (
              <>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#a78bfa] rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-[#a78bfa] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-1.5 h-1.5 bg-[#a78bfa] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span>{typingUsernames.join(', ')} {typingUsernames.length === 1 ? 'is' : 'are'} typing...</span>
              </>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="bg-[#1f2233] border border-white/10 rounded-2xl flex flex-col focus-within:border-brand-500/50 focus-within:shadow-[0_0_0_1px_rgba(139,92,246,0.3)] transition-all">
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full bg-transparent border-0 text-[15px] placeholder-text-muted/70 resize-none py-3 px-4 focus:ring-0 min-h-[48px] outline-none text-white" 
              placeholder="Type a message..." 
              rows={1}
            />
            <div className="flex items-center justify-between px-2 pb-2">
              <div className="flex items-center gap-1 text-text-muted">
                <button type="button" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><line x1="12" x2="12" y1="5" y2="19"></line><line x1="5" x2="19" y1="12" y2="12"></line></svg>
                </button>
                <button type="button" className="p-2 hover:bg-white/5 rounded-lg transition-colors font-serif font-bold text-sm">Aa</button>
                <button type="button" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" x2="9.01" y1="9" y2="9"></line><line x1="15" x2="15.01" y1="9" y2="9"></line></svg>
                </button>
                <button type="button" className="p-2 hover:bg-white/5 rounded-lg transition-colors font-bold">@</button>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-muted">
                  <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                </button>
                <button type="submit" disabled={!inputText.trim()} className="bg-brand-600 hover:bg-brand-500 text-white p-2 rounded-xl transition-colors shadow-lg shadow-brand-500/20 disabled:opacity-40">
                  <svg fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><line x1="22" x2="11" y1="2" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </div>
            </div>
          </form>
        </div>

      </main>

      {/* Right Sidebar: Collapsible presence list */}
      {showMembersSidebar && (
        <aside className="w-72 bg-[#151723] flex flex-col border-l border-white/5 flex-shrink-0 text-left font-sans">
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
            <h2 className="font-medium text-white flex items-center gap-1.5">
              Members <span className="text-text-muted text-sm font-normal">({memberList.length})</span>
            </h2>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 text-xs text-brand-300 bg-brand-900/30 hover:bg-brand-900/50 border border-brand-800/50 px-3 py-1.5 rounded-lg transition-colors">
                Invite
              </button>
              <button 
                onClick={() => setShowMembersSidebar(false)}
                className="text-text-muted hover:text-white p-1 transition-colors"
                title="Close Sidebar"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-4 border-b border-white/5 shrink-0">
            <div className="relative flex items-center">
              <svg className="absolute left-3 text-text-muted" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="8"></circle><line x1="21" x2="16.65" y1="21" y2="16.65"></line></svg>
              <input className="w-full bg-[#1a1d2d] border border-white/5 text-sm rounded-lg pl-9 pr-4 py-2 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder-text-muted/60 text-white outline-none" placeholder="Search members..." type="text"/>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
            {onlineMembers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-text-muted tracking-wide cursor-pointer hover:text-text transition-colors">
                  Online — <span className="text-status-online">{onlineMembers.length}</span>
                </div>
                <ul className="space-y-3">
                  {onlineMembers.map(m => (
                    <li key={m.id} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-[#8b5cf6] flex items-center justify-center font-bold text-xs text-white">
                            {m.username.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-status-online border-2 border-[#151723] rounded-full"></span>
                        </div>
                        <div>
                          <div className="text-sm font-medium flex items-center gap-1.5">
                            <span className="text-white">{m.username}</span>
                            {m.username === user?.username && (
                              <>
                                <span className="text-text-muted text-xs font-normal">(You)</span>
                                <span className="text-[9px] bg-purple-900/60 text-purple-200 border border-purple-700/50 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">Owner</span>
                              </>
                            )}
                          </div>
                          <div className="text-xs text-text-muted">Online</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 text-xs text-[#a78bfa] hover:underline cursor-pointer">View all online ({onlineMembers.length})</div>
              </div>
            )}

            {awayMembers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-text-muted tracking-wide">
                  Away — <span className="text-status-away">{awayMembers.length}</span>
                </div>
                <ul className="space-y-3">
                  {awayMembers.map(m => (
                    <li key={m.id} className="flex items-center justify-between group cursor-pointer opacity-70">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-[#3b4155] flex items-center justify-center font-bold text-xs text-white">
                            {m.username.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-status-away border-2 border-[#151723] rounded-full"></span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{m.username}</div>
                          <div className="text-xs text-text-muted">Away</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {offlineMembers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-text-muted tracking-wide">
                  Offline — <span className="text-status-offline">{offlineMembers.length}</span>
                </div>
                <ul className="space-y-3">
                  {offlineMembers.map(m => (
                    <li key={m.id} className="flex items-center justify-between group cursor-pointer opacity-50 grayscale">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-[#1a1d2d] flex items-center justify-center font-bold text-xs text-white">
                            {m.username.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-status-offline border-2 border-[#151723] rounded-full"></span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{m.username}</div>
                          <div className="text-xs text-text-muted">Offline</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 text-xs text-[#a78bfa] hover:underline cursor-pointer">View all offline ({offlineMembers.length})</div>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Footer bar */}
      <footer className="absolute bottom-0 left-0 right-0 h-10 bg-surface-dim border-t border-white/5 flex items-center justify-between px-4 text-xs text-text-muted z-20 shrink-0 select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-status-online font-semibold">
            🟢 Connected
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-status-offline"></span>
            WebSocket Status: {connectionStatus}
          </div>
          <div>Server: US-East-1</div>
        </div>
        <button onClick={handleLeaveRoom} className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors border border-red-500/30 hover:bg-red-500/10 px-3 py-1 rounded-lg">
          Leave Room
          <svg fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
        </button>
      </footer>

    </div>
  );
};

export default RoomChatPage;
