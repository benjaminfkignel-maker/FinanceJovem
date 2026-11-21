# FinanceJovem · Next.js + Supabase + Asaas

## Variáveis na Vercel
Você já tem: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, ASAAS_API_KEY.
Adicione: ASAAS_ENV (sandbox ou production), ASAAS_WEBHOOK_TOKEN (um texto longo inventado) e NEXT_PUBLIC_SITE_URL (https://seudominio.com.br). Depois faça Redeploy.

## Supabase
- Authentication › URL Configuration › Site URL = seu domínio; em Redirect URLs adicione `https://seudominio.com.br/auth/callback`.
- A tabela profiles precisa de RLS com leitura do próprio perfil:
```sql
alter table public.profiles enable row level security;
create policy "le o proprio perfil" on public.profiles for select using (auth.uid() = id);
```

## Asaas › Integrações › Webhooks
- URL: https://seudominio.com.br/api/webhook
- Token de autenticação: o mesmo de ASAAS_WEBHOOK_TOKEN
- Eventos: PAYMENT_CONFIRMED, PAYMENT_RECEIVED, PAYMENT_OVERDUE, PAYMENT_REFUNDED, SUBSCRIPTION_DELETED

## Rotas
- /            landing pública
- /login       login e cadastro
- /assinar     escolha de plano → POST /api/checkout → fatura do Asaas
- /app         área paga (só subscription_status = 'active')
- /api/webhook confirmação do Asaas
