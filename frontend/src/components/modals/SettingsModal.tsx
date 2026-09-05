import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const THEME_COLORS = [
  { id: 'purple', label: 'Purple (Default)', hex: '#7c3aed' },
  { id: 'blue', label: 'Blue', hex: '#3b82f6' },
  { id: 'emerald', label: 'Emerald', hex: '#10b981' },
  { id: 'rose', label: 'Rose', hex: '#e11d48' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, updateSettings } = useAuth();
  const [themeColor, setThemeColor] = useState(user?.themeColor || 'purple');
  const [notifications, setNotifications] = useState(user?.notificationsEnabled !== false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(themeColor, notifications);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f111a]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#1f2233] border border-white/5 rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-scale-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-text-muted transition-colors"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold text-white mb-6">User Settings</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-[#a78bfa] mb-3">Theme Color</h3>
            <div className="flex gap-3">
              {THEME_COLORS.map(color => (
                <button
                  key={color.id}
                  onClick={() => setThemeColor(color.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${themeColor === color.id ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: color.hex }}
                  title={color.label}
                >
                  {themeColor === color.id && <Check size={16} className="text-white" />}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-[#a78bfa] mb-3">Notifications</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-5 h-5 rounded border-white/10 bg-white/5 text-[#8b5cf6] focus:ring-[#8b5cf6] focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer"
              />
              <span className="text-sm text-gray-200">Enable Push Notifications</span>
            </label>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-xl text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};
