import React from 'react';

interface LinkPreviewData {
  url: string;
  title: string;
  description: string;
  imageUrl: string;
  siteName: string;
}

interface LinkPreviewCardProps {
  preview: LinkPreviewData;
}

export const LinkPreviewCard: React.FC<LinkPreviewCardProps> = ({ preview }) => {
  if (!preview.title && !preview.imageUrl) return null;

  return (
    <a 
      href={preview.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="mt-2 block max-w-sm rounded-xl overflow-hidden border border-white/10 bg-[#1f2233] hover:border-brand-500/50 hover:bg-[#25283b] transition-all group animate-scale-in"
    >
      {preview.imageUrl && (
        <div className="w-full h-40 bg-black/40 overflow-hidden">
          <img 
            src={preview.imageUrl} 
            alt={preview.title || 'Link Preview'} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-3">
        {preview.siteName && (
          <div className="text-[10px] uppercase tracking-wider text-[#a78bfa] font-semibold mb-1">
            {preview.siteName}
          </div>
        )}
        <h4 className="text-sm font-semibold text-white mb-1 line-clamp-1 group-hover:text-[#a78bfa] transition-colors">
          {preview.title || preview.url}
        </h4>
        {preview.description && (
          <p className="text-xs text-gray-400 line-clamp-2">
            {preview.description}
          </p>
        )}
      </div>
    </a>
  );
};
