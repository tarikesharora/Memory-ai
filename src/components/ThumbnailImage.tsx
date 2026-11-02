import React, { useState } from 'react';
import { ImageOff, FileText, Film, Image as ImageIcon } from 'lucide-react';

interface ThumbnailImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  fileType?: string;
  fileExtension?: string;
}

export const ThumbnailImage: React.FC<ThumbnailImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  containerClassName = 'w-full h-full',
  fileType = 'image',
  fileExtension = 'jpg'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-neutral-950 flex items-center justify-center ${containerClassName}`}>
      {/* Loading Skeleton */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-neutral-800/80 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-neutral-700 border-t-amber-400 rounded-full animate-spin" />
        </div>
      )}

      {/* Actual Local Image */}
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className={`${className} transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        />
      ) : (
        /* Error Fallback when file genuinely cannot be loaded */
        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-neutral-950 border border-neutral-800/80 text-neutral-500 space-y-1.5 select-none">
          {fileType === 'document' ? (
            <FileText className="w-6 h-6 text-neutral-500" />
          ) : fileType === 'video' ? (
            <Film className="w-6 h-6 text-neutral-500" />
          ) : (
            <ImageOff className="w-6 h-6 text-neutral-500" />
          )}
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
            {fileExtension.toUpperCase()} · Preview Unavailable
          </span>
        </div>
      )}
    </div>
  );
};
