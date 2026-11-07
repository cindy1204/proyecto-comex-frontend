import type { ReactNode } from 'react';

/**
 * Pie de acciones de un formulario dentro de `Modal`: queda fijo al borde inferior del área con
 * scroll para que enviar/cancelar sean alcanzables sin recorrer todo el formulario.
 */
export function ModalFooter({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="sticky -bottom-4 z-10 -mx-6 -mb-4 flex flex-wrap justify-end gap-2 border-t border-border bg-surface px-6 py-3">
      {children}
    </div>
  );
}
