import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { getAvatarForUser } from '../../utils/avatarHelper';
import api from '../../services/api';

interface ThreadPanelProps {
  roomId: string;
  parentMessage: any;
  onClose: () => void;
}

export const ThreadPanel: React.FC<ThreadPanelProps> = ({ roomId, parentMessage, onClose }) => {
  const { user } = useAuth();
  const { sendMessage, presenceUsers } = useSocket();
  const [replies, setReplies] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/rooms/${roomId}/messages/${parentMessage.id || parentMessage.sequenceNumber}/replies`);
        setReplies(res.data);
      } catch (err) {
        console.error('Failed to fetch replies', err);
      } finally {
        setLoading(false);
      }
    };
    if (parentMessage) {
      fetchReplies();
    }
  }, [roomId, parentMessage]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [replies]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const content = inputText.trim();
    setInputText('');

    // Optimistic UI update
    const optimisticReply = {
      id: Math.random().toString(),
      roomId,
      senderId: user?.id,
      senderName: user?.username,
      content,
      createdAt: new Date().toISOString(),
      parentId: parentMessage.id || parentMessage.sequenceNumber,
    };
    setReplies((prev) => [...prev, optimisticReply]);

    // Send through WebSocket
    sendMessage(roomId, content, Math.random().toString(36).substring(2, 15), parentMessage.id || parentMessage.sequenceNumber);
  };

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <aside className="w-80 bg-[#151723] flex flex-col border-l border-white/5 flex-shrink-0 text-left font-sans h-full absolute right-0 z-20 md:relative">
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 shrink-0 bg-[#151723]">
        <h2 className="font-medium text-white flex items-center gap-2 text-base">
          Thread
          <span className="text-text-muted text-xs font-normal">Replies to {parentMessage.senderName}</span>
        </h2>
        <button onClick={onClose} className="text-text-muted hover:text-white p-1 transition-colors">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {/* Parent Message */}
        <div className="flex gap-3 mb-6 pb-6 border-b border-white/5">
          <div className="w-8 h-8 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center text-sm shrink-0 select-none">
            {getAvatarForUser(parentMessage.senderName || 'US', presenceUsers)}
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-semibold text-white text-sm">{parentMessage.senderName}</span>
              <span className="text-[10px] text-text-muted">{formatTime(parentMessage.createdAt || parentMessage.timestamp)}</span>
            </div>
            <div className="text-[14px] leading-relaxed text-gray-200">
              {parentMessage.content}
            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="space-y-4">
          <div className="text-xs font-medium text-text-muted mb-2">
            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </div>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            replies.map((reply, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center text-sm shrink-0 select-none">
                  {getAvatarForUser(reply.senderName || 'US', presenceUsers)}
                </div>
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">{reply.senderName}</span>
                    <span className="text-[10px] text-text-muted">{formatTime(reply.createdAt)}</span>
                  </div>
                  <div className="text-[14px] leading-relaxed text-gray-200">
                    {reply.content}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="p-4 border-t border-white/5 bg-[#0f111a] shrink-0">
        <form onSubmit={handleSendReply} className="bg-[#1f2233] border border-white/10 rounded-lg flex flex-col focus-within:border-brand-500/50 transition-all">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-transparent border-0 text-sm placeholder-text-muted/70 px-3 py-2 outline-none text-white"
            placeholder="Reply..."
          />
        </form>
      </div>
    </aside>
  );
};
