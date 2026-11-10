'use client';

import { ImagePlus, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { Button } from './button';

const DEFAULT_ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];

interface FileInputProps {
  id: string;
  name: string;
  accept?: string[];
  maxSizeMb?: number;
  /** Imagen ya guardada (al editar), mostrada hasta que se elija otra. */
  currentImageUrl?: string | null;
  'aria-describedby'?: string;
  invalid?: boolean;
  required?: boolean;
  onFileChange?: (file: File | null) => void;
}

/** Selector de imagen con validación de tipo/tamaño y vista previa. El `<input>` real conserva `name`. */
export function FileInput({
  id,
  name,
  accept = DEFAULT_ACCEPT,
  maxSizeMb = 5,
  currentImageUrl = null,
  invalid,
  required,
  onFileChange,
  'aria-describedby': describedBy,
}: Readonly<FileInputProps>) {
  const { t } = useTranslation();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [localError, setLocalError] = useState<'format' | 'size' | null>(null);

  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    [],
  );

  function replacePreview(url: string | null) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = url;
    setPreview(url);
  }

  function clear() {
    if (inputRef.current) inputRef.current.value = '';
    replacePreview(null);
    setFileName(null);
    onFileChange?.(null);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setLocalError(null);
    if (!file) {
      clear();
      return;
    }
    if (!accept.includes(file.type)) {
      clear();
      setLocalError('format');
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      clear();
      setLocalError('size');
      return;
    }
    replacePreview(URL.createObjectURL(file));
    setFileName(file.name);
    onFileChange?.(file);
  }

  const shownImage = preview ?? currentImageUrl;
  const inputDescribedBy = [localError ? errorId : null, describedBy].filter(Boolean).join(' ');

  return (
    <div className="flex flex-col gap-3">
      {/* El `<input>` es solo el motor del selector: el Button visible es el único control con foco. */}
      <input
        accept={accept.join(',')}
        aria-describedby={inputDescribedBy || undefined}
        aria-invalid={invalid || Boolean(localError) || undefined}
        className="sr-only"
        id={id}
        name={name}
        onChange={handleChange}
        ref={inputRef}
        required={required}
        tabIndex={-1}
        type="file"
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button
          aria-describedby={inputDescribedBy || undefined}
          onClick={() => inputRef.current?.click()}
          size="sm"
          variant="outline"
        >
          <ImagePlus aria-hidden="true" className="size-4" />
          {shownImage ? t('common.fileInput.change') : t('common.fileInput.select')}
        </Button>
        {fileName && (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            {fileName}
            <button
              aria-label={t('common.fileInput.remove')}
              className="grid min-h-11 min-w-11 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
              onClick={clear}
              type="button"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </span>
        )}
      </div>
      {localError && (
        <p className="text-sm font-medium text-danger" id={errorId} role="alert">
          {localError === 'format'
            ? t('common.fileInput.errorFormat')
            : t('common.fileInput.errorSize', { max: maxSizeMb })}
        </p>
      )}
      {shownImage && (
        // eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:) o URL externa del bucket
        <img
          alt={preview ? t('common.fileInput.previewAlt') : t('common.fileInput.currentAlt')}
          className="max-h-48 w-fit max-w-full rounded-lg border border-border object-contain"
          src={shownImage}
        />
      )}
    </div>
  );
}
