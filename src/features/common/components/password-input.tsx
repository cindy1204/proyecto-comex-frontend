import { Eye, EyeOff } from 'lucide-react';
import { useState, type InputHTMLAttributes } from 'react';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { cn } from '../utils/cn';
import { Input } from './input';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  invalid?: boolean;
}

/** Campo de contraseña con botón para mostrar u ocultar lo escrito (el valor no cambia). */
export function PasswordInput({ className, ...props }: Readonly<PasswordInputProps>) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const label = visible ? t('common.hidePassword') : t('common.showPassword');
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="relative">
      <Input {...props} className={cn('pr-11', className)} type={visible ? 'text' : 'password'} />
      <button
        aria-label={label}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={() => setVisible((current) => !current)}
        title={label}
        type="button"
      >
        <Icon aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
