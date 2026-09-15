import React, { useEffect, useState } from 'react';

export interface GalleryImage {
  id: string;
  url: string;
  fileName: string;
  senderName: string;
  timestamp: string;
}

interface ImageGalleryModalProps {
  images: GalleryImage[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  images,
  initialIndex,
  isOpen,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  if (!isOpen || images.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 bg-gradient-to-b from-black/60 to-transparent z-10">
        <div className="flex flex-col">
          <span className="text-white font-medium truncate max-w-sm">{currentImage.fileName}</span>
          <span className="text-xs text-gray-400">
            Shared by {currentImage.senderName} • {new Date(currentImage.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="flex items-center gap-4 text-white">
          <span className="text-sm font-medium text-white/70">
            {currentIndex + 1} / {images.length}
          </span>
          <a
            href={currentImage.url}
            download={currentImage.fileName}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="Download"
          >
            <i className="fa-solid fa-download"></i>
          </a>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="Close"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
      </div>

      {/* Navigation Areas */}
      {images.length > 1 && (
        <>
          <div 
            className="absolute left-0 top-16 bottom-0 w-24 flex items-center justify-center cursor-pointer group z-10"
            onClick={handlePrev}
          >
            <div className="w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hover:bg-black/70">
              <i className="fa-solid fa-chevron-left text-xl"></i>
            </div>
          </div>
          <div 
            className="absolute right-0 top-16 bottom-0 w-24 flex items-center justify-center cursor-pointer group z-10"
            onClick={handleNext}
          >
            <div className="w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hover:bg-black/70">
              <i className="fa-solid fa-chevron-right text-xl"></i>
            </div>
          </div>
        </>
      )}

      {/* Image Container */}
      <div className="w-full h-full p-16 flex items-center justify-center" onClick={onClose}>
        <img
          src={currentImage.url}
          alt={currentImage.fileName}
          className="max-w-full max-h-full object-contain select-none shadow-2xl animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        />
      </div>
    </div>
  );
};
