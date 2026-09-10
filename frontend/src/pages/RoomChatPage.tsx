import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getAvatarForUser } from '../utils/avatarHelper';
import { ThreadPanel } from '../components/chat/ThreadPanel';
import { VideoGrid } from '../components/chat/VideoGrid';
import { useWebRTC } from '../hooks/useWebRTC';
import { fileService } from '../services/fileService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import RoomDetailsModal from '../components/modals/RoomDetailsModal';
import UpgradeProModal from '../components/modals/UpgradeProModal';
import { useToast } from '../context/ToastContext';
import { LinkPreviewCard } from '../components/chat/LinkPreviewCard';
import { useNotification } from '../context/NotificationContext';
import { E2EEAttachment } from '../components/chat/E2EEAttachment';

interface Member {
  id: string;
  username: string;
  role?: string;
  status?: 'ONLINE' | 'AWAY' | 'OFFLINE' | 'DO_NOT_DISTURB';
}

import UserProfilePopover from '../components/profile/UserProfilePopover';
import MentionAutocomplete from '../components/chat/MentionAutocomplete';

interface RoomDetails {
  id: string;
  name: string;
  description?: string;
  isPrivate?: boolean;
  isDirectMessage?: boolean;
  ownerId?: string;
  members?: string[];
  admins?: string[];
  moderators?: string[];
  bannedUsers?: string[];
}

const RoomChatPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user, logout, privateKey } = useAuth();
  const { 
    connectionStatus, messages, typingUsers, presenceUsers, readReceipts, unreadRoomCounts,
    joinRoom, leaveRoom, sendMessage, sendReaction, sendTyping, loadMessages, hasMoreMessages, loadMoreMessages, updateMessage, sendReadReceipt, getStompClient, sendWebRtcSignal, editMessage, deleteMessage
  } = useSocket();
  const { notifications, markAsRead: markNotificationAsRead } = useNotification();

  const {
    inCall,
    localStream,
    remoteStreams,
    isMicOn,
    isVideoOn,
    startCall,
    leaveCall,
    toggleMic,
    toggleVideo,
    toggleScreenShare,
    isScreenSharing,
  } = useWebRTC({
    roomId: roomId || '',
    userId: user?.id || '',
    username: user?.username || '',
    getStompClient,
    sendWebRtcSignal,
  });

  const { addToast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const feedEndRef = useRef<HTMLDivElement | null>(null);
  const feedStartRef = useRef<HTMLDivElement | null>(null);

  const [room, setRoom] = useState<RoomDetails | null>(null);
  const [inputText, setInputText] = useState('');
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [pinnedClosed, setPinnedClosed] = useState(false);
  const [showMembersSidebar, setShowMembersSidebar] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState(0);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [selectedThreadMsg, setSelectedThreadMsg] = useState<any | null>(null); // For composing a reply
  const [activeThreadMsg, setActiveThreadMsg] = useState<any | null>(null); // For viewing a thread
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [showUpgradePro, setShowUpgradePro] = useState(false);
  
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editInputText, setEditInputText] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedProfileUsername, setSelectedProfileUsername] = useState<string | null>(null);
  const [profilePopoverPos, setProfilePopoverPos] = useState({ x: 0, y: 0 });

  const [decryptedMessages, setDecryptedMessages] = useState<Record<string, string>>({});
  const [otherUserPubKey, setOtherUserPubKey] = useState<CryptoKey | null>(null);
  const [sharedSecret, setSharedSecret] = useState<CryptoKey | null>(null);

  const handleAvatarClick = (username: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    // For avatars in the main chat area (left side), popover should open to the right
    // For avatars in the member list (right side), popover should open to the left
    const isRightSide = rect.left > window.innerWidth / 2;
    setProfilePopoverPos({ 
      x: isRightSide ? rect.left - 300 : rect.right + 10, 
      y: rect.top + rect.height / 2 
    });
    setSelectedProfileUsername(username);
  };

  const handleReplyClick = (msg: any) => {
    setSelectedThreadMsg(msg);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleViewThreadClick = (msg: any) => {
    setActiveThreadMsg(msg);
  };

  const typingTimeoutRef = useRef<any>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

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
  }, [roomId, joinRoom, loadMessages, leaveRoom]);

  // Scroll to bottom
  const roomMessages = (roomId && messages[roomId]) || [];

  useEffect(() => {
    if (room?.isDirectMessage && privateKey) {
       const otherUserId = room.members?.find(m => m !== user?.id);
       if (otherUserId) {
         api.get(`/api/crypto/users/${otherUserId}/public-key`).then(async (res) => {
           if (res.status === 200 && res.data.publicKey) {
             const { cryptoService } = await import('../services/cryptoService');
             const key = await cryptoService.importPublicKey(res.data.publicKey);
             setOtherUserPubKey(key);
           }
         }).catch(console.error);
       }
    }
  }, [room, privateKey, user]);

  useEffect(() => {
     if (privateKey && otherUserPubKey) {
        import('../services/cryptoService').then(({cryptoService}) => {
           cryptoService.deriveSharedSecret(privateKey, otherUserPubKey).then(setSharedSecret).catch(console.error);
        });
     }
  }, [privateKey, otherUserPubKey]);

  useEffect(() => {
    if (!sharedSecret) return;
    const newDecrypted = { ...decryptedMessages };
    let hasChanges = false;
    
    const decryptAll = async () => {
      const { cryptoService } = await import('../services/cryptoService');
      for (const msg of roomMessages) {
        if (msg.content?.startsWith('E2EE:') && !newDecrypted[msg.id || msg.sequenceNumber]) {
           try {
             const decrypted = await cryptoService.decryptMessage(msg.content, sharedSecret);
             newDecrypted[msg.id || msg.sequenceNumber] = decrypted;
             hasChanges = true;
           } catch (e) {
             newDecrypted[msg.id || msg.sequenceNumber] = '🔒 (Decryption failed)';
             hasChanges = true;
           }
        }
      }
      if (hasChanges) {
        setDecryptedMessages(newDecrypted);
      }
    };
    decryptAll();
  }, [roomMessages, sharedSecret]);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages.length]);

  // Read Receipts: Detect when the feed end is visible
  useEffect(() => {
    const el = feedEndRef.current;
    if (!el || !roomId || roomMessages.length === 0 || !user) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const lastMsg = roomMessages[roomMessages.length - 1];
          // Check if we already sent a read receipt for this message
          const myLastRead = readReceipts[roomId]?.[user.id]?.messageId;
          if (lastMsg.id && lastMsg.id !== myLastRead) {
            sendReadReceipt(roomId, lastMsg.id);
          }

          // Clear any unread mentions for this room
          const roomMentions = notifications.filter(n => !n.read && n.referenceId === roomId && n.type === 'MENTION');
          roomMentions.forEach(n => markNotificationAsRead(n.id));
        }
      },
      { threshold: 1.0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [roomId, roomMessages.length, user, readReceipts, notifications]);

  // Infinite Scroll: Detect when the feed start is visible to load older messages
  useEffect(() => {
    const el = feedStartRef.current;
    if (!el || !roomId || !hasMoreMessages[roomId]) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMoreMessages(roomId);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [roomId, hasMoreMessages, loadMoreMessages]);

  const handleSendMessage = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!roomId) return;
    if (!inputText.trim() && !selectedFile) return;

    let attachmentData = null;
    
    if (selectedFile) {
      setUploading(true);
      try {
        let fileToUpload = selectedFile;
        // If E2EE is enabled, encrypt the file first
        if (room?.isDirectMessage && sharedSecret) {
           const { cryptoService } = await import('../services/cryptoService');
           fileToUpload = await cryptoService.encryptFile(selectedFile, sharedSecret);
        }

        const uploadRes = await fileService.uploadFile(fileToUpload);
        attachmentData = {
          messageType: selectedFile.type.startsWith('image/') ? 'IMAGE' : 'FILE',
          attachmentId: uploadRes.fileId,
          fileName: uploadRes.fileName,
          fileSize: uploadRes.fileSize,
          fileType: uploadRes.fileType,
        };
      } catch (err) {
        console.error('File upload failed', err);
        setUploading(false);
        // Show alert or toast here ideally
        return;
      }
      setUploading(false);
      setSelectedFile(null);
    }

    let finalContent = inputText.trim();
    if (room?.isDirectMessage && sharedSecret) {
       const { cryptoService } = await import('../services/cryptoService');
       finalContent = await cryptoService.encryptMessage(finalContent, sharedSecret);
    }

    sendMessage(roomId, finalContent, Math.random().toString(36).substring(2, 15), selectedThreadMsg?.id, attachmentData);
    setInputText('');
    setSelectedThreadMsg(null);

    isTypingRef.current = false;
    sendTyping(roomId, false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!roomId) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
      return;
    }

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

  const handleAddReaction = (msg: any, emoji: string) => {
    if (!roomId || !user) return;
    const existingUsers = msg.reactions?.[emoji] || [];
    const isActive = existingUsers.includes(user.username);
    sendReaction(roomId, msg.id || msg.sequenceNumber.toString(), emoji, !isActive);
  };

  const memberList: Member[] = (room?.members || []).map((userId) => {
    const presence = presenceUsers[userId];
    return {
      id: userId,
      username: presence?.username || `User_${userId.substring(0, 4)}`,
      status: presence?.status || 'OFFLINE',
    };
  });

  const onlineMembers = memberList.filter(m => m.status === 'ONLINE');
  const awayMembers = memberList.filter(m => m.status === 'AWAY');
  const dndMembers = memberList.filter(m => m.status === 'DO_NOT_DISTURB');
  const offlineMembers = memberList.filter(m => m.status === 'OFFLINE');

  const currentRoomTypingMap = (roomId && typingUsers[roomId]) || {};
  const typingUsernames = Object.keys(currentRoomTypingMap).filter(
    (username) => currentRoomTypingMap[username] && username !== user?.username
  );



  const handleMemberAction = async (targetUserId: string, action: 'promote_admin' | 'promote_mod' | 'demote' | 'kick' | 'ban') => {
    if (!roomId) return;
    try {
      if (action === 'promote_admin') {
        await api.post(`/api/rooms/${roomId}/roles/${targetUserId}`, { role: 'ADMIN' });
      } else if (action === 'promote_mod') {
        await api.post(`/api/rooms/${roomId}/roles/${targetUserId}`, { role: 'MODERATOR' });
      } else if (action === 'demote') {
        await api.post(`/api/rooms/${roomId}/roles/${targetUserId}`, { role: 'MEMBER' });
      } else if (action === 'kick') {
        await api.post(`/api/rooms/${roomId}/kick/${targetUserId}`);
      } else if (action === 'ban') {
        await api.post(`/api/rooms/${roomId}/ban/${targetUserId}`);
      }
      
      const res = await api.get(`/api/rooms/${roomId}`);
      setRoom(res.data);
      addToast(`Action ${action} successful`, 'success');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to apply action', 'error');
    }
  };

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
    <div className="h-screen flex flex-col overflow-hidden text-sm selection:bg-brand selection:text-white bg-[#0f111a] text-[#e2e8f0] font-sans antialiased">
      
      {/* Sidebar Backdrop for Mobile */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden cursor-pointer"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Main Workspace layout wrapper (excluding footer) */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">

      {/* Left Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#151723] flex flex-col border-r border-white/5 shrink-0 text-left transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:flex md:z-0
        ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
          <div className="flex items-center gap-2 text-brand-400 font-semibold text-xl tracking-tight cursor-pointer" onClick={() => navigate('/dashboard')}>
            <img src="/chat.png" alt="Logo" className="w-8 h-8 object-contain" />
            <img src="/name.png" alt="SyncStream" className="h-7 w-32 object-contain" />
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
                const unreadCount = unreadRoomCounts[r.id] || 0;
                const hasMention = notifications.some(n => !n.read && n.referenceId === r.id && n.type === 'MENTION');
                return (
                  <li key={r.id}>
                    <button 
                      onClick={() => navigate(`/rooms/${r.id}`)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors text-left ${
                        isActive ? 'bg-[#4c1d95]/40 text-[#ede9fe] font-medium' : 'text-text-muted hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {r.isDirectMessage ? (
                          <div className="w-5 h-5 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center text-[10px] text-[#8b5cf6] shrink-0 font-bold">
                            {r.name.replace('DM-', '').slice(0,2).toUpperCase()}
                          </div>
                        ) : (
                          <span className="text-lg opacity-60 font-light">#</span>
                        )}
                        <span className={`truncate ${unreadCount > 0 && !isActive ? 'text-white font-semibold' : ''}`}>{r.isDirectMessage ? 'DM Chat' : r.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {hasMention && <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>}
                        {!isActive && unreadCount > 0 && (
                          <span className="bg-[#8b5cf6] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
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
              <button 
                onClick={() => setShowUpgradePro(true)}
                className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-medium py-2 px-4 rounded-xl transition-colors cursor-pointer"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>

        {/* Profile Info block */}
        <div className="p-4 border-t border-obsidian-700 mt-auto flex items-center justify-between cursor-pointer hover:bg-obsidian-700 transition-colors" onClick={() => navigate('/profile')}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border border-obsidian-600 bg-obsidian-750 flex items-center justify-center text-xl select-none">
                {getAvatarForUser(user ? user.username : 'User', presenceUsers)}
              </div>
              <div className="absolute bottom-0 right-0 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-obsidian-900"></span>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{user ? user.username : 'User'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="relative flex h-2 w-2">
                  <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    user && presenceUsers[user.id]?.status === 'OFFLINE' ? 'bg-status-offline' :
                    user && presenceUsers[user.id]?.status === 'AWAY' ? 'bg-status-away' :
                    user && presenceUsers[user.id]?.status === 'DO_NOT_DISTURB' ? 'bg-red-400' :
                    'bg-green-400 animate-ping'
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    user && presenceUsers[user.id]?.status === 'OFFLINE' ? 'bg-status-offline' :
                    user && presenceUsers[user.id]?.status === 'AWAY' ? 'bg-status-away' :
                    user && presenceUsers[user.id]?.status === 'DO_NOT_DISTURB' ? 'bg-red-500' :
                    'bg-green-500'
                  }`}></span>
                </div>
                <p className={`text-xs truncate ${
                  user && presenceUsers[user.id]?.status === 'OFFLINE' ? 'text-status-offline' :
                  user && presenceUsers[user.id]?.status === 'AWAY' ? 'text-status-away' :
                  user && presenceUsers[user.id]?.status === 'DO_NOT_DISTURB' ? 'text-red-400' :
                  'text-slate-400'
                }`}>
                  {user && presenceUsers[user.id]?.customStatusText 
                    ? presenceUsers[user.id].customStatusText 
                    : (user && presenceUsers[user.id]?.status ? 
                        presenceUsers[user.id].status.charAt(0) + presenceUsers[user.id].status.slice(1).toLowerCase().replace(/_/g, ' ') 
                        : 'Online')}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                window.dispatchEvent(new CustomEvent('open-settings'));
              }}
              className="text-slate-500 hover:text-white p-1 transition-colors mr-2"
              title="Settings"
            >
              <i className="fa-solid fa-gear"></i>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
              className="text-slate-500 hover:text-red-400 p-1 transition-colors"
              title="Log Out"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
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
                {room?.isDirectMessage ? (
                  <span className="text-xl text-text-muted">@</span>
                ) : (
                  <span className="text-xl text-text-muted">#</span>
                )}
                <h1 className="text-lg font-semibold text-white">
                  {room ? (room.isDirectMessage ? room.name.replace('DM-', '').replace(user?.id || '', '').replace('-', '') || 'Direct Message' : room.name) : 'developers'}
                </h1>
                <button 
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`transition-all hover:scale-115 active:scale-90 cursor-pointer ${
                    isFavorite ? 'text-amber-400' : 'text-text-muted hover:text-brand-400'
                  }`}
                >
                  <svg fill={isFavorite ? 'currentColor' : 'none'} height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </button>
              </div>
              {!room?.isDirectMessage && (
                <span className="text-xs text-text-muted">{room?.description || 'Development discussions & updates'}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-[#94a3b8]">
            <div className="flex items-center -space-x-2">
              {onlineMembers.slice(0, 4).map((m) => (
                <div key={m.id} className="w-7 h-7 rounded-full border-2 border-[#0f111a] bg-[#334155] flex items-center justify-center text-sm select-none" title={m.username}>
                  {getAvatarForUser(m.username, presenceUsers)}
                </div>
              ))}
              {onlineMembers.length > 4 && (
                <div className="w-7 h-7 rounded-full border-2 border-[#0f111a] bg-[#1a1d2d] flex items-center justify-center text-[10px] text-text-muted font-medium select-none">
                  +{onlineMembers.length - 4}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1 border-l border-white/5 pl-4 shrink-0">

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={async (e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    if (val.trim()) {
                      setIsSearching(true);
                      try {
                        const response = await api.get(`/api/rooms/${roomId}/messages/search?q=${val}`);
                        setSearchResults(response.data.content);
                      } catch (err) {
                        console.error('Search failed', err);
                      }
                    } else {
                      setIsSearching(false);
                      setSearchResults([]);
                    }
                  }}
                  className="bg-black/20 border border-white/5 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-text-muted focus:outline-none focus:border-brand-500/50 w-32 focus:w-48 transition-all"
                />
                <i className="fa-solid fa-magnifying-glass text-xs absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"></i>
              </div>
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
              
              {/* WebRTC Video Call Button */}
              {!inCall && (
                <button 
                  onClick={startCall}
                  className="px-3 py-1.5 bg-[#8b5cf6]/20 hover:bg-[#8b5cf6]/30 text-[#a78bfa] hover:text-white rounded-lg transition-all hover:scale-105 active:scale-95 cursor-pointer text-xs font-semibold flex items-center gap-1.5 border border-[#8b5cf6]/30"
                >
                  <i className="fa-solid fa-video"></i>
                  Join Call
                </button>
              )}

              <button 
                onClick={() => setShowRoomDetails(true)}
                className="p-1.5 hover:bg-white/5 hover:text-white rounded-lg transition-all hover:scale-115 active:scale-90 cursor-pointer" 
                title="More Options"
              >
                <i className="fa-solid fa-ellipsis-vertical text-xs"></i>
              </button>
            </div>
          </div>
        </header>
 
        {/* WebRTC Video Grid */}
        {inCall && (
          <VideoGrid
            localStream={localStream}
            remoteStreams={remoteStreams}
            isMicOn={isMicOn}
            isVideoOn={isVideoOn}
            isScreenSharing={isScreenSharing}
            toggleMic={toggleMic}
            toggleVideo={toggleVideo}
            toggleScreenShare={toggleScreenShare}
            leaveCall={leaveCall}
            presenceUsers={presenceUsers}
            currentUsername={user?.username || 'You'}
          />
        )}

        {/* Pinned Message */}
        {!pinnedClosed && pinnedMessages.length > 0 && (
          <div className="px-6 py-2 shrink-0 animate-scale-in">
            <div className="bg-[#1f2233] rounded-xl p-3 flex items-center justify-between text-sm border border-white/5 text-left hover:border-[#a78bfa]/20 transition-all hover:scale-[1.01] active:scale-[0.99] duration-300">
              <div className="flex items-center gap-3">
                <svg className="text-brand-400 text-[#a78bfa] shrink-0" fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg"><line x1="12" x2="12" y1="17" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.68V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v4.68a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>
                <div className="flex flex-col min-w-0">
                  <span className="text-[#a78bfa] font-medium text-xs">Pinned by {pinnedMessages[0].senderName || 'User'}</span>
                  <span className="text-text-muted text-xs truncate max-w-lg line-clamp-1 prose prose-invert prose-p:my-0 prose-p:inline prose-a:text-[#a78bfa]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{pinnedMessages[0].content}</ReactMarkdown>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => setPinnedClosed(true)} className="text-text-muted hover:text-white transition-all hover:scale-115 active:scale-90 cursor-pointer">
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}



        {/* Chat Message Logs */}
        <div 
          className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6 scrollbar-thin relative"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isDragging) setIsDragging(true);
          }}
        >
          {isDragging && (
            <div 
              className="absolute inset-4 bg-[#8b5cf6]/10 backdrop-blur-sm z-50 flex items-center justify-center border-2 border-dashed border-[#8b5cf6] rounded-2xl transition-all"
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  setSelectedFile(e.dataTransfer.files[0]);
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <div className="flex flex-col items-center gap-4 text-[#8b5cf6] pointer-events-none">
                <div className="w-20 h-20 bg-[#8b5cf6]/20 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-cloud-arrow-up text-4xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-white">Drop file to attach</h3>
                <p className="text-sm text-[#a78bfa]">Share images, videos, or documents</p>
              </div>
            </div>
          )}
          
          {isSearching ? (
            <div className="absolute inset-0 bg-[#0f111a]/95 backdrop-blur-sm z-20 overflow-y-auto px-6 py-4 flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-brand-400 mb-2">Search Results ({searchResults.length})</h3>
              {searchResults.length === 0 ? (
                <div className="text-text-muted text-sm text-center mt-10">No messages found for "{searchQuery}"</div>
              ) : (
                searchResults.map((msg: any) => (
                  <div key={msg.id} className="bg-[#1f2233] p-4 rounded-xl border border-white/5 flex gap-4 text-left">
                    <div className="w-8 h-8 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center text-sm shrink-0">
                      {getAvatarForUser(msg.senderName || 'US', presenceUsers)}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-[#f8fafc] text-sm">{msg.senderName}</span>
                        <span className="text-[10px] text-text-muted font-medium">{formatTime(msg.createdAt)}</span>
                      </div>
                      <div className="text-sm text-gray-300 bg-white/5 px-2.5 py-1.5 rounded inline-block prose prose-invert prose-sm max-w-none prose-p:my-0 prose-a:text-[#a78bfa] prose-code:text-[#a78bfa] prose-code:bg-[#8b5cf6]/10 prose-code:px-1 prose-code:rounded">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : null}

          <div ref={feedStartRef} className="w-full h-1 shrink-0" />
          
          {roomMessages.map((msg: any, idx: number) => {
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
                <div className="flex gap-4 group text-left relative">
                  <div 
                    className="w-10 h-10 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center text-xl shrink-0 select-none mt-1 cursor-pointer"
                    onClick={(e) => handleAvatarClick(msg.sender || 'US', e)}
                  >
                    {getAvatarForUser(msg.sender || 'US', presenceUsers)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-white text-sm">{msg.sender}</span>
                      <span className="text-[10px] text-text-muted">{formatTime(msg.timestamp)}</span>
                    </div>
                    {msg.parentId && (() => {
                      const parentMsg = roomMessages.find((m: any) => m.id === msg.parentId);
                      return (
                        <div className="flex items-center gap-2 mb-1.5 opacity-70 hover:opacity-100 transition-opacity cursor-pointer text-xs">
                          <div className="w-4 h-4 border-l-2 border-t-2 border-white/20 rounded-tl mt-1 shrink-0"></div>
                          <div className="bg-white/5 border border-white/10 rounded px-2.5 py-1.5 truncate max-w-md flex-1">
                            <span className="font-semibold text-[#a78bfa] mr-2">@{parentMsg ? parentMsg.senderName : 'Unknown'}</span>
                            <span className="text-gray-300">{parentMsg ? parentMsg.content || 'Attachment' : 'Message unavailable'}</span>
                          </div>
                        </div>
                      );
                    })()}
                    {msg.deleted ? (
                      <div className="text-[13px] leading-relaxed text-gray-400 italic my-1 flex items-center gap-1.5 opacity-60">
                        <i className="fa-solid fa-ban text-[10px]"></i>
                        This message was deleted
                      </div>
                    ) : editingMessageId === msg.id ? (
                      <div className="my-2">
                        <input
                          type="text"
                          value={editInputText}
                          onChange={(e) => setEditInputText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (editInputText.trim() && editInputText !== msg.content && roomId) {
                                editMessage(roomId, msg.id, editInputText.trim());
                              }
                              setEditingMessageId(null);
                            } else if (e.key === 'Escape') {
                              setEditingMessageId(null);
                            }
                          }}
                          className="w-full bg-black/20 border border-brand-500/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:shadow-[0_0_0_1px_rgba(139,92,246,0.3)]"
                          autoFocus
                        />
                        <div className="text-[10px] text-text-muted mt-1 ml-1">
                          escape to <button onClick={() => setEditingMessageId(null)} className="text-[#a78bfa] hover:underline">cancel</button> • enter to <button onClick={() => {
                            if (editInputText.trim() && editInputText !== msg.content && roomId) {
                              editMessage(roomId, msg.id, editInputText.trim());
                            }
                            setEditingMessageId(null);
                          }} className="text-[#a78bfa] hover:underline">save</button>
                        </div>
                      </div>
                    ) : (
                      <div className={`text-[15px] leading-relaxed text-gray-200 prose prose-invert max-w-none prose-p:my-1 prose-a:text-[#a78bfa] prose-code:text-[#a78bfa] prose-code:bg-[#8b5cf6]/10 prose-code:px-1 prose-code:rounded prose-pre:bg-[#1f2233] prose-pre:border prose-pre:border-white/10 ${isMention ? 'bg-[#7c3aed]/15 border border-[#7c3aed]/20 rounded px-2.5 py-1.5 w-fit my-1' : ''}`}>
                        {msg.content?.startsWith('E2EE:') ? (
                          <>
                            <span className="text-[#8b5cf6] mr-2" title="End-to-End Encrypted">🔒</span>
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                a: ({node, ...props}) => {
                                  if (props.href?.startsWith('#mention-')) {
                                    return <span className="font-semibold text-brand-400 bg-brand-500/20 px-1 rounded">{props.children}</span>;
                                  }
                                  return <a {...props} className="text-[#a78bfa] hover:underline" />;
                                }
                              }}
                            >
                              {(decryptedMessages[msg.id || msg.sequenceNumber] || 'Decrypting...').replace(/@([a-zA-Z0-9_]+)/g, '[@$1](#mention-$1)')}
                            </ReactMarkdown>
                          </>
                        ) : (
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              a: ({node, ...props}) => {
                                if (props.href?.startsWith('#mention-')) {
                                  return <span className="font-semibold text-brand-400 bg-brand-500/20 px-1.5 py-0.5 rounded-md text-sm">{props.children}</span>;
                                }
                                return <a {...props} className="text-[#a78bfa] hover:underline" />;
                              }
                            }}
                          >
                            {(msg.content || '').replace(/@([a-zA-Z0-9_]+)/g, '[@$1](#mention-$1)')}
                          </ReactMarkdown>
                        )}
                        {msg.editedAt && <span className="text-[10px] text-gray-500 ml-2 italic select-none">(edited)</span>}
                      </div>
                    )}

                    {/* Link Previews */}
                    {msg.linkPreviews && msg.linkPreviews.length > 0 && !msg.deleted && (
                      <div className="flex flex-col gap-2 mt-2">
                        {msg.linkPreviews.map((preview: any, idx: number) => (
                          <LinkPreviewCard key={idx} preview={preview} />
                        ))}
                      </div>
                    )}
                    
                    {msg.attachmentId && (
                      <div className="mt-2 max-w-sm rounded-lg overflow-hidden border border-white/10 bg-[#1f2233]">
                        {msg.content?.startsWith('E2EE:') && sharedSecret ? (
                          <E2EEAttachment 
                            attachmentId={msg.attachmentId}
                            fileName={msg.fileName}
                            fileSize={msg.fileSize}
                            fileType={msg.fileType}
                            messageType={msg.messageType}
                            sharedSecret={sharedSecret}
                          />
                        ) : msg.messageType === 'IMAGE' ? (
                          <img 
                            src={fileService.getFileUrl(msg.attachmentId)} 
                            alt={msg.fileName} 
                            className="w-full h-auto max-h-60 object-contain bg-black/20"
                          />
                        ) : (
                          <a 
                            href={fileService.getFileUrl(msg.attachmentId)} 
                            download={msg.fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                          >
                            <div className="w-10 h-10 rounded bg-[#8b5cf6]/20 text-[#a78bfa] flex items-center justify-center shrink-0">
                              <i className="fa-solid fa-file"></i>
                            </div>
                            <div className="min-w-0 flex-1 text-left">
                              <div className="text-sm font-medium text-white truncate">{msg.fileName}</div>
                              <div className="text-xs text-text-muted">{msg.fileSize ? (msg.fileSize / 1024).toFixed(1) + ' KB' : 'Unknown size'}</div>
                            </div>
                            <div className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white">
                              <i className="fa-solid fa-download"></i>
                            </div>
                          </a>
                        )}
                      </div>
                    )}
                    
                    {/* Reactions */}
                    <div className="flex gap-2 mt-2 items-center flex-wrap">
                      {Object.entries(msg.reactions || {}).map(([emoji, users]: [string, any]) => {
                        const userList = users as string[];
                        const count = userList.length;
                        if (count === 0) return null;
                        const active = userList.includes(user?.username || '');
                        return (
                          <button 
                            key={emoji}
                            onClick={() => handleAddReaction(msg, emoji)}
                            className={`flex items-center gap-1.5 border rounded-full px-2.5 py-1 text-xs transition-colors ${
                              active 
                                ? 'bg-[#8b5cf6]/20 border-[#8b5cf6] text-white' 
                                : 'bg-[#1f2233] border-white/10 hover:border-white/20 text-text-muted'
                            }`}
                            title={userList.join(', ')}
                          >
                            <span>{emoji}</span>
                            <span>{count}</span>
                          </button>
                        );
                      })}
                      {/* Quick Reactions */}
                      <div className="flex items-center bg-[#151723] border border-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity overflow-hidden shadow-lg ml-2">
                        <div className="flex items-center px-1 border-r border-white/5 bg-[#0f111a]">
                          <i className="fa-regular fa-face-smile text-text-muted text-xs mx-1"></i>
                        </div>
                        <button 
                          onClick={() => handleAddReaction(msg, '👍')}
                          className="flex items-center justify-center w-7 h-7 hover:bg-white/10 transition-colors text-text-muted hover:text-white"
                          title="Thumbs Up"
                        >
                          👍
                        </button>
                        <button 
                          onClick={() => handleAddReaction(msg, '❤️')}
                          className="flex items-center justify-center w-7 h-7 hover:bg-white/10 transition-colors text-text-muted hover:text-white"
                          title="Heart"
                        >
                          ❤️
                        </button>
                        <button 
                          onClick={() => handleAddReaction(msg, '😂')}
                          className="flex items-center justify-center w-7 h-7 hover:bg-white/10 transition-colors text-text-muted hover:text-white"
                          title="Laugh"
                        >
                          😂
                        </button>
                        <button 
                          onClick={() => handleAddReaction(msg, '🔥')}
                          className="flex items-center justify-center w-7 h-7 hover:bg-white/10 transition-colors text-text-muted hover:text-white"
                          title="Fire"
                        >
                          🔥
                        </button>
                      </div>
                      <button 
                        onClick={() => handleReplyClick(msg)}
                        className="flex items-center gap-1.5 px-2 py-1 bg-transparent border border-transparent rounded-lg hover:bg-[#1f2233] hover:border-white/10 transition-colors text-text-muted opacity-0 group-hover:opacity-100 text-xs font-medium"
                      >
                        <svg fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                        Reply
                      </button>
                    </div>
                    
                    {/* Read Receipts */}
                    {(() => {
                      if (!roomId) return null;
                      const readers = Object.entries(readReceipts[roomId] || {})
                        .filter(([uId, data]) => data.messageId === msg.id && uId !== user?.id)
                        .map(([uId, data]) => ({ uId, username: data.username }));
                      
                      if (readers.length === 0) return null;
                      
                      return (
                        <div className="flex items-center justify-end mt-1 gap-0.5 pr-2">
                          {readers.map((r, i) => (
                            <div 
                              key={r.uId} 
                              className="w-4 h-4 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center overflow-hidden border border-[#0f111a] -ml-1.5 first:ml-0 z-[1]" 
                              style={{ zIndex: readers.length - i }}
                              title={`Read by ${r.username}`}
                            >
                              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(r.username)}&background=8b5cf6&color=fff&size=16`} alt={r.username} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {/* View Replies Button */}
                    {msg.replyCount > 0 && (
                      <div className="mt-2 flex">
                        <button
                          onClick={() => handleViewThreadClick(msg)}
                          className="flex items-center gap-2 text-xs font-medium text-[#a78bfa] hover:text-[#8b5cf6] transition-colors py-1 px-2 rounded hover:bg-[#8b5cf6]/10"
                        >
                          <i className="fa-solid fa-comments"></i>
                          {msg.replyCount} {msg.replyCount === 1 ? 'reply' : 'replies'}
                          {msg.lastReplyAt && (
                            <span className="text-text-muted font-normal ml-1">
                              • Last reply {new Date(msg.lastReplyAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Message Action Menu */}
                  <div className="absolute right-0 -top-4 bg-[#1f2233] border border-white/10 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                    <button 
                      onClick={async () => {
                        try {
                          await api.post(`/api/rooms/${roomId}/messages/${msg.id}/pin`, { pinned: !msg.pinned });
                          if (roomId) updateMessage(roomId, msg.id, { pinned: !msg.pinned });
                          if (!msg.pinned) {
                            setPinnedMessages(prev => [msg, ...prev]);
                            setPinnedClosed(false);
                          } else {
                            setPinnedMessages(prev => prev.filter(m => m.id !== msg.id));
                          }
                        } catch (e) { console.error('Failed to pin', e); }
                      }}
                      className="p-1.5 text-text-muted hover:text-white hover:bg-white/5 transition-colors cursor-pointer" 
                      title={msg.pinned ? "Unpin message" : "Pin message"}
                    >
                      <i className={`fa-solid fa-thumbtack text-xs ${msg.pinned ? 'text-brand-400' : ''}`}></i>
                    </button>
                    <button onClick={() => handleReplyClick(msg)} className="p-1.5 text-text-muted hover:text-white hover:bg-white/5 transition-colors cursor-pointer" title="Reply in thread">
                      <i className="fa-solid fa-reply text-xs"></i>
                    </button>
                    {!msg.deleted && msg.senderId === user?.id && (
                      <>
                        <button 
                          onClick={() => {
                            setEditingMessageId(msg.id);
                            setEditInputText(msg.content);
                          }}
                          className="p-1.5 text-text-muted hover:text-white hover:bg-white/5 transition-colors cursor-pointer" 
                          title="Edit message"
                        >
                          <i className="fa-solid fa-pen text-xs"></i>
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this message?') && roomId) {
                              deleteMessage(roomId, msg.id);
                            }
                          }}
                          className="p-1.5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer" 
                          title="Delete message"
                        >
                          <i className="fa-solid fa-trash text-xs"></i>
                        </button>
                      </>
                    )}
                    <button className="p-1.5 text-text-muted hover:text-white hover:bg-white/5 transition-colors cursor-pointer" title="More actions">
                      <i className="fa-solid fa-ellipsis-vertical text-xs"></i>
                    </button>
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

          <form onSubmit={handleSendMessage} className="bg-[#1f2233] border border-white/10 rounded-2xl flex flex-col focus-within:border-brand-500/50 focus-within:shadow-[0_0_0_1px_rgba(139,92,246,0.3)] transition-all overflow-hidden">
            {selectedThreadMsg && (
              <div className="flex items-center justify-between px-4 py-2 bg-black/20 border-b border-white/5">
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-semibold text-[#a78bfa] mb-0.5">Replying to {selectedThreadMsg.senderName}</span>
                  <span className="text-xs text-gray-400 truncate">{selectedThreadMsg.content || 'Attachment'}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedThreadMsg(null)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <i className="fa-solid fa-xmark text-sm"></i>
                </button>
              </div>
            )}
            
            {selectedFile && (
              <div className="px-4 pt-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-black/20 flex items-center justify-center relative group">
                  {selectedFile.type.startsWith('image/') ? (
                    <img src={URL.createObjectURL(selectedFile)} alt="preview" className="w-full h-full object-cover rounded opacity-80" />
                  ) : (
                    <i className="fa-solid fa-file text-[#a78bfa] text-xl"></i>
                  )}
                  <button 
                    type="button" 
                    onClick={() => setSelectedFile(null)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-xs text-text-muted truncate flex-1">
                  {selectedFile.name}
                </div>
              </div>
            )}
            <div className="relative flex items-center min-h-[44px]">
              <MentionAutocomplete 
                input={inputText}
                members={memberList}
                onSelect={(username) => {
                  const words = inputText.split(/\s+/);
                  words[words.length - 1] = `@${username} `;
                  setInputText(words.join(' '));
                  setTimeout(() => textareaRef.current?.focus(), 0);
                }}
              />
              <textarea 
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full bg-transparent border-0 text-[15px] placeholder-text-muted/70 resize-none py-3 px-4 focus:ring-0 min-h-[48px] outline-none text-white" 
                placeholder="Type a message..." 
                rows={1}
              />
            </div>
            <div className="flex items-center justify-between px-2 pb-2">
              <div className="flex items-center gap-1 text-text-muted">
                <button type="button" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><line x1="12" x2="12" y1="5" y2="19"></line><line x1="5" x2="19" y1="12" y2="12"></line></svg>
                </button>
                <button 
                  onClick={() => addToast("Rich text formatting tools: Use standard Markdown tags like **bold**, *italic*, or `code`.", 'info')}
                  type="button" 
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors font-serif font-bold text-sm cursor-pointer"
                >
                  Aa
                </button>
                <div className="relative" ref={emojiPickerRef}>
                  <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    type="button" 
                    className={`p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer ${showEmojiPicker ? 'text-[#a78bfa] bg-white/5' : ''}`}
                    title="Emoji Picker"
                  >
                    <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" x2="9.01" y1="9" y2="9"></line><line x1="15" x2="15.01" y1="9" y2="9"></line></svg>
                  </button>

                  {showEmojiPicker && (
                    <div className="absolute bottom-12 left-0 w-72 bg-[#1f2233] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col h-80 animate-scale-in">
                      {/* Header: Category Tabs */}
                      <div className="flex bg-[#151723] border-b border-white/5 p-1.5 justify-between shrink-0">
                        {emojiCategories.map((cat, idx) => (
                          <button 
                            key={idx}
                            type="button"
                            onClick={() => setSelectedEmojiCategory(idx)}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-base hover:bg-white/5 transition-colors cursor-pointer ${selectedEmojiCategory === idx ? 'bg-white/10 text-white' : 'text-text-muted'}`}
                            title={cat.name}
                          >
                            {cat.icon}
                          </button>
                        ))}
                      </div>
                      {/* Body: Emojis Grid */}
                      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin text-left">
                        <h4 className="text-[11px] font-semibold text-[#a78bfa] uppercase tracking-wider mb-2 select-none">
                          {emojiCategories[selectedEmojiCategory].name}
                        </h4>
                        <div className="grid grid-cols-7 gap-1">
                          {emojiCategories[selectedEmojiCategory].emojis.map((emoji, idx) => (
                            <button 
                              key={idx}
                              type="button"
                              onClick={() => {
                                setInputText(prev => prev + emoji);
                              }}
                              className="w-8 h-8 flex items-center justify-center text-xl hover:bg-white/5 rounded-lg active:scale-90 transition-all cursor-pointer"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => {
                    setInputText(prev => prev + '@');
                    setTimeout(() => textareaRef.current?.focus(), 0);
                  }}
                  type="button" 
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors font-bold cursor-pointer"
                >
                  @
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  type="button" 
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-muted cursor-pointer"
                >
                  <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                </button>
                <button type="submit" disabled={(!inputText.trim() && !selectedFile) || uploading} className="bg-brand-600 hover:bg-brand-500 text-white p-2 rounded-xl transition-colors shadow-lg shadow-brand-500/20 disabled:opacity-40">
                  {uploading ? (
                    <i className="fa-solid fa-spinner fa-spin"></i>
                  ) : (
                    <svg fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><line x1="22" x2="11" y1="2" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

      </main>

      {/* Right Sidebar */}
      {showMembersSidebar && (
        selectedThreadMsg ? (
          <ThreadPanel 
            roomId={roomId || ''} 
            parentMessage={selectedThreadMsg} 
            onClose={() => setSelectedThreadMsg(null)} 
          />
        ) : (
          <aside className="w-72 bg-[#151723] flex flex-col border-l border-white/5 flex-shrink-0 text-left font-sans">
            <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
              <h2 className="font-medium text-white flex items-center gap-1.5">
                Members <span className="text-text-muted text-sm font-normal">({memberList.length})</span>
              </h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`https://syncstream.dev/invite/room-${roomId}`);
                    addToast("Invite link copied to clipboard!", 'success');
                  }}
                  className="flex items-center gap-1.5 text-xs text-brand-300 bg-brand-900/30 hover:bg-brand-900/50 border border-brand-800/50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
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
                  <div 
                    onClick={() => addToast("Online Members: " + onlineMembers.map(m => m.username).join(', '), 'info')}
                    className="flex items-center gap-2 mb-3 text-xs font-semibold text-text-muted tracking-wide cursor-pointer hover:text-white transition-colors"
                  >
                    Online — <span className="text-status-online">{onlineMembers.length}</span>
                  </div>
                  <ul className="space-y-3">
                    {onlineMembers.map(m => (
                      <li key={m.id} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center text-lg select-none">
                              {getAvatarForUser(m.username, presenceUsers)}
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-status-online border-2 border-[#151723] rounded-full"></span>
                          </div>
                          <div>
                            <div className="text-sm font-medium flex items-center gap-1.5">
                              <span className="text-white">{m.username}</span>
                              {m.id === room?.ownerId && (
                                <span className="text-[9px] bg-purple-900/60 text-purple-200 border border-purple-700/50 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">Owner</span>
                              )}
                              {room?.admins?.includes(m.id) && m.id !== room?.ownerId && (
                                <span className="text-[9px] bg-blue-900/60 text-blue-200 border border-blue-700/50 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">Admin</span>
                              )}
                              {room?.moderators?.includes(m.id) && (
                                <span className="text-[9px] bg-emerald-900/60 text-emerald-200 border border-emerald-700/50 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">Mod</span>
                              )}
                              {m.username === user?.username && (
                                <span className="text-text-muted text-xs font-normal">(You)</span>
                              )}
                            </div>
                            <div className="text-xs text-text-muted truncate w-40">
                              {presenceUsers[m.id]?.customStatusText 
                                ? presenceUsers[m.id].customStatusText 
                                : 'Online'}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div 
                    onClick={() => addToast("Online Members: " + onlineMembers.map(m => m.username).join(', '), 'info')}
                    className="mt-3 text-xs text-[#a78bfa] hover:underline cursor-pointer"
                  >
                    View all online ({onlineMembers.length})
                  </div>
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
                          <div className="relative cursor-pointer" onClick={(e) => handleAvatarClick(m.username, e)}>
                            <div className="w-8 h-8 rounded-full bg-[#3b4155]/20 flex items-center justify-center text-lg select-none">
                              {getAvatarForUser(m.username, presenceUsers)}
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-status-away border-2 border-[#151723] rounded-full"></span>
                          </div>
                          <div>
                            <div className="flex flex-col">
                            <div className="text-sm font-medium flex items-center gap-1.5">
                              <span className="text-white">{m.username}</span>
                              {m.id === room?.ownerId && (
                                <span className="text-[9px] bg-purple-900/60 text-purple-200 border border-purple-700/50 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">Owner</span>
                              )}
                              {room?.admins?.includes(m.id) && m.id !== room?.ownerId && (
                                <span className="text-[9px] bg-blue-900/60 text-blue-200 border border-blue-700/50 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">Admin</span>
                              )}
                              {room?.moderators?.includes(m.id) && (
                                <span className="text-[9px] bg-emerald-900/60 text-emerald-200 border border-emerald-700/50 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">Mod</span>
                              )}
                            </div>
                            {user?.id && (room?.ownerId === user.id || room?.admins?.includes(user.id) || room?.moderators?.includes(user.id)) && user.id !== m.id && (
                              <div className="hidden group-hover:flex gap-1 mt-1">
                                {(room?.ownerId === user.id || room?.admins?.includes(user.id)) && (
                                  <>
                                    <button onClick={(e) => { e.stopPropagation(); handleMemberAction(m.id, 'kick'); }} className="text-[9px] bg-yellow-900/60 text-yellow-200 border border-yellow-700/50 px-1.5 py-0.5 rounded font-semibold hover:bg-yellow-800 transition">Kick</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleMemberAction(m.id, 'ban'); }} className="text-[9px] bg-red-900/60 text-red-200 border border-red-700/50 px-1.5 py-0.5 rounded font-semibold hover:bg-red-800 transition">Ban</button>
                                  </>
                                )}
                                {room?.ownerId === user.id && !room?.admins?.includes(m.id) && (
                                  <button onClick={(e) => { e.stopPropagation(); handleMemberAction(m.id, 'promote_admin'); }} className="text-[9px] bg-blue-900/60 text-blue-200 border border-blue-700/50 px-1.5 py-0.5 rounded font-semibold hover:bg-blue-800 transition">Admin</button>
                                )}
                              </div>
                            )}
                            </div>
                            <div className="text-xs text-text-muted truncate w-40">
                              {presenceUsers[m.id]?.customStatusText 
                                ? presenceUsers[m.id].customStatusText 
                                : 'Away'}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {dndMembers.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-text-muted tracking-wide">
                    Do Not Disturb — <span className="text-red-400">{dndMembers.length}</span>
                  </div>
                  <ul className="space-y-3">
                    {dndMembers.map(m => (
                      <li key={m.id} className="flex items-center justify-between group cursor-pointer opacity-90">
                        <div className="flex items-center gap-3">
                          <div className="relative cursor-pointer" onClick={(e) => handleAvatarClick(m.username, e)}>
                            <div className="w-8 h-8 rounded-full bg-[#ef4444]/20 flex items-center justify-center text-lg select-none">
                              {getAvatarForUser(m.username, presenceUsers)}
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-[#151723] rounded-full"></span>
                          </div>
                          <div>
                            <div className="flex flex-col">
                            <div className="text-sm font-medium flex items-center gap-1.5">
                              <span className="text-white">{m.username}</span>
                              {m.id === room?.ownerId && (
                                <span className="text-[9px] bg-purple-900/60 text-purple-200 border border-purple-700/50 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">Owner</span>
                              )}
                              {room?.admins?.includes(m.id) && m.id !== room?.ownerId && (
                                <span className="text-[9px] bg-blue-900/60 text-blue-200 border border-blue-700/50 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">Admin</span>
                              )}
                              {room?.moderators?.includes(m.id) && (
                                <span className="text-[9px] bg-emerald-900/60 text-emerald-200 border border-emerald-700/50 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">Mod</span>
                              )}
                            </div>
                            {user?.id && (room?.ownerId === user.id || room?.admins?.includes(user.id) || room?.moderators?.includes(user.id)) && user.id !== m.id && (
                              <div className="hidden group-hover:flex gap-1 mt-1">
                                {(room?.ownerId === user.id || room?.admins?.includes(user.id)) && (
                                  <>
                                    <button onClick={(e) => { e.stopPropagation(); handleMemberAction(m.id, 'kick'); }} className="text-[9px] bg-yellow-900/60 text-yellow-200 border border-yellow-700/50 px-1.5 py-0.5 rounded font-semibold hover:bg-yellow-800 transition">Kick</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleMemberAction(m.id, 'ban'); }} className="text-[9px] bg-red-900/60 text-red-200 border border-red-700/50 px-1.5 py-0.5 rounded font-semibold hover:bg-red-800 transition">Ban</button>
                                  </>
                                )}
                                {room?.ownerId === user.id && !room?.admins?.includes(m.id) && (
                                  <button onClick={(e) => { e.stopPropagation(); handleMemberAction(m.id, 'promote_admin'); }} className="text-[9px] bg-blue-900/60 text-blue-200 border border-blue-700/50 px-1.5 py-0.5 rounded font-semibold hover:bg-blue-800 transition">Admin</button>
                                )}
                              </div>
                            )}
                            </div>
                            <div className="text-xs text-text-muted truncate w-40">
                              {presenceUsers[m.id]?.customStatusText 
                                ? presenceUsers[m.id].customStatusText 
                                : 'Do Not Disturb'}
                            </div>
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
                          <div className="relative cursor-pointer" onClick={(e) => handleAvatarClick(m.username, e)}>
                            <div className="w-8 h-8 rounded-full bg-[#1a1d2d]/20 flex items-center justify-center text-lg select-none">
                              {getAvatarForUser(m.username, presenceUsers)}
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-status-offline border-2 border-[#151723] rounded-full"></span>
                          </div>
                          <div>
                            <div className="flex flex-col">
                            <div className="text-sm font-medium flex items-center gap-1.5">
                              <span className="text-white">{m.username}</span>
                              {m.id === room?.ownerId && (
                                <span className="text-[9px] bg-purple-900/60 text-purple-200 border border-purple-700/50 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">Owner</span>
                              )}
                              {room?.admins?.includes(m.id) && m.id !== room?.ownerId && (
                                <span className="text-[9px] bg-blue-900/60 text-blue-200 border border-blue-700/50 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">Admin</span>
                              )}
                              {room?.moderators?.includes(m.id) && (
                                <span className="text-[9px] bg-emerald-900/60 text-emerald-200 border border-emerald-700/50 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">Mod</span>
                              )}
                            </div>
                            {user?.id && (room?.ownerId === user.id || room?.admins?.includes(user.id) || room?.moderators?.includes(user.id)) && user.id !== m.id && (
                              <div className="hidden group-hover:flex gap-1 mt-1">
                                {(room?.ownerId === user.id || room?.admins?.includes(user.id)) && (
                                  <>
                                    <button onClick={(e) => { e.stopPropagation(); handleMemberAction(m.id, 'kick'); }} className="text-[9px] bg-yellow-900/60 text-yellow-200 border border-yellow-700/50 px-1.5 py-0.5 rounded font-semibold hover:bg-yellow-800 transition">Kick</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleMemberAction(m.id, 'ban'); }} className="text-[9px] bg-red-900/60 text-red-200 border border-red-700/50 px-1.5 py-0.5 rounded font-semibold hover:bg-red-800 transition">Ban</button>
                                  </>
                                )}
                                {room?.ownerId === user.id && !room?.admins?.includes(m.id) && (
                                  <button onClick={(e) => { e.stopPropagation(); handleMemberAction(m.id, 'promote_admin'); }} className="text-[9px] bg-blue-900/60 text-blue-200 border border-blue-700/50 px-1.5 py-0.5 rounded font-semibold hover:bg-blue-800 transition">Admin</button>
                                )}
                              </div>
                            )}
                            </div>
                            <div className="text-xs text-text-muted truncate w-40">
                              {presenceUsers[m.id]?.customStatusText 
                                ? presenceUsers[m.id].customStatusText 
                                : 'Offline'}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div 
                    onClick={() => addToast("Offline Members: " + offlineMembers.map(m => m.username).join(', '), 'info')}
                    className="mt-3 text-xs text-text-muted hover:text-white hover:underline cursor-pointer"
                  >
                    View all offline ({offlineMembers.length})
                  </div>
                </div>
              )}
            </div>
          </aside>
        )
      )}

      {/* Thread Panel */}
      {activeThreadMsg && (
        <aside className="w-80 flex-shrink-0 bg-[#0f111a] border-l border-white/5 flex flex-col z-20 shadow-2xl relative">
          <ThreadPanel 
            roomId={roomId || ''}
            parentMessage={activeThreadMsg}
            onClose={() => setActiveThreadMsg(null)}
          />
        </aside>
      )}

      </div>

      {/* Footer bar */}
      <footer className="h-10 bg-surface-dim border-t border-white/5 flex items-center justify-between px-4 text-xs text-text-muted z-20 shrink-0 select-none">
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

      {showRoomDetails && (
        <RoomDetailsModal
          isOpen={showRoomDetails}
          onClose={() => setShowRoomDetails(false)}
          room={room || { id: 'unknown', name: 'Unknown Room' }}
          memberCount={memberList.length}
        />
      )}

      {showUpgradePro && (
        <UpgradeProModal
          isOpen={showUpgradePro}
          onClose={() => setShowUpgradePro(false)}
        />
      )}

      {/* Modals & Overlays */}
      {selectedProfileUsername && (
        <UserProfilePopover 
          username={selectedProfileUsername} 
          position={profilePopoverPos} 
          onClose={() => setSelectedProfileUsername(null)} 
        />
      )}
    </div>
  );
};

const emojiCategories = [
  {
    name: 'Smileys & Emotion',
    icon: '😀',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🫣', '🤭', '🫢', '🤫', '🤥', '😶', '😶‍🌫️', '😐', '😑', '😬', '🫠', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '😵‍💫', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾']
  },
  {
    name: 'People & Body',
    icon: '👋',
    emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸']
  },
  {
    name: 'Animals & Nature',
    icon: '🐱',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦤', '🪶', '🦩', '🦚', '🦜', '🐊', '🐢', '🦎', '🐍', '🐲', '🐉', '🦕', '🦖', '🐳', '🐋', '🐬', '🦭', '🐟', '🐠', '🐡', '🦈', '🐙', '🐚', '🪸', '🐌', '🦋', '🐛', '🐜', '🐝', '🪲', '🐞', '🦗', '🕷️', '🕸️', '🦂', '🦟', '🪰', '🪱', '🦠', '💐', '🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '🍀', '🍁', '🍂', '🍃']
  },
  {
    name: 'Food & Drink',
    icon: '🍔',
    emojis: ['🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🫐', '🥝', '🍅', '🫒', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🫑', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄', '🥜', '🫘', '🌰', '🍞', '🥐', '🥖', '🫓', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🫔', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🫕', '🥣', '🥗', '🍿', '🧈', '🧄', '🧂', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🦪', '🍡', '🥟', '🥠', '🥡', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🫖', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥤', '🧋', '🧃', '🧉', '🧊']
  },
  {
    name: 'Travel & Places',
    icon: '🚗',
    emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🛵', '🏍️', '🛺', '🚲', '🛴', '🛹', '🛼', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚂', '🚆', '🚇', '🚊', '🚉', '🚁', '🛩️', '✈️', '🛫', '🛬', '🚀', '🛸', '🛰️', '⛵', '🛥️', '🚤', '🚢', '⚓', '🛟', '🚧', '⛽', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏬', '🏭', '🏰', '🏯', '🏟️', '🗽', '🗼', '⛲', '⛺', '🌁', '🌃', '🌄', '🌅', '🌆', '🌇', '🌉', '🎠', '🎡', '🎢']
  },
  {
    name: 'Activities & Events',
    icon: '⚽',
    emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '🥌', '🎿', '⛷️', '🏂', '🏋️', '🤺', '🤼', '🤸', '⛹️', '🤾', '🧗', '🧘', '🚴', '🚵', '🏊', '🤽', '🚣', '🏄', '🏇', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🎫', '🎟️', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩']
  },
  {
    name: 'Objects & Devices',
    icon: '💡',
    emojis: ['⌚', '📱', '💻', '⌨️', '🖱️', '🖨️', '📺', '📷', '📹', '📼', '🔍', '🔎', '💡', '🔦', '🏮', '🪔', '📔', '📕', '📖', '📗', '📘', '📙', '📚', '📓', '📒', '📃', '📜', '📄', '¼', '📊', '📋', '📌', '📍', '📎', '📏', '📐', '✂️', '🗃️', '🗑️', '🔒', '🔓', '🔏', '🔐', '🔑', '🗝️', '🔨', '🪓', '⛏️', '🛠️', '🛡️', '🪚', '🔧', '🔩', '⚙️', '⚖️', '🔗', '⛓️', '🪝', '🧰', '🧲', '🪜', '🔬', '🔭', '📡', '💉', '💊', '🩹', '🪒', '🧴', '🧻', '🧼', '🧽', '🪠', '🧹', '🧺', '🚪', '🪞', '🪟', '🪑', '🛋️', '🛏️', '🧸', '🖼️', '🛍️', '🎁', '🎈', '🎏', '🎀', '🪄', '🪅', '🎊', '🎉']
  },
  {
    name: 'Symbols & Flags',
    icon: '🔣',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '📴', '📳', '🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🇺🇸', '🇬🇧', '🇨🇦', '🇪🇺', '🇯🇵', '🇩🇪', '🇫🇷', '🇮🇹', '🇮🇳', '🇨🇳']
  }
];

export default RoomChatPage;
