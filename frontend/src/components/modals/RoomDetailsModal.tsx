import React from 'react';
import Modal from '../ui/Modal';

interface RoomDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: any;
  memberCount: number;
}

const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({ isOpen, onClose, room, memberCount }) => {
  if (!room) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Room Details">
      <div className="flex flex-col gap-6 p-2">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center text-3xl font-bold shadow-lg border border-brand-500/30">
            {room.isDirectMessage ? '@' : '#'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              {room.isDirectMessage ? 'Direct Message' : room.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <span className="flex items-center gap-1.5"><i className="fa-solid fa-users text-xs"></i> {memberCount} Members</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><i className={room.isPrivate ? "fa-solid fa-lock text-xs" : "fa-solid fa-globe text-xs"}></i> {room.isPrivate ? 'Private' : 'Public'}</span>
            </div>
          </div>
        </div>

        {!room.isDirectMessage && (
          <div className="bg-[#1f2233]/50 border border-white/5 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-white mb-2">Description</h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              {room.description || 'No description provided for this room. Use this space for development discussions, updates, and real-time collaboration.'}
            </p>
          </div>
        )}

        <div className="bg-[#1f2233]/50 border border-white/5 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-white mb-3">Room Settings</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Notifications</span>
              <button className="w-10 h-5 bg-brand-500 rounded-full relative transition-colors cursor-pointer">
                <span className="absolute right-1 top-0.5 w-4 h-4 bg-white rounded-full"></span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Pin to Sidebar</span>
              <button className="w-10 h-5 bg-white/10 rounded-full relative transition-colors cursor-pointer hover:bg-white/20">
                <span className="absolute left-1 top-0.5 w-4 h-4 bg-gray-400 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RoomDetailsModal;
