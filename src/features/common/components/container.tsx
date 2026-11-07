import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /** `narrow` para formularios y páginas de lectura. */
  size?: 'default' | 'narrow';
}

export function Container({ children, className, size = 'default' }: Readonly<ContainerProps>) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6',
        size === 'narrow' ? 'max-w-2xl' : 'max-w-6xl',
        className,
      )}
    >
      {children}
    </div>
  );
}
