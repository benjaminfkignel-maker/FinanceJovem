'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Brand from '@/components/Brand';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next')?.startsWith('/') ? params.get('next') : '/app';
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(params.get('erro') ? { type: 'err', text: params.get('erro') } : null);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const supabase = createClient();
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace(next);
        router.refresh();
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/assinar` },
      });
      if (error) throw error;
      if (data.session) {
        router.replace('/assinar');
        router.refresh();
        return;
      }
      setMode('login');
      setMsg({ type: 'ok', text: `Conta criada! Confirme pelo link enviado para ${email} e depois entre.` });
    } catch (err) {
      let t = err.message || String(err);
      if (/Invalid login/i.test(t)) t = 'E-mail ou senha incorretos.';
      else if (/already registered/i.test(t)) t = 'Este e-mail já tem conta. Use “Entrar”.';
      else if (/Email not confirmed/i.test(t)) t = 'Confirme seu e-mail antes de entrar.';
      else if (/at least 6/i.test(t)) t = 'A senha precisa ter pelo menos 6 caracteres.';
      setMsg({ type: 'err', text: t });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth">
      <div className="card">
        <Brand />
        <div className="tabs" role="tablist" style={{ background: '#07130F' }}>
          <button type="button" role="tab" aria-selected={mode === 'login'} onClick={() => setMode('login')} style={{ flex: 1 }}>Entrar</button>
          <button type="button" role="tab" aria-selected={mode === 'signup'} onClick={() => setMode('signup')} style={{ flex: 1 }}>Criar conta</button>
        </div>
        <h1 className="h2" style={{ fontSize: 28 }}>{mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}</h1>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label className="field">E-mail
            <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="field">Senha
            <input type="password" minLength={6} required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {msg && <div className={'msg ' + (msg.type === 'ok' ? 'msg-ok' : 'msg-err')}>{msg.text}</div>}
          <button className="btn btn-block" disabled={loading}>
            {loading ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>
        <span className="small">Menores de 18 anos devem usar com um responsável.</span>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
