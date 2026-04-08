import React from 'react';
import { cn } from '../lib/utils';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface MediaRendererProps {
  src: string;
  alt?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  key?: React.Key;
}

export function isVideoUrl(url: string) {
  if (!url) return false;
  const urlWithoutQuery = url.split('?')[0].toLowerCase();
  return urlWithoutQuery.endsWith('.mp4') || 
         urlWithoutQuery.endsWith('.mov') || 
         urlWithoutQuery.endsWith('.webm') || 
         urlWithoutQuery.endsWith('.ogg');
}

export default function MediaRenderer({ 
  src, 
  alt = 'Media', 
  className,
  autoPlay = true,
  muted = true,
  loop = true
}: MediaRendererProps) {
  if (!src) return null;

  const isVideo = isVideoUrl(src);

  if (isVideo) {
    return (
      <video
        src={src}
        className={cn("object-cover", className)}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
      />
    );
  }

  return (
    <LazyLoadImage
      src={src}
      alt={alt}
      effect="blur"
      className={cn("object-cover", className)}
      wrapperClassName="w-full h-full"
      referrerPolicy="no-referrer"
    />
  );
}
