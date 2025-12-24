'use client';

import { useEffect, useState } from 'react';

/**
 * Hook que garantiza que un componente solo renderiza su contenido
 * después de que React ha completado la hidratación en el cliente.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
