import { cn } from '../utils/cn';

export function Spinner({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      aria-hidden="true"
      className={cn('size-5 animate-spin', className)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        d="M4 12a8 8 0 0 1 8-8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="4"
      />
    </svg>
  );
}
