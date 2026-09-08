import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import api from '../services/api';
import CreateRoomModal from '../components/modals/CreateRoomModal';
import { VideoCall } from '../components/VideoCall';
import { GlobalSearchModal } from '../components/modals/GlobalSearchModal';
import { SettingsModal } from '../components/modals/SettingsModal';

interface Room {
  id: string;
  name: string;
  description?: string;
  isDirectMessage?: boolean;
}

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(prev => !prev);
      }
    };
    
    const handleOpenSettings = () => {
      setIsSettingsOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-settings', handleOpenSettings);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-settings', handleOpenSettings);
    };
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/api/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Failed to load rooms list', error);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleRoomCreated = (newRoom: Room) => {
    setRooms((prev) => [...prev, newRoom]);
    setIsCreateModalOpen(false);
    navigate(`/rooms/${newRoom.id}`);
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-[#0a0a0b] text-[#e2e2e5]">
      <Outlet context={{ rooms, fetchRooms, onOpenCreateModal: () => setIsCreateModalOpen(true) }} />

      {/* Interactive 4-step Room Creation Wizard Modal */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleRoomCreated}
      />

      {/* Global Search Modal (Cmd+K) */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
      />

      {/* Global Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Global Picture-in-Picture Video Call Overlay */}
      <VideoCall />
    </div>
  );
};

export default AppLayout;
