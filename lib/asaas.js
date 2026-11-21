export const PLANS = {
  essencial: { name: 'Essencial', MONTHLY: 9.9, YEARLY: 99 },
  plus: { name: 'Plus', MONTHLY: 19.9, YEARLY: 199 },
  academy: { name: 'Academy', MONTHLY: 29.9, YEARLY: 299 },
};

const BASE =
  process.env.ASAAS_ENV === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://api-sandbox.asaas.com/v3';

export async function asaas(path, { method = 'GET', body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'FinanceJovem/1.0',
      access_token: process.env.ASAAS_API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.errors?.[0]?.description || `Erro no Asaas (${res.status})`);
  }
  return data;
}
