import Link from 'next/link';
import { redirect } from 'next/navigation';
import Brand from '@/components/Brand';
import AutoRefresh from '@/components/AutoRefresh';
import { createClient } from '@/lib/supabase/server';
import { PLANS } from '@/lib/asaas';

const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default async function AssinarPage({ searchParams }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/assinar');

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .maybeSingle();
  const active = profile?.subscription_status === 'active';
  const plan = PLANS[sp?.plano] ? sp.plano : 'plus';
  const cycle = sp?.ciclo === 'YEARLY' ? 'YEARLY' : 'MONTHLY';

  return (
    <main className="auth">
      <div className="card" style={{ maxWidth: 500 }}>
        <div className="row">
          <Brand />
          <form action="/auth/signout" method="post"><button className="chip">Sair</button></form>
        </div>

        {active ? (
          <>
            <h1 className="h2" style={{ fontSize: 28 }}>Sua assinatura está ativa</h1>
            <p className="muted" style={{ margin: 0 }}>Todas as ferramentas estão liberadas.</p>
            <Link href="/app" className="btn btn-block">Ir para minha área</Link>
          </>
        ) : (
          <>
            {sp?.pago && (
              <>
                <AutoRefresh />
                <div className="msg msg-ok">Aguardando a confirmação do pagamento. No Pix costuma levar menos de 1 minuto — esta página atualiza sozinha.</div>
              </>
            )}
            {sp?.erro && <div className="msg msg-err">{sp.erro}</div>}

            <h1 className="h2" style={{ fontSize: 28 }}>Escolha seu plano</h1>
            <form action="/api/checkout" method="post" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="seg">
                {Object.entries(PLANS).map(([id, p]) => (
                  <label key={id}>
                    <input type="radio" name="plan" value={id} defaultChecked={id === plan} />
                    <span>{p.name}</span>
                  </label>
                ))}
              </div>
              <div className="seg">
                <label><input type="radio" name="cycle" value="MONTHLY" defaultChecked={cycle === 'MONTHLY'} /><span>Mensal</span></label>
                <label><input type="radio" name="cycle" value="YEARLY" defaultChecked={cycle === 'YEARLY'} /><span>Anual · 2 meses grátis</span></label>
              </div>
              <div className="seg">
                <label><input type="radio" name="billingType" value="PIX" defaultChecked /><span>Pix</span></label>
                <label><input type="radio" name="billingType" value="CREDIT_CARD" /><span>Cartão de crédito</span></label>
              </div>
              <ul className="dotlist small" style={{ fontWeight: 400 }}>
                {Object.values(PLANS).map((p) => (
                  <li key={p.name}>{p.name}: {brl(p.MONTHLY)}/mês ou {brl(p.YEARLY)}/ano</li>
                ))}
              </ul>
              <label className="field">Nome completo
                <input name="name" autoComplete="name" required minLength={3} />
              </label>
              <label className="field">CPF
                <input name="cpfCnpj" inputMode="numeric" placeholder="000.000.000-00" required pattern="[0-9.\-\s]{11,18}" />
              </label>
              <span className="small">Menor de 18 anos? Use o nome e o CPF do responsável.</span>
              <button className="btn btn-block">Ir para o pagamento</button>
              <span className="small" style={{ textAlign: 'center' }}>Pagamento processado pelo Asaas. Cancele quando quiser.</span>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
