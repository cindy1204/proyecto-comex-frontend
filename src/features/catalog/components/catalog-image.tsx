'use client';

import { ImageOff } from 'lucide-react';
import { useState } from 'react';
import { getApiHost } from '../../common/config';
import { resolveMediaUrl } from '../../common/domain/media-url';
import { cn } from '../../common/utils/cn';
import { useTranslation } from '../../i18n/hooks/use-translation';

interface CatalogImageProps {
  src: string | null;
  /** Texto alternativo descriptivo; el fallback lo reutiliza como etiqueta. */
  alt: string;
  className?: string;
}

/**
 * Imagen del numeral con texto alternativo y marcador si no hay imagen o falla la carga.
 * Usa `<img>` porque el host del bucket de imágenes lo define el backend, no el frontend.
 */
export function CatalogImage({ src: rawSrc, alt, className }: Readonly<CatalogImageProps>) {
  const { t } = useTranslation();
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = rawSrc ? resolveMediaUrl(rawSrc, getApiHost()) : null;

  if (!src || failedSrc === src) {
    return (
      <div
        aria-label={t('catalog.imageUnavailable', { alt })}
        className={cn(
          'flex items-center justify-center bg-surface-muted text-muted-foreground',
          className,
        )}
        role="img"
      >
        <ImageOff aria-hidden="true" className="size-8" />
      </div>
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
