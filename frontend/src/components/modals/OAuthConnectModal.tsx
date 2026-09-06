import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';

interface OAuthConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: 'Google' | 'GitHub';
}

const OAuthConnectModal: React.FC<OAuthConnectModalProps> = ({ isOpen, onClose, provider }) => {
  const [connecting, setConnecting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConnecting(true);
      setSuccess(false);
      // Simulate OAuth connection delay
      const timer1 = setTimeout(() => setConnecting(false), 2000);
      const timer2 = setTimeout(() => setSuccess(true), 2100);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOpen, provider]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect Provider">
      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#1f2233] flex items-center justify-center border border-white/10 shadow-lg z-10 relative">
            {provider === 'Google' ? (
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
            ) : (
              <svg aria-hidden="true" className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path>
              </svg>
            )}
          </div>
          {connecting && (
            <div className="absolute inset-[-10px] border-2 border-brand-500/50 rounded-2xl animate-spin" style={{ borderTopColor: 'transparent', animationDuration: '1.5s' }} />
          )}
        </div>

        {connecting ? (
          <>
            <h3 className="text-lg font-bold text-white mb-2">Redirecting to {provider}...</h3>
            <p className="text-sm text-text-muted text-center max-w-xs">
              Securely connecting you to the {provider} authorization flow to complete your authentication.
            </p>
          </>
        ) : success ? (
          <>
            <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4 text-xl">
              <i className="fa-solid fa-check"></i>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Development Mode</h3>
            <p className="text-sm text-text-muted text-center max-w-xs">
              OAuth2 Client IDs are not yet configured on this local environment. Please use email and password to login!
            </p>
            <button 
              onClick={onClose}
              className="mt-6 w-full bg-[#252d41] hover:bg-[#2d3748] text-white py-2 rounded-lg transition-colors font-medium text-sm"
            >
              Back to Login
            </button>
          </>
        ) : null}
      </div>
    </Modal>
  );
};

export default OAuthConnectModal;
