import { createClient } from '@supabase/supabase-js';

// Usa a SERVICE_ROLE: ignora RLS. Só importe em código de servidor.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
