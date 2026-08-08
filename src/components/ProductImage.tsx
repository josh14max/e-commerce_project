import { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
}

export default function ProductImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  eager = false,
}: ProductImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <div className={`relative overflow-hidden bg-nge-bg ${className}`}>
      {status === 'loading' && <div className="absolute inset-0 animate-pulse bg-nge-bg" />}
      {status === 'error' ? (
        <div className="absolute inset-0 grid place-items-center bg-nge-bg">
          <div className="text-center px-4">
            <span className="font-display text-3xl font-light tracking-[0.2em] text-nge-black uppercase">NG</span>
            <p className="mt-1 text-[9px] uppercase tracking-[0.4em] text-nge-muted">Hair</p>
          </div>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={`h-full w-full object-cover transition-opacity duration-500 ${
            status === 'loaded' ? 'opacity-100' : 'opacity-0'
          } ${imgClassName}`}
        />
      )}
    </div>
  );
}
