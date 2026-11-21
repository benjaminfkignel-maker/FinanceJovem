import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { asaas } from '@/lib/asaas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ACTIVATE = ['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED'];
const DEACTIVATE = ['PAYMENT_OVERDUE', 'PAYMENT_REFUNDED', 'SUBSCRIPTION_DELETED'];

export async function POST(request) {
  // O Asaas envia o token configurado no painel neste header
  const token = request.headers.get('asaas-access-token');
  if (!process.env.ASAAS_WEBHOOK_TOKEN || token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const event = body?.event;
  if (!ACTIVATE.includes(event) && !DEACTIVATE.includes(event)) {
    return NextResponse.json({ ignored: event ?? null }); // 200: só confirma recebimento
  }

  const obj = body.payment || body.subscription || {};
  const customerId = obj.customer;
  const userId = obj.externalReference;

  try {
    // Ao cancelar uma assinatura, só bloqueia se o cliente não tiver outra ativa
    if (event === 'SUBSCRIPTION_DELETED' && customerId) {
      const list = await asaas(`/subscriptions?customer=${customerId}&status=ACTIVE`);
      if ((list.data || []).length > 0) return NextResponse.json({ ignored: 'há outra assinatura ativa' });
    }

    const status = ACTIVATE.includes(event) ? 'active' : 'inactive';
    const admin = createAdminClient();
    let query = admin.from('profiles').update({ subscription_status: status, updated_at: new Date().toISOString() });

    if (customerId) query = query.eq('asaas_customer_id', customerId);
    else if (userId) query = query.eq('id', userId);
    else return NextResponse.json({ ignored: 'sem cliente' });

    const { data, error } = await query.select('id');
    if (error) throw error;

    // Se não achou pelo cliente, tenta pelo id do usuário (externalReference)
    if ((!data || data.length === 0) && userId) {
      const r = await admin.from('profiles')
        .update({ subscription_status: status, asaas_customer_id: customerId || null, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (r.error) throw r.error;
    }

    console.log('[webhook]', event, customerId || userId, '→', status);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[webhook]', err);
    return NextResponse.json({ error: 'erro ao atualizar' }, { status: 500 }); // Asaas tenta de novo
  }
}
