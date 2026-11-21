import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Link de confirmação de e-mail do Supabase cai aqui
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next')?.startsWith('/') ? searchParams.get('next') : '/app';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(origin + next);
  }
  return NextResponse.redirect(origin + '/login?erro=' + encodeURIComponent('Link inválido ou expirado. Entre novamente.'));
}
