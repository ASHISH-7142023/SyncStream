import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import api from '../../services/api';

interface Webhook {
  id: string;
  roomId: string;
  token: string;
  name: string;
  createdAt: string;
}

interface CustomRole {
  id: string;
  name: string;
  color: string;
  permissions: string[];
}

interface RoomDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: any;
  memberCount: number;
}

const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({ isOpen, onClose, room, memberCount }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'roles' | 'webhooks'>('overview');
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loadingWebhooks, setLoadingWebhooks] = useState(false);
  const [newWebhookName, setNewWebhookName] = useState('');
  
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('#a78bfa');
  const [newRolePerms, setNewRolePerms] = useState<string[]>([]);
  const availablePerms = ['PIN_MESSAGES', 'MUTE_USERS', 'READ_ONLY', 'MANAGE_WEBHOOKS'];

  useEffect(() => {
    if (isOpen && activeTab === 'webhooks') {
      fetchWebhooks();
    }
  }, [isOpen, activeTab]);

  const fetchWebhooks = async () => {
    setLoadingWebhooks(true);
    try {
      const res = await api.get(`/api/rooms/${room.id}/webhooks`);
      setWebhooks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWebhooks(false);
    }
  };

  const createWebhook = async () => {
    if (!newWebhookName.trim()) return;
    try {
      await api.post(`/api/rooms/${room.id}/webhooks`, { name: newWebhookName });
      setNewWebhookName('');
      fetchWebhooks();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      await api.delete(`/api/rooms/${room.id}/webhooks/${id}`);
      fetchWebhooks();
    } catch (err) {
      console.error(err);
    }
  };

  const createRole = async () => {
    if (!newRoleName.trim()) return;
    try {
      await api.post(`/api/rooms/${room.id}/custom-roles`, {
        name: newRoleName,
        color: newRoleColor,
        permissions: newRolePerms
      });
      setNewRoleName('');
      setNewRolePerms([]);
      // we would need to refresh room here, but for now just reload window to keep it simple,
      // or we can invoke a callback to refresh room
      window.location.reload(); 
    } catch (err) {
      console.error(err);
    }
  };

  const toggleNewRolePerm = (perm: string) => {
    setNewRolePerms(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
  };

  if (!room) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Room Settings">
      <div className="flex border-b border-white/10 mb-4">
        <button 
          className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'overview' ? 'text-brand-400 border-b-2 border-brand-400' : 'text-text-muted hover:text-white'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        {!room.isDirectMessage && (
          <>
            <button 
              className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'roles' ? 'text-brand-400 border-b-2 border-brand-400' : 'text-text-muted hover:text-white'}`}
              onClick={() => setActiveTab('roles')}
            >
              Roles
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'webhooks' ? 'text-brand-400 border-b-2 border-brand-400' : 'text-text-muted hover:text-white'}`}
              onClick={() => setActiveTab('webhooks')}
            >
              Integrations
            </button>
          </>
        )}
      </div>

      <div className="flex flex-col gap-6 p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
        {activeTab === 'overview' && (
          <>
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
                  {room.description || 'No description provided.'}
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Existing Roles</h4>
              {room.customRoles && room.customRoles.length > 0 ? (
                <div className="space-y-2">
                  {room.customRoles.map((role: CustomRole) => (
                    <div key={role.id} className="flex items-center justify-between bg-[#1f2233]/50 border border-white/5 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }}></div>
                        <span className="text-white font-medium">{role.name}</span>
                      </div>
                      <span className="text-xs text-text-muted">{role.permissions.length} perms</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted">No custom roles created yet.</p>
              )}
            </div>

            <div className="border-t border-white/10 pt-4">
              <h4 className="text-sm font-semibold text-white mb-3">Create New Role</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Role Name (e.g., Designer)"
                  className="w-full bg-[#1f2233] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-500"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-muted">Color:</span>
                  <input type="color" value={newRoleColor} onChange={(e) => setNewRoleColor(e.target.value)} className="bg-transparent border-none w-8 h-8 cursor-pointer" />
                </div>
                <div className="space-y-2 mt-2">
                  <span className="text-sm text-white">Permissions:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {availablePerms.map(perm => (
                      <label key={perm} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input type="checkbox" checked={newRolePerms.includes(perm)} onChange={() => toggleNewRolePerm(perm)} className="accent-brand-500" />
                        {perm.replace('_', ' ')}
                      </label>
                    ))}
                  </div>
                </div>
                <button onClick={createRole} className="w-full py-2 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 transition-colors mt-2">
                  Create Role
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'webhooks' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Active Webhooks</h4>
              {loadingWebhooks ? (
                <div className="text-center text-text-muted text-sm py-4">Loading...</div>
              ) : webhooks.length > 0 ? (
                <div className="space-y-3">
                  {webhooks.map((wh) => (
                    <div key={wh.id} className="bg-[#1f2233]/50 border border-white/5 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{wh.name}</span>
                        <button onClick={() => deleteWebhook(wh.id)} className="text-red-400 hover:text-red-300 text-xs">
                          <i className="fa-solid fa-trash"></i> Delete
                        </button>
                      </div>
                      <div className="flex items-center gap-2 bg-[#1a1d2d] p-2 rounded border border-white/10">
                        <code className="text-xs text-brand-400 truncate flex-1 select-all">
                          {window.location.origin}/api/webhooks/{wh.token}
                        </code>
                        <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/${wh.token}`)} className="text-text-muted hover:text-white transition-colors" title="Copy Webhook URL">
                          <i className="fa-regular fa-copy"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted">No webhooks configured for this room.</p>
              )}
            </div>

            <div className="border-t border-white/10 pt-4">
              <h4 className="text-sm font-semibold text-white mb-3">Add Webhook</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Webhook Name (e.g., GitHub Issues)"
                  className="flex-1 bg-[#1f2233] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-500"
                  value={newWebhookName}
                  onChange={(e) => setNewWebhookName(e.target.value)}
                />
                <button onClick={createWebhook} className="px-4 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 transition-colors">
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RoomDetailsModal;
