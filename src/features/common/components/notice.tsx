import type { NoticeMessage } from '../hooks/use-notice';
import { Alert } from './alert';

/** Región viva persistente: los mensajes de éxito/error se anuncian aunque aparezcan después. */
export function Notice({ notice }: Readonly<{ notice: NoticeMessage | null }>) {
  return (
    <div aria-atomic="true" aria-live="polite">
      {notice && <Alert tone={notice.tone}>{notice.message}</Alert>}
    </div>
  );
}
