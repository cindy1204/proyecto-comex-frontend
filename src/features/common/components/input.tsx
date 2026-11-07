import type { InputHTMLAttributes } from 'react';
import { controlStyles } from './form-controls';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ invalid, className, ...props }: Readonly<InputProps>) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={controlStyles(invalid, className)}
      {...props}
    />
  );
}
