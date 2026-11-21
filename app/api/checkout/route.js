import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PLANS, asaas } from '@/lib/asaas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Recebe o formulário de /assinar, cria cliente + assinatura no Asaas
// e redireciona o usuário direto para a fatura (invoiceUrl).
export async function POST(request) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const back = (msg) => NextResponse.redirect(`${site}/assinar?erro=${encodeURIComponent(msg)}`, 303);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${site}/login?next=/assinar`, 303);

  const form = await request.formData();
  const plan = PLANS[form.get('plan')] ? form.get('plan') : null;
  const cycle = form.get('cycle') === 'YEARLY' ? 'YEARLY' : 'MONTHLY';
  const billingType = form.get('billingType') === 'CREDIT_CARD' ? 'CREDIT_CARD' : 'PIX';
  const name = String(form.get('name') || '').trim();
  const cpfCnpj = String(form.get('cpfCnpj') || '').replace(/\D/g, '');

  if (!plan) return back('Escolha um plano.');
  if (name.length < 3) return back('Informe o nome completo.');
  if (cpfCnpj.length !== 11 && cpfCnpj.length !== 14) return back('Informe um CPF válido.');

  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (profile?.subscription_status === 'active') return NextResponse.redirect(`${site}/app`, 303);

  let invoiceUrl;
  try {
    // 1. Cliente (reaproveita se já existir)
    let customerId = profile?.asaas_customer_id;
    if (!customerId) {
      const customer = await asaas('/customers', {
        method: 'POST',
        body: { name, email: user.email, cpfCnpj, externalReference: user.id },
      });
      customerId = customer.id;
      await admin.from('profiles').upsert({
        id: user.id,
        email: user.email,
        asaas_customer_id: customerId,
        updated_at: new Date().toISOString(),
      });
    }

    // 2. Cancela assinaturas antigas não pagas desse cliente (evita cobrança dupla)
    const old = await asaas(`/subscriptions?customer=${customerId}&status=ACTIVE`);
    for (const s of old.data || []) {
      await asaas(`/subscriptions/${s.id}`, { method: 'DELETE' }).catch(() => {});
    }

    // 3. Nova assinatura — primeira cobrança vence hoje (horário de Brasília)
    const p = PLANS[plan];
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
    const sub = await asaas('/subscriptions', {
      method: 'POST',
      body: {
        customer: customerId,
        billingType,
        value: p[cycle],
        nextDueDate: today,
        cycle,
        description: `FinanceJovem ${p.name} (${cycle === 'YEARLY' ? 'anual' : 'mensal'})`,
        externalReference: user.id,
        callback: { successUrl: `${site}/assinar?pago=1`, autoRedirect: true },
      },
    });

    // 4. Link da primeira fatura
    const payments = await asaas(`/subscriptions/${sub.id}/payments`);
    invoiceUrl = payments.data?.[0]?.invoiceUrl;
    if (!invoiceUrl) throw new Error('O Asaas não retornou o link de pagamento. Tente de novo.');
  } catch (err) {
    console.error('[checkout]', err);
    return back(err.message || 'Não foi possível iniciar o pagamento.');
  }

  return NextResponse.redirect(invoiceUrl, 303);
}
