import { redirect } from 'next/navigation';
import Brand from '@/components/Brand';
import Calculadoras from '@/components/Calculadoras';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Área paga: o servidor só entrega o conteúdo para subscription_status === 'active'
export default async function AppPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/app');

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.subscription_status !== 'active') redirect('/assinar');

  return (
    <>
      <header className="nav">
        <div className="wrap">
          <Brand />
          <div className="links">
            <span className="small">{user.email}</span>
            <form action="/auth/signout" method="post"><button className="chip">Sair</button></form>
          </div>
        </div>
      </header>
      <main className="wrap section">
        <span className="kicker">Sua área</span>
        <h1 className="h2">Calculadoras inteligentes</h1>
        <Calculadoras />
      </main>
    </>
  );
}
