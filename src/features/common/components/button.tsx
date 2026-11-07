import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../utils/cn';
import { Spinner } from './spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground not-disabled:hover:bg-primary-hover',
  secondary: 'bg-primary-soft text-primary-soft-foreground not-disabled:hover:bg-surface-muted',
  // Borde de control (--input-border, >= 3:1, WCAG 1.4.11). Inactivo: borde discontinuo y sin
  // relleno, de modo que la diferencia no dependa solo del color ni de la opacidad.
  outline:
    'border border-input-border bg-surface text-foreground not-disabled:hover:bg-surface-muted disabled:border-dashed disabled:bg-transparent aria-disabled:border-dashed aria-disabled:bg-transparent',
  ghost: 'text-foreground not-disabled:hover:bg-surface-muted',
  danger: 'bg-danger text-danger-foreground not-disabled:hover:opacity-90',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-6 text-base',
};

interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

/** Clases del botón, reutilizables en enlaces (`<Link className={buttonStyles({...})}>`). */
export function buttonStyles({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
}: ButtonStyleOptions = {}): string {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150',
    'disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:pointer-events-none aria-disabled:opacity-60',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleOptions {
  isLoading?: boolean;
}

export function Button({
  variant,
  size,
  fullWidth,
  className,
  isLoading = false,
  disabled,
  children,
  type = 'button',
  ...props
}: Readonly<ButtonProps>) {
  return (
    <button
      aria-busy={isLoading || undefined}
      className={buttonStyles({ variant, size, fullWidth, className })}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading && <Spinner className="size-4" />}
      {children}
    </button>
  );
}
