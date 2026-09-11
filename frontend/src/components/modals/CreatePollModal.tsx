import React, { useState } from 'react';
import { useSocket } from '../../context/SocketContext';

interface CreatePollModalProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CreatePollModal: React.FC<CreatePollModalProps> = ({ roomId, isOpen, onClose }) => {
  const { sendMessage } = useSocket();
  
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    // Filter out empty options
    const validOptions = options.map(opt => opt.trim()).filter(opt => opt.length > 0);
    if (validOptions.length < 2) return;

    setIsSubmitting(true);
    try {
      // Send the message as a poll
      const pollData = {
        question: question.trim(),
        options: validOptions,
        votes: {},
        multipleChoice
      };
      
      const clientMessageId = Math.random().toString(36).substring(2, 15);
      
      sendMessage(roomId, question.trim(), clientMessageId, undefined, {
        messageType: 'POLL',
        pollData
      });
      
      onClose();
      // Reset form
      setQuestion('');
      setOptions(['', '']);
      setMultipleChoice(false);
    } catch (err) {
      console.error('Failed to create poll', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-[#0f111a] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#151723]">
          <h2 className="text-lg font-semibold text-white">Create a Poll</h2>
          <button 
            onClick={onClose}
            className="text-[#94a3b8] hover:text-white transition-colors"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">Question</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask something..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-[#475569] focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-all"
                required
                maxLength={255}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">Options</label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-[#475569] focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-all"
                      required={index < 2} // First two are required
                      maxLength={100}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Remove Option"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {options.length < 10 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="mt-3 text-sm text-[#8b5cf6] hover:text-[#a78bfa] font-medium flex items-center gap-1.5 transition-colors"
                >
                  <i className="fa-solid fa-plus"></i>
                  Add Option
                </button>
              )}
            </div>

            <div className="pt-2 flex items-center gap-3">
              <input 
                type="checkbox"
                id="multipleChoice"
                checked={multipleChoice}
                onChange={(e) => setMultipleChoice(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-black/40 text-[#8b5cf6] focus:ring-[#8b5cf6]"
              />
              <label htmlFor="multipleChoice" className="text-sm text-[#cbd5e1] cursor-pointer">
                Allow selecting multiple options
              </label>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#94a3b8] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !question.trim() || options.filter(o => o.trim()).length < 2}
              className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-[#8b5cf6]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Poll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePollModal;
