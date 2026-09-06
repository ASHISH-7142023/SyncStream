import React from 'react';
import Modal from '../ui/Modal';

interface UpgradeProModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeProModal: React.FC<UpgradeProModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upgrade to Pro">
      <div className="flex flex-col gap-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-[#8b5cf6] to-[#ec4899] p-[2px] mb-2 shadow-[0_0_20px_rgba(139,92,246,0.4)]">
          <div className="w-full h-full bg-[#151723] rounded-full flex items-center justify-center text-white text-2xl">
            ✨
          </div>
        </div>
        
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">SyncStream Pro</h3>
          <p className="text-sm text-text-muted">Take your team's collaboration to the next level with unlimited features and premium support.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 text-left bg-[#1f2233]/50 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-check text-[#10b981]"></i>
            <span className="text-sm text-gray-300">Unlimited message history</span>
          </div>
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-check text-[#10b981]"></i>
            <span className="text-sm text-gray-300">High-quality video & screen sharing</span>
          </div>
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-check text-[#10b981]"></i>
            <span className="text-sm text-gray-300">Up to 50GB file uploads per month</span>
          </div>
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-check text-[#10b981]"></i>
            <span className="text-sm text-gray-300">Priority 24/7 customer support</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] rounded-xl p-4 text-white shadow-xl shadow-[#8b5cf6]/20">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold">Pro Monthly</span>
            <span className="text-2xl font-bold">$9<span className="text-sm font-normal opacity-80">/mo</span></span>
          </div>
          <button 
            className="w-full bg-white text-[#8b5cf6] hover:bg-gray-100 font-bold py-2.5 rounded-lg transition-colors mt-2 cursor-pointer"
            onClick={onClose}
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UpgradeProModal;
