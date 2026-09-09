import React, { useState, useEffect } from 'react';
import { fileService } from '../../services/fileService';
import { cryptoService } from '../../services/cryptoService';

interface E2EEAttachmentProps {
  attachmentId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  messageType: string;
  sharedSecret: CryptoKey;
}

export const E2EEAttachment: React.FC<E2EEAttachmentProps> = ({
  attachmentId,
  fileName,
  fileSize,
  fileType,
  messageType,
  sharedSecret
}) => {
  const [decryptedUrl, setDecryptedUrl] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    const fetchAndDecrypt = async () => {
      try {
        setIsDecrypting(true);
        setError(null);
        
        // Fetch the encrypted blob from the server
        const response = await fetch(fileService.getFileUrl(attachmentId));
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`);
        }
        const encryptedBlob = await response.blob();

        // Decrypt the blob locally
        const decryptedBlob = await cryptoService.decryptFile(encryptedBlob, sharedSecret, fileType);

        // Create a temporary object URL
        objectUrl = URL.createObjectURL(decryptedBlob);
        setDecryptedUrl(objectUrl);
      } catch (err: any) {
        console.error('Failed to decrypt attachment:', err);
        setError('Failed to decrypt attachment');
      } finally {
        setIsDecrypting(false);
      }
    };

    fetchAndDecrypt();

    return () => {
      // Cleanup the object URL when the component unmounts to prevent memory leaks
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [attachmentId, sharedSecret, fileType]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  if (isDecrypting) {
    return (
      <div className="mt-2 flex items-center gap-2 text-gray-400 text-sm italic">
        <svg className="animate-spin h-4 w-4 text-[#8b5cf6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Decrypting secure attachment...
      </div>
    );
  }

  if (error || !decryptedUrl) {
    return (
      <div className="mt-2 flex items-center gap-2 text-red-400 text-sm">
        <span title="End-to-End Encrypted">🔒</span>
        <span>{error || 'Could not decrypt attachment.'}</span>
      </div>
    );
  }

  // Render Image
  if (messageType === 'IMAGE' || fileType.startsWith('image/')) {
    return (
      <div className="mt-2 relative group max-w-sm">
        <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1 z-10" title="End-to-End Encrypted">
          🔒 E2EE
        </span>
        <img 
          src={decryptedUrl} 
          alt={fileName || 'Encrypted Image'} 
          className="rounded-lg max-h-64 object-contain bg-black/20"
        />
      </div>
    );
  }

  // Render File Download
  return (
    <div className="mt-2 flex items-center gap-3 bg-[#1a1b26] p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors w-fit">
      <div className="h-10 w-10 bg-[#8b5cf6]/10 text-[#8b5cf6] rounded flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div className="flex flex-col">
        <a 
          href={decryptedUrl} 
          download={fileName}
          className="text-[#a78bfa] hover:text-[#c4b5fd] text-sm font-medium flex items-center gap-1"
        >
          <span title="End-to-End Encrypted">🔒</span> {fileName || 'encrypted-file'}
        </a>
        <span className="text-xs text-gray-500">{formatFileSize(fileSize)}</span>
      </div>
    </div>
  );
};
