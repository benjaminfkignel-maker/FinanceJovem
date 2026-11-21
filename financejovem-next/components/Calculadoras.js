'use client';

import { useEffect, useState } from 'react';

const num = (s) => { const x = parseFloat(String(s ?? '').replace(/\s/g, '').replace(',', '.')); return isFinite(x) ? x : 0; };
const brl = (v) => (isFinite(v) ? v : 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const meses = (m) => `${m} ${m === 1 ? 'mês' : 'meses'}`;
const pct = (x) => `${Math.round(Math.max(0, Math.min(1, x || 0)) * 100)}%`;
const dec = (x) => x.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
const quando = (m) => { const d = new Date(); d.setMonth(d.getMonth() + m); return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }); };

function useForm(init) {
  const [v, setV] = useState(init);
  return [v, (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }))];
}
function F({ label, value, onChange, text }) {
  return (
    <label className="field">{label}
      <input inputMode={text ? 'text' : 'decimal'} value={value} onChange={onChange} />
    </label>
  );
}
function Bar({ w }) {
  return <div className="bar"><div style={{ width: w }} /></div>;
}
function Layout({ title, inputs, result }) {
  return (
    <div className="grid-2">
      <div className="card"><strong style={{ fontSize: 20 }}>{title}</strong>{inputs}</div>
      <div className="result">{result}</div>
    </div>
  );
}

function ValeAPena() {
  const [v, set] = useForm({ nome: 'Tênis', preco: '600', tem: '0', renda: '200', gastos: '0', guardar: '200' });
  const P = num(v.preco), H = num(v.tem), I = num(v.renda), E = num(v.gastos), S = num(v.guardar);
  const falta = Math.max(0, P - H), sobra = I - E;
  let big = '—', sub = 'Informe o preço.', verdict = '';
  if (P > 0 && falta === 0) { big = 'Já dá'; sub = 'Você já tem o valor.'; verdict = P / Math.max(H, 1) <= 0.5 ? 'Cabe no bolso' : 'Pense bem'; }
  else if (P > 0 && S > 0) { const m = Math.ceil(falta / S); big = meses(m); sub = `guardando ${brl(S)} por mês, até ${quando(m)}.`; verdict = m <= 3 ? 'Planejável' : m <= 8 ? 'Exige paciência' : 'Pense bem'; }
  else if (P > 0) { sub = 'Defina quanto pretende guardar por mês.'; verdict = 'Sem plano'; }
  return (
    <Layout title="Vale a pena comprar?"
      inputs={<>
        <F label="Produto" value={v.nome} onChange={set('nome')} text />
        <F label="Preço (R$)" value={v.preco} onChange={set('preco')} />
        <F label="Dinheiro disponível (R$)" value={v.tem} onChange={set('tem')} />
        <F label="Renda ou mesada por mês (R$)" value={v.renda} onChange={set('renda')} />
        <F label="Gastos mensais (R$)" value={v.gastos} onChange={set('gastos')} />
        <F label="Quanto pretende guardar por mês (R$)" value={v.guardar} onChange={set('guardar')} />
      </>}
      result={<>
        <div className="row"><span className="result-label">{(v.nome || 'Produto') + ' · ' + brl(P)}</span>{verdict && <strong style={{ background: '#07130F', color: '#20DF78', padding: '4px 12px', borderRadius: 999, fontSize: 13 }}>{verdict}</strong>}</div>
        <span className="result-big">{big}</span>
        <span>{sub}</span>
        <Bar w={P > 0 ? pct(H / P) : '0%'} />
        <span className="small" style={{ color: '#10271D' }}>Falta {brl(falta)} · sobra {brl(sobra)}/mês{I > 0 ? ` · preço = ${dec(P / I)}x a renda` : ''}</span>
        {S > sobra && I > 0 && <span style={{ fontWeight: 600 }}>Atenção: você quer guardar mais do que sobra por mês.</span>}
      </>}
    />
  );
}

function Cofrinho() {
  const [v, set] = useForm({ meta: '1500', tem: '300', mes: '150' });
  const G = num(v.meta), H = num(v.tem), M = num(v.mes), falta = Math.max(0, G - H);
  const m = falta === 0 ? 0 : M > 0 ? Math.ceil(falta / M) : null;
  return (
    <Layout title="Cofrinho"
      inputs={<>
        <F label="Valor da meta (R$)" value={v.meta} onChange={set('meta')} />
        <F label="Quanto já possui (R$)" value={v.tem} onChange={set('tem')} />
        <F label="Quanto vai guardar por mês (R$)" value={v.mes} onChange={set('mes')} />
      </>}
      result={<>
        <span className="result-label">Prazo estimado</span>
        <span className="result-big">{G <= 0 ? '—' : m === 0 ? 'Meta batida' : m == null ? '—' : meses(m)}</span>
        <span>{G <= 0 ? 'Informe a meta.' : m === 0 ? `Você já tem ${brl(H)}.` : m == null ? 'Defina o valor mensal.' : `Falta ${brl(falta)}. Previsão: ${quando(m)}.`}</span>
        <Bar w={G > 0 ? pct(H / G) : '0%'} />
      </>}
    />
  );
}

function Mesada() {
  const [v, set] = useForm({ valor: '200', gastos: '90', guardar: '60' });
  const V = num(v.valor), G = num(v.gastos), S = num(v.guardar), livre = V - G - S;
  return (
    <Layout title="Mesada"
      inputs={<>
        <F label="Valor recebido por mês (R$)" value={v.valor} onChange={set('valor')} />
        <F label="Gastos mensais (R$)" value={v.gastos} onChange={set('gastos')} />
        <F label="Quanto deseja economizar (R$)" value={v.guardar} onChange={set('guardar')} />
      </>}
      result={<>
        <span className="result-label">Saldo livre para gastar</span>
        <span className="result-big">{brl(livre)}</span>
        <span>{V <= 0 ? 'Informe a mesada.' : livre < 0 ? `Faltam ${brl(-livre)}: reduza gastos ou a economia.` : `Cerca de ${brl(livre / 4.3)} por semana.`}</span>
        <span className="small" style={{ color: '#10271D' }}>Gastos {pct(G / V)} · Economia {pct(S / V)} · Livre {pct(livre / V)}</span>
      </>}
    />
  );
}

function Salario() {
  const [v, set] = useForm({ salario: '1800', despesas: '1100', economia: '400' });
  const V = num(v.salario), E = num(v.despesas), S = num(v.economia), livre = V - E - S;
  return (
    <Layout title="Salário"
      inputs={<>
        <F label="Salário recebido (R$)" value={v.salario} onChange={set('salario')} />
        <F label="Despesas mensais (R$)" value={v.despesas} onChange={set('despesas')} />
        <F label="Economia mensal (R$)" value={v.economia} onChange={set('economia')} />
      </>}
      result={<>
        <span className="result-label">Sobra livre por mês</span>
        <span className="result-big">{brl(livre)}</span>
        <span>{V > 0 ? `Você guarda ${pct(S / V)} do salário.` : 'Informe o salário.'}</span>
        <span style={{ fontWeight: 600 }}>Acumulado: 6 meses {brl(S * 6)} · 1 ano {brl(S * 12)} · 2 anos {brl(S * 24)}</span>
        <span className="small" style={{ color: '#10271D' }}>Sem considerar rendimentos.</span>
      </>}
    />
  );
}

function Comparador() {
  const [v, set] = useForm({ a: 'Fone A', pa: '250', b: 'Fone B', pb: '420', renda: '200' });
  const A = num(v.pa), B = num(v.pb), R = num(v.renda), diff = Math.abs(A - B), mx = Math.max(A, B, 1);
  const barato = A <= B ? v.a : v.b, caro = A <= B ? v.b : v.a;
  return (
    <Layout title="Comparador de compras"
      inputs={<>
        <F label="Produto A" value={v.a} onChange={set('a')} text />
        <F label="Preço A (R$)" value={v.pa} onChange={set('pa')} />
        <F label="Produto B" value={v.b} onChange={set('b')} text />
        <F label="Preço B (R$)" value={v.pb} onChange={set('pb')} />
        <F label="Sua renda ou mesada (R$)" value={v.renda} onChange={set('renda')} />
      </>}
      result={<>
        <span className="result-label">Diferença de preço</span>
        <span className="result-big">{brl(diff)}</span>
        <span>{diff === 0 ? 'Os dois custam o mesmo.' : `${caro} custa ${brl(diff)} a mais que ${barato}.${R > 0 ? ` Equivale a ${dec(diff / R)} mês(es) de renda.` : ''}`}</span>
        <span style={{ fontWeight: 600 }}>{v.a} · {brl(A)}</span><Bar w={pct(A / mx)} />
        <span style={{ fontWeight: 600 }}>{v.b} · {brl(B)}</span><Bar w={pct(B / mx)} />
      </>}
    />
  );
}

function Metas() {
  const [goals, setGoals] = useState([]);
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  useEffect(() => {
    try { setGoals(JSON.parse(localStorage.getItem('fj-goals')) || []); } catch {}
  }, []);
  const save = (g) => { setGoals(g); localStorage.setItem('fj-goals', JSON.stringify(g)); };
  const add = () => {
    const t = num(valor);
    if (!nome.trim() || t <= 0) return;
    save([{ id: Date.now(), name: nome.trim(), target: t, saved: 0 }, ...goals]);
    setNome(''); setValor('');
  };
  const bump = (id, d) => save(goals.map((g) => (g.id === id ? { ...g, saved: Math.max(0, g.saved + d) } : g)));
  return (
    <div className="grid-2">
      <div className="card">
        <div className="row"><strong style={{ fontSize: 20 }}>Nova meta</strong><span className="small">{goals.filter((g) => g.saved >= g.target).length} conquista(s)</span></div>
        <label className="field">Nome da meta<input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Fone novo" /></label>
        <label className="field">Valor (R$)<input inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="Ex.: 300" /></label>
        <button className="btn btn-block" onClick={add}>Criar meta</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {goals.length === 0 && <div className="card muted" style={{ borderStyle: 'dashed', textAlign: 'center' }}>Nenhuma meta ainda.</div>}
        {goals.map((g) => {
          const p = g.saved / g.target;
          return (
            <div key={g.id} className="goal">
              <div className="row"><strong>{g.name}</strong><strong style={{ color: '#20DF78' }}>{p >= 1 ? 'Conquistada!' : pct(p)}</strong></div>
              <span className="small">{brl(g.saved)} de {brl(g.target)}</span>
              <Bar w={pct(p)} />
              <div className="links">
                <button className="chip" onClick={() => bump(g.id, 10)}>+ R$ 10</button>
                <button className="chip" onClick={() => bump(g.id, 50)}>+ R$ 50</button>
                <button className="chip" onClick={() => bump(g.id, -10)}>− R$ 10</button>
                <button className="chip" onClick={() => save(goals.filter((x) => x.id !== g.id))}>Excluir</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const TABS = [
  ['vale', 'Vale a pena?', ValeAPena],
  ['cofrinho', 'Cofrinho', Cofrinho],
  ['mesada', 'Mesada', Mesada],
  ['salario', 'Salário', Salario],
  ['comparador', 'Comparador', Comparador],
  ['metas', 'Metas', Metas],
];

export default function Calculadoras() {
  const [tab, setTab] = useState('vale');
  const Active = TABS.find((t) => t[0] === tab)[2];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="tabs" role="tablist">
        {TABS.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      <Active />
    </div>
  );
}
