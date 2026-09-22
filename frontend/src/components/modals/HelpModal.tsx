import React, { useEffect } from 'react';
import { X, MessageSquare, Phone, Lock, Command, File, Keyboard } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-[#151923] border border-[#27272A] rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-scale-in overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#27272A] bg-[#0F1117]">
          <div>
            <h2 className="text-xl font-bold text-[#F8FAFC]">SyncStream Help Center</h2>
            <p className="text-sm text-[#94A3B8] mt-1">Everything you need to know to navigate the workspace.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#27272A] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
          
          {/* Navigating Rooms */}
          <section className="space-y-3">
            <div className="flex items-center space-x-3 text-[#7C3AED]">
              <MessageSquare className="w-5 h-5" />
              <h3 className="text-lg font-semibold text-[#F8FAFC]">Navigating Rooms & Chat</h3>
            </div>
            <div className="bg-[#0F1117] border border-[#27272A] rounded-lg p-4 space-y-2">
              <p className="text-sm text-[#CBD5E1]">
                <strong className="text-white">Sidebar:</strong> The left panel holds your dashboard, room list, and profile settings. Click on the <strong>Rooms</strong> icon to see the public directory or create your own room.
              </p>
              <p className="text-sm text-[#CBD5E1]">
                <strong className="text-white">Chat Feed:</strong> Once inside a room, type your message in the bottom input bar. We support full Markdown formatting (like `**bold**` or ```code blocks```).
              </p>
            </div>
          </section>

          {/* Voice & Video Calls */}
          <section className="space-y-3">
            <div className="flex items-center space-x-3 text-[#10B981]">
              <Phone className="w-5 h-5" />
              <h3 className="text-lg font-semibold text-[#F8FAFC]">Voice & Video Calls (WebRTC)</h3>
            </div>
            <div className="bg-[#0F1117] border border-[#27272A] rounded-lg p-4 space-y-2">
              <p className="text-sm text-[#CBD5E1]">
                <strong className="text-white">Joining a Call:</strong> Inside any room, look for the green "Join Voice" button in the top right header. Clicking this instantly connects you to the room's peer-to-peer voice channel.
              </p>
              <p className="text-sm text-[#CBD5E1]">
                <strong className="text-white">Media Controls:</strong> After joining, you can toggle your Microphone and Camera using the bottom-center controls in the video grid.
              </p>
            </div>
          </section>

          {/* Slash Commands */}
          <section className="space-y-3">
            <div className="flex items-center space-x-3 text-[#F59E0B]">
              <Command className="w-5 h-5" />
              <h3 className="text-lg font-semibold text-[#F8FAFC]">Slash Commands</h3>
            </div>
            <div className="bg-[#0F1117] border border-[#27272A] rounded-lg p-4 space-y-2">
              <p className="text-sm text-[#CBD5E1]">
                <strong className="text-white">/gif [search]:</strong> Type `/gif cat` to instantly fetch and send a random trending cat GIF into the chat.
              </p>
              <p className="text-sm text-[#CBD5E1]">
                <strong className="text-white">/remind [delay] [msg]:</strong> Type `/remind 10m Take a break` to schedule a background task. You'll receive a private push notification in 10 minutes. Supported units are `s` (seconds), `m` (minutes), and `h` (hours).
              </p>
            </div>
          </section>

          {/* Secure DMs */}
          <section className="space-y-3">
            <div className="flex items-center space-x-3 text-[#3B82F6]">
              <Lock className="w-5 h-5" />
              <h3 className="text-lg font-semibold text-[#F8FAFC]">Secure DMs (E2EE)</h3>
            </div>
            <div className="bg-[#0F1117] border border-[#27272A] rounded-lg p-4 space-y-2">
              <p className="text-sm text-[#CBD5E1]">
                Direct messages between users are protected by End-to-End Encryption (AES-GCM). Neither the server nor database administrators can read your private messages.
              </p>
            </div>
          </section>

          {/* File Uploads */}
          <section className="space-y-3">
            <div className="flex items-center space-x-3 text-[#EC4899]">
              <File className="w-5 h-5" />
              <h3 className="text-lg font-semibold text-[#F8FAFC]">File Attachments</h3>
            </div>
            <div className="bg-[#0F1117] border border-[#27272A] rounded-lg p-4 space-y-2">
              <p className="text-sm text-[#CBD5E1]">
                Click the <strong>Paperclip</strong> icon next to the chat input to upload files, images, or PDFs. Files are chunked and streamed securely via MongoDB GridFS.
              </p>
            </div>
          </section>

          {/* Keyboard Shortcuts */}
          <section className="space-y-3">
            <div className="flex items-center space-x-3 text-[#94A3B8]">
              <Keyboard className="w-5 h-5" />
              <h3 className="text-lg font-semibold text-[#F8FAFC]">Keyboard Shortcuts</h3>
            </div>
            <div className="bg-[#0F1117] border border-[#27272A] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#CBD5E1]">Global Search</span>
                <kbd className="px-2 py-1 bg-[#151923] border border-[#27272A] rounded text-xs font-mono text-[#F8FAFC]">⌘ + K</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#CBD5E1]">Send Message</span>
                <kbd className="px-2 py-1 bg-[#151923] border border-[#27272A] rounded text-xs font-mono text-[#F8FAFC]">Enter</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#CBD5E1]">New Line in Chat</span>
                <kbd className="px-2 py-1 bg-[#151923] border border-[#27272A] rounded text-xs font-mono text-[#F8FAFC]">Shift + Enter</kbd>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default HelpModal;
