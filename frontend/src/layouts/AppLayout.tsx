import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import api from '../services/api';
import CreateRoomModal from '../components/modals/CreateRoomModal';

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
    </div>
  );
};

export default AppLayout;
