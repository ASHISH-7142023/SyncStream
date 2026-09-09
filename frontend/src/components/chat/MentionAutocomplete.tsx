import React, { useEffect, useState } from 'react';
import { getAvatarForUser } from '../../utils/avatarHelper';

interface Member {
  id: string;
  username: string;
  avatar?: string;
}

interface MentionAutocompleteProps {
  input: string;
  members: Member[];
  onSelect: (username: string) => void;
  cursorPosition?: number;
}

const MentionAutocomplete: React.FC<MentionAutocompleteProps> = ({ input, members, onSelect, cursorPosition }) => {
  const [active, setActive] = useState(false);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!input) {
      setActive(false);
      return;
    }

    // Determine the word currently being typed based on cursor position if provided,
    // otherwise just use the last word.
    let textToAnalyze = input;
    if (cursorPosition !== undefined) {
      textToAnalyze = input.slice(0, cursorPosition);
    }
    
    const words = textToAnalyze.split(/\s+/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('@') && lastWord.length >= 1) {
      const query = lastWord.slice(1).toLowerCase();
      const matches = members.filter(m => m.username.toLowerCase().includes(query));
      
      if (matches.length > 0) {
        setFilteredMembers(matches);
        setActive(true);
        setSelectedIndex(0); // reset selection
      } else {
        setActive(false);
      }
    } else {
      setActive(false);
    }
  }, [input, cursorPosition, members]);

  // Handle keyboard navigation globally when active
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredMembers.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredMembers.length) % filteredMembers.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        onSelect(filteredMembers[selectedIndex].username);
        setActive(false);
      } else if (e.key === 'Escape') {
        setActive(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true); // Use capture phase to intercept before chat input
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [active, filteredMembers, selectedIndex, onSelect]);

  if (!active || filteredMembers.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#1f2233] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
      <div className="px-3 py-2 bg-[#151724] border-b border-white/5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Mentions
      </div>
      <div className="max-h-48 overflow-y-auto p-1 scrollbar-thin">
        {filteredMembers.map((member, idx) => (
          <div
            key={member.id}
            onClick={() => onSelect(member.username)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              idx === selectedIndex ? 'bg-[#7c3aed]/20 text-white' : 'text-gray-300 hover:bg-white/5'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-[#151724] flex items-center justify-center text-[10px] font-bold border border-white/10 shrink-0">
              {getAvatarForUser(member.username)}
            </div>
            <span className="font-medium text-sm truncate">{member.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentionAutocomplete;
