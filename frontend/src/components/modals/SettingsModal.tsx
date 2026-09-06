import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Check, User as UserIcon, Mic, MonitorPlay } from 'lucide-react';

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
  const { user, updateSettings, updateProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'account' | 'voice'>('account');
  
  // Account State
  const [themeColor, setThemeColor] = useState(user?.themeColor || 'purple');
  const [notifications, setNotifications] = useState(user?.notificationsEnabled !== false);
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [gender, setGender] = useState(user?.gender || '');
  
  // Voice & Video State
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState(localStorage.getItem('syncstream_micId') || 'default');
  const [selectedCam, setSelectedCam] = useState(localStorage.getItem('syncstream_camId') || 'default');
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === 'voice') {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        setAudioDevices(devices.filter(d => d.kind === 'audioinput'));
        setVideoDevices(devices.filter(d => d.kind === 'videoinput'));
      }).catch(err => console.error("Could not enumerate devices", err));
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === 'account') {
        await updateSettings(themeColor, notifications);
        await updateProfile(gender, avatar);
      } else {
        localStorage.setItem('syncstream_micId', selectedMic);
        localStorage.setItem('syncstream_camId', selectedCam);
      }
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f111a]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#1f2233] border border-white/5 rounded-2xl w-full max-w-2xl shadow-2xl relative flex overflow-hidden h-[500px]">
        {/* Sidebar */}
        <div className="w-1/3 bg-[#151724] border-r border-white/5 p-4 flex flex-col gap-2">
          <h2 className="text-xl font-bold text-white mb-4 px-2">Settings</h2>
          <button 
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all ${activeTab === 'account' ? 'bg-[#7c3aed] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <UserIcon size={18} /> My Account
          </button>
          <button 
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all ${activeTab === 'voice' ? 'bg-[#7c3aed] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Mic size={18} /> Voice & Video
          </button>
        </div>
        
        {/* Main Content */}
        <div className="w-2/3 p-6 flex flex-col relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-text-muted transition-colors z-10"
          >
            <X size={20} />
          </button>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {activeTab === 'account' && (
              <div className="space-y-6 animate-fade-in-up">
                <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2">My Account</h3>
                
                <div>
                  <h4 className="text-sm font-semibold text-[#a78bfa] mb-2">Avatar URL</h4>
                  <input 
                    type="text" 
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                    className="w-full bg-[#151724] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#7c3aed]"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to use automatically generated avatar.</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[#a78bfa] mb-2">Gender</h4>
                  <select 
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-[#151724] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#7c3aed]"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[#a78bfa] mb-3">Theme Color</h4>
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
                  <h4 className="text-sm font-semibold text-[#a78bfa] mb-3">Notifications</h4>
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
            )}

            {activeTab === 'voice' && (
              <div className="space-y-6 animate-fade-in-up">
                <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2">Voice & Video Settings</h3>
                
                <div>
                  <h4 className="text-sm font-semibold text-[#a78bfa] mb-2 flex items-center gap-2"><Mic size={16}/> Input Device (Microphone)</h4>
                  <select 
                    value={selectedMic}
                    onChange={(e) => setSelectedMic(e.target.value)}
                    className="w-full bg-[#151724] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#7c3aed]"
                  >
                    <option value="default">Default Device</option>
                    {audioDevices.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${device.deviceId.substring(0,5)}...`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[#a78bfa] mb-2 flex items-center gap-2"><MonitorPlay size={16}/> Camera</h4>
                  <select 
                    value={selectedCam}
                    onChange={(e) => setSelectedCam(e.target.value)}
                    className="w-full bg-[#151724] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#7c3aed]"
                  >
                    <option value="default">Default Device</option>
                    {videoDevices.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${device.deviceId.substring(0,5)}...`}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-xs text-yellow-500/80">Note: To see devices named correctly, you may need to grant camera/microphone permissions in your browser first.</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800 flex justify-end gap-3 shrink-0">
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
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
