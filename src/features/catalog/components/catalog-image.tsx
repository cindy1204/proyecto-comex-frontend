'use client';

import { useState } from 'react';
import { getApiHost } from '../../common/config';
import { resolveMediaUrl } from '../../common/domain/media-url';
import { cn } from '../../common/utils/cn';

interface CatalogImageProps {
  src: string | null;
  alt: string;
  code: string;
  className?: string;
}

/**
 * Imagen del numeral o ilustración generada con su código si no hay imagen o falla la carga.
 * Usa `<img>` porque el host del bucket de imágenes lo define el backend, no el frontend.
 */
export function CatalogImage({ src: rawSrc, alt, code, className }: Readonly<CatalogImageProps>) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = rawSrc ? resolveMediaUrl(rawSrc, getApiHost()) : null;

  if (!src || failedSrc === src) {
    return (
      <svg
        aria-label={alt}
        className={cn('bg-slate-950', className)}
        role="img"
        viewBox="0 0 640 360"
        preserveAspectRatio="xMidYMid slice"
      >
        <rect width="640" height="360" fill="#0f172a" />
        <circle cx="570" cy="30" r="160" fill="#164e63" opacity="0.5" />
        <circle cx="55" cy="335" r="140" fill="#0f766e" opacity="0.3" />
        <rect
          x="68"
          y="58"
          width="504"
          height="244"
          rx="28"
          fill="#1e293b"
          stroke="#14b8a6"
          strokeWidth="2"
        />
        <path d="M265 238h110" stroke="#2dd4bf" strokeWidth="6" strokeLinecap="round" />
        <text
          x="320"
          y="205"
          textAnchor="middle"
          fill="#f8fafc"
          fontFamily="system-ui, sans-serif"
          fontSize="100"
          fontWeight="700"
          textLength="350"
          lengthAdjust="spacingAndGlyphs"
        >
          {code}
        </text>
      </svg>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- el host de las imágenes lo define el backend
    <img
      alt={alt}
      className={cn('object-cover', className)}
      loading="lazy"
      onError={() => setFailedSrc(src)}
      src={src}
    />
  );
}
