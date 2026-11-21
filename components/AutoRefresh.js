'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Recarrega os dados da página a cada 4s (até 2 min) enquanto espera o webhook
export default function AutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const t = setInterval(() => {
      router.refresh();
      if (++n >= 30) clearInterval(t);
    }, 4000);
    return () => clearInterval(t);
  }, [router]);
  return null;
}
