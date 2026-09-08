import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, MessageSquare, Hash, User as UserIcon } from 'lucide-react';
import api from '../../services/api';
import { getAvatarForUser } from '../../utils/avatarHelper';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const response = await api.get(`/api/messages/search?q=${encodeURIComponent(query)}&size=10`);
        setResults(response.data.content || []);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0f111a]/80 backdrop-blur-md z-[100] flex items-start justify-center pt-[10vh] p-4">
      <div className="bg-[#1f2233] border border-white/10 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in-up">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-white/5 bg-[#151724]">
          <Search className="text-[#a78bfa] w-5 h-5 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages across all rooms..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-lg"
          />
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded transition-colors ml-2"
          >
            <span className="text-xs font-mono bg-white/10 px-1.5 py-0.5 rounded mr-1">ESC</span>
            <X className="w-4 h-4 inline" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          {loading && (
            <div className="p-8 text-center text-gray-400 flex flex-col items-center">
              <div className="w-6 h-6 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin mb-3"></div>
              Searching...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              No results found for "<span className="text-white">{query}</span>"
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Messages
              </div>
              {results.map((msg, idx) => (
                <button
                  key={msg.id || idx}
                  onClick={() => {
                    navigate(`/rooms/${msg.roomId}`);
                    onClose();
                  }}
                  className="w-full text-left p-3 hover:bg-white/5 rounded-lg transition-colors flex items-start gap-3 group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#151724] border border-white/10 shrink-0 flex items-center justify-center text-xs overflow-hidden">
                    {getAvatarForUser(msg.senderName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-white text-sm">{msg.senderName}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        in <Hash className="w-3 h-3"/> Room
                      </span>
                      <span className="text-[10px] text-gray-500 ml-auto">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-300 line-clamp-2 prose prose-invert prose-sm max-w-none">
                       <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!query && (
            <div className="p-8 text-center flex flex-col items-center justify-center opacity-50">
              <Search className="w-12 h-12 text-gray-500 mb-4" />
              <p className="text-gray-400 text-sm">Type to search across all your rooms and messages.</p>
              <div className="flex gap-4 mt-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <Hash className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">Rooms</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">Messages</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">Users</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-[#151724] px-4 py-2 text-xs text-gray-500 flex justify-between items-center border-t border-white/5">
          <div className="flex items-center gap-3">
            <span><kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono">↑</kbd> <kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono">↓</kbd> to navigate</span>
            <span><kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono">Enter</kbd> to select</span>
          </div>
          <div>Global Search by SyncStream</div>
        </div>
      </div>
    </div>
  );
};
