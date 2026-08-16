import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import api from '../../services/api';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (room: any) => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState(1);
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [roomType, setRoomType] = useState<'Private' | 'Public' | 'Restricted'>('Private');
  const [privacyJoin, setPrivacyJoin] = useState('Only invited members');
  const [isDefaultRoom, setIsDefaultRoom] = useState(false);
  
  // Advanced options
  const [onlyAdminsPost, setOnlyAdminsPost] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);
  const [slowMode, setSlowMode] = useState('off');
  const [ageRestricted, setAgeRestricted] = useState(false);
  const [enableHistory, setEnableHistory] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successRoom, setSuccessRoom] = useState<any>(null);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1 && !roomName.trim()) {
      setErrorMsg('Room name is required.');
      return;
    }
    const roomPattern = /^[a-z0-9-]+$/;
    if (step === 1 && !roomPattern.test(roomName)) {
      setErrorMsg('Lowercase letters, numbers, and hyphens only.');
      return;
    }
    setErrorMsg('');
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrorMsg('');
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const response = await api.post('/api/rooms', {
        name: roomName,
        description,
        isPrivate: roomType === 'Private',
      });
      setSuccessRoom(response.data);
      setStep(5); // Success step
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || 'Failed to create room. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDone = () => {
    if (successRoom) {
      onSuccess(successRoom);
    }
    // Reset wizard
    setStep(1);
    setRoomName('');
    setDescription('');
    setRoomType('Private');
    setPrivacyJoin('Only invited members');
    setIsDefaultRoom(false);
    setOnlyAdminsPost(false);
    setRequireApproval(false);
    setSlowMode('off');
    setAgeRestricted(false);
    setEnableHistory(true);
    setSuccessRoom(null);
    onClose();
  };

  const activeStepClass = "w-8 h-8 rounded-full bg-[#6b46c1] flex items-center justify-center text-white text-sm font-semibold shrink-0 shadow-[0_0_15px_rgba(107,70,193,0.5)] relative z-10";
  const inactiveStepClass = "w-8 h-8 rounded-full bg-[#0f111a] border border-[#2e3346] flex items-center justify-center text-[#94a3b8] text-sm font-semibold shrink-0 relative z-10";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050508]/85 backdrop-blur-sm">
      <div className="bg-[#151822] rounded-xl border border-[#2e3346] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col font-sans">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#2e3346] flex justify-between items-start text-left">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Create a New Room</h2>
            <p className="text-[#94a3b8] text-sm">Bring your team together in a dedicated space.</p>
          </div>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <div className="flex flex-1 min-h-[400px]">
          
          {/* Left Sidebar (Stepper) */}
          <div className="w-64 border-r border-[#2e3346] p-6 hidden md:block text-left relative">
            <div className="absolute left-10 top-11 bottom-11 w-px bg-[#2e3346] z-0"></div>
            <div className="space-y-8 relative z-10">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className={step >= 1 ? activeStepClass : inactiveStepClass}>1</div>
                <div>
                  <h3 className={`font-medium text-sm ${step >= 1 ? 'text-white' : 'text-[#94a3b8]'}`}>Room Details</h3>
                  <p className="text-[#94a3b8] text-[10px] mt-0.5">Basic information</p>
                </div>
              </div>
              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className={step >= 2 ? activeStepClass : inactiveStepClass}>2</div>
                <div>
                  <h3 className={`font-medium text-sm ${step >= 2 ? 'text-white' : 'text-[#94a3b8]'}`}>Privacy & Access</h3>
                  <p className="text-[#94a3b8] text-[10px] mt-0.5">Choose who can join</p>
                </div>
              </div>
              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className={step >= 3 ? activeStepClass : inactiveStepClass}>3</div>
                <div>
                  <h3 className={`font-medium text-sm ${step >= 3 ? 'text-white' : 'text-[#94a3b8]'}`}>Advanced Settings</h3>
                  <p className="text-[#94a3b8] text-[10px] mt-0.5">Optional configuration</p>
                </div>
              </div>
              {/* Step 4 */}
              <div className="flex items-start gap-4">
                <div className={step >= 4 ? activeStepClass : inactiveStepClass}>4</div>
                <div>
                  <h3 className={`font-medium text-sm ${step >= 4 ? 'text-white' : 'text-[#94a3b8]'}`}>Review</h3>
                  <p className="text-[#94a3b8] text-[10px] mt-0.5">Confirm and create</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 text-left overflow-y-auto">
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* STEP 1: Room Details */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex gap-6 items-start">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 bg-[#1a1d27] rounded-xl border border-[#2e3346] flex items-center justify-center text-[#6b46c1] text-3xl font-bold">
                      #
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-sm font-medium text-white">Room Name <span className="text-red-500">*</span></label>
                      <span className="text-xs text-[#94a3b8]">{roomName.length}/50</span>
                    </div>
                    <input 
                      type="text" 
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value.toLowerCase())}
                      className="w-full bg-[#0f111a] border border-[#2e3346] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#6b46c1] focus:ring-1 focus:ring-[#6b46c1] text-sm" 
                      placeholder="e.g. marketing-updates" 
                    />
                    <p className="text-[10px] text-[#94a3b8] mt-1.5">Lowercase letters, numbers and hyphens only.</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-sm font-medium text-white">Description</label>
                    <span className="text-xs text-[#94a3b8]">{description.length}/250</span>
                  </div>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#0f111a] border border-[#2e3346] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#6b46c1] focus:ring-1 focus:ring-[#6b46c1] resize-none" 
                    placeholder="What's this room about?" 
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-white block mb-3">Room Type</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Private */}
                    <label className={`relative flex flex-col p-4 rounded-xl cursor-pointer hover:bg-[#1f2330] transition-colors border-2 ${
                      roomType === 'Private' ? 'border-[#6b46c1] bg-[#1a1d27]' : 'border-[#2e3346] bg-[#0f111a]'
                    }`}>
                      <input 
                        type="radio" 
                        name="roomType" 
                        checked={roomType === 'Private'} 
                        onChange={() => setRoomType('Private')}
                        className="sr-only" 
                      />
                      <span className="font-semibold text-white text-sm mb-1">🔒 Private</span>
                      <span className="text-[10px] text-[#94a3b8] leading-relaxed">Only invited members can join.</span>
                    </label>
                    {/* Public */}
                    <label className={`relative flex flex-col p-4 rounded-xl cursor-pointer hover:bg-[#1f2330] transition-colors border-2 ${
                      roomType === 'Public' ? 'border-[#6b46c1] bg-[#1a1d27]' : 'border-[#2e3346] bg-[#0f111a]'
                    }`}>
                      <input 
                        type="radio" 
                        name="roomType" 
                        checked={roomType === 'Public'} 
                        onChange={() => setRoomType('Public')}
                        className="sr-only" 
                      />
                      <span className="font-semibold text-white text-sm mb-1">🌐 Public</span>
                      <span className="text-[10px] text-[#94a3b8] leading-relaxed">Anyone in your workspace can join.</span>
                    </label>
                    {/* Restricted */}
                    <label className={`relative flex flex-col p-4 rounded-xl cursor-pointer hover:bg-[#1f2330] transition-colors border-2 ${
                      roomType === 'Restricted' ? 'border-[#6b46c1] bg-[#1a1d27]' : 'border-[#2e3346] bg-[#0f111a]'
                    }`}>
                      <input 
                        type="radio" 
                        name="roomType" 
                        checked={roomType === 'Restricted'} 
                        onChange={() => setRoomType('Restricted')}
                        className="sr-only" 
                      />
                      <span className="font-semibold text-white text-sm mb-1">🛡️ Restricted</span>
                      <span className="text-[10px] text-[#94a3b8] leading-relaxed">Anyone can request to join.</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Privacy & Access */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <span className="text-sm font-semibold text-white mb-4 block">Who can join this room?</span>
                  <div className="space-y-4">
                    {/* Radio Option 1 */}
                    <label className="flex gap-3 cursor-pointer items-start">
                      <input 
                        type="radio" 
                        name="privacyJoin" 
                        checked={privacyJoin === 'Only invited members'}
                        onChange={() => setPrivacyJoin('Only invited members')}
                        className="mt-1 accent-[#6b46c1]" 
                      />
                      <div>
                        <div className="text-xs font-semibold text-white">Only invited members</div>
                        <div className="text-[10px] text-[#94a3b8]">Admins and moderators can invite others.</div>
                      </div>
                    </label>
                    {/* Radio Option 2 */}
                    <label className="flex gap-3 cursor-pointer items-start">
                      <input 
                        type="radio" 
                        name="privacyJoin" 
                        checked={privacyJoin === 'Anyone in the workspace'}
                        onChange={() => setPrivacyJoin('Anyone in the workspace')}
                        className="mt-1 accent-[#6b46c1]" 
                      />
                      <div>
                        <div className="text-xs font-semibold text-white">Anyone in the workspace</div>
                        <div className="text-[10px] text-[#94a3b8]">All workspace members can join automatically.</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-[#2e3346]">
                  <div>
                    <div className="text-xs font-semibold text-white">Set as default for new members</div>
                    <div className="text-[10px] text-[#94a3b8]">Automatically add new workspace members to this room.</div>
                  </div>
                  <input 
                    type="checkbox"
                    checked={isDefaultRoom}
                    onChange={(e) => setIsDefaultRoom(e.target.checked)}
                    className="w-4 h-4 rounded border-[#2e3346] bg-[#0f111a] text-[#6b46c1] focus:ring-[#6b46c1]"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Advanced settings */}
            {step === 3 && (
              <div className="space-y-4">
                <span className="text-sm font-semibold text-white block mb-2">Optional Configurations</span>
                
                {/* Admin only toggle */}
                <div className="flex items-center justify-between py-2 border-b border-[#2e3346]">
                  <div>
                    <div className="text-xs font-semibold text-white">📣 Only admins can post</div>
                    <div className="text-[10px] text-[#94a3b8]">Only admins and moderators can send messages.</div>
                  </div>
                  <input 
                    type="checkbox"
                    checked={onlyAdminsPost}
                    onChange={(e) => setOnlyAdminsPost(e.target.checked)}
                    className="w-4 h-4 rounded border-[#2e3346] bg-[#0f111a] text-[#6b46c1] focus:ring-[#6b46c1]"
                  />
                </div>

                {/* Require approval */}
                <div className="flex items-center justify-between py-2 border-b border-[#2e3346]">
                  <div>
                    <div className="text-xs font-semibold text-white">🛡️ Require approval to join</div>
                    <div className="text-[10px] text-[#94a3b8]">Requests to join must be approved.</div>
                  </div>
                  <input 
                    type="checkbox"
                    checked={requireApproval}
                    onChange={(e) => setRequireApproval(e.target.checked)}
                    className="w-4 h-4 rounded border-[#2e3346] bg-[#0f111a] text-[#6b46c1] focus:ring-[#6b46c1]"
                  />
                </div>

                {/* Slow mode */}
                <div className="flex items-center justify-between py-2 border-b border-[#2e3346]">
                  <div>
                    <div className="text-xs font-semibold text-white">⏱️ Slow mode</div>
                    <div className="text-[10px] text-[#94a3b8]">Limit how often members can send messages.</div>
                  </div>
                  <select 
                    value={slowMode}
                    onChange={(e) => setSlowMode(e.target.value)}
                    className="bg-[#0f111a] border border-[#2e3346] rounded px-2.5 py-1 text-xs text-white outline-none"
                  >
                    <option value="off">Off</option>
                    <option value="5s">5 sec</option>
                    <option value="10s">10 sec</option>
                    <option value="30s">30 sec</option>
                  </select>
                </div>

                {/* Age restricted */}
                <div className="flex items-center justify-between py-2 border-b border-[#2e3346]">
                  <div>
                    <div className="text-xs font-semibold text-white">🔞 Age-restricted room</div>
                    <div className="text-[10px] text-[#94a3b8]">Restrict access to verified adults only.</div>
                  </div>
                  <input 
                    type="checkbox"
                    checked={ageRestricted}
                    onChange={(e) => setAgeRestricted(e.target.checked)}
                    className="w-4 h-4 rounded border-[#2e3346] bg-[#0f111a] text-[#6b46c1] focus:ring-[#6b46c1]"
                  />
                </div>

                {/* Enable message history */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-xs font-semibold text-white">📜 Enable message history</div>
                    <div className="text-[10px] text-[#94a3b8]">New members can see previous messages.</div>
                  </div>
                  <input 
                    type="checkbox"
                    checked={enableHistory}
                    onChange={(e) => setEnableHistory(e.target.checked)}
                    className="w-4 h-4 rounded border-[#2e3346] bg-[#0f111a] text-[#6b46c1] focus:ring-[#6b46c1]"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: Review details */}
            {step === 4 && (
              <div className="space-y-4">
                <span className="text-sm font-semibold text-white block mb-2">Review Room Settings</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div className="bg-[#1a1d27] p-5 rounded-xl border border-[#2e3346] space-y-4">
                    <div>
                      <div className="text-[10px] text-[#94a3b8] uppercase font-bold">Room Name</div>
                      <div className="text-sm text-white font-semibold flex items-center gap-1.5">
                        <span className="text-[#6b46c1] font-bold">#</span>{roomName}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#94a3b8] uppercase font-bold">Description</div>
                      <div className="text-xs text-white">{description || 'Discuss roadmap initiatives, milestones and product strategy.'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#94a3b8] uppercase font-bold">Room Type</div>
                      <div className="text-xs text-white">{roomType}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#94a3b8] uppercase font-bold">Access level</div>
                      <div className="text-xs text-white">{privacyJoin}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#94a3b8] uppercase font-bold">Advanced Settings</div>
                      <div className="text-xs text-white">
                        {onlyAdminsPost ? '• Admins only post ' : ''}
                        {requireApproval ? '• Membership Approval required ' : ''}
                        {slowMode !== 'off' ? `• Slow Mode (${slowMode}) ` : ''}
                        {!onlyAdminsPost && !requireApproval && slowMode === 'off' && 'No custom configs enabled'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1a1d27] p-5 rounded-xl border border-[#2e3346] flex flex-col items-center justify-center text-center">
                    <div className="relative w-28 h-28 bg-[#151822] rounded-2xl border-2 border-dashed border-[#6b46c1]/40 flex items-center justify-center text-[#6b46c1] text-5xl font-bold mb-4 shadow-[0_0_20px_rgba(107,70,193,0.15)]">
                      #
                      <span className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-4 border-[#1a1d27] flex items-center justify-center text-white text-[10px]">
                        ✓
                      </span>
                    </div>
                    <button 
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full py-2.5 px-4 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
                    >
                      {submitting ? 'Creating...' : '✓ Create Room'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Success screen */}
            {step === 5 && (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-6">
                <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full flex items-center justify-center text-3xl shadow-lg shadow-green-500/10">
                  ✓
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Room created successfully!</h3>
                  <p className="text-xs text-[#94a3b8] max-w-sm">The channel <span className="text-[#6b46c1] font-semibold">#{roomName}</span> is now active. You can start sending messages and invite members.</p>
                </div>
                
                {/* Success alert banner */}
                <div className="w-full max-w-md bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold py-3 px-4 rounded-lg flex items-center justify-between">
                  <span>Room "{roomName}" created successfully!</span>
                  <span>✓</span>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#2e3346] flex justify-end gap-3 bg-[#151822] shrink-0">
          {step === 5 ? (
            <button 
              onClick={handleDone}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            >
              Done
            </button>
          ) : (
            <>
              {step > 1 && (
                <button 
                  onClick={handleBack}
                  className="px-5 py-2 rounded-lg text-sm font-medium text-white border border-[#2e3346] hover:bg-[#1a1d27] transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              )}
              
              <button 
                onClick={onClose}
                className="px-5 py-2 rounded-lg text-sm font-medium text-white border border-[#2e3346] hover:bg-[#1a1d27] transition-colors"
              >
                Cancel
              </button>

              {step < 4 ? (
                <button 
                  onClick={handleNext}
                  className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-[#6b46c1] hover:bg-[#553c9a] transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(107,70,193,0.5)]"
                >
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-[#6b46c1] hover:bg-[#553c9a] transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(107,70,193,0.5)] disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Room'}
                </button>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default CreateRoomModal;
