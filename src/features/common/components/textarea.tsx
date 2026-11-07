import type { TextareaHTMLAttributes } from 'react';
import { controlStyles } from './form-controls';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ invalid, className, rows = 4, ...props }: Readonly<TextareaProps>) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={controlStyles(invalid, className)}
      rows={rows}
      {...props}
    />
  );
}
