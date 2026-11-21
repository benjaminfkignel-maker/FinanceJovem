import Link from 'next/link';
import Brand from '@/components/Brand';
import { createClient } from '@/lib/supabase/server';

const TOOLS = [
  ['Vale a pena comprar?', 'Analisa o impacto de uma compra e o tempo para juntar o valor.'],
  ['Cofrinho', 'Calcula quanto guardar e em quanto tempo.'],
  ['Mesada', 'Organiza a mesada entre gastos e economia.'],
  ['Salário', 'Simula quanto sobra no fim do mês.'],
  ['Comparador', 'Compara duas compras lado a lado.'],
  ['Metas', 'Acompanha objetivos e conquistas.'],
];

const PLANS = [
  { id: 'essencial', name: 'Essencial', price: 'R$ 9,90', desc: 'As calculadoras do dia a dia.', feats: ['Cofrinho, mesada e salário', 'Vale a pena comprar?', 'Comparador de compras'] },
  { id: 'plus', name: 'Plus', price: 'R$ 19,90', desc: 'Para acompanhar metas de perto.', feats: ['Tudo do Essencial', 'Metas ilimitadas', 'Relatórios mensais'], hi: true },
  { id: 'academy', name: 'Academy', price: 'R$ 29,90', desc: 'Aprender a fundo.', feats: ['Tudo do Plus', 'Cursos de educação financeira', 'Desafios semanais'] },
];

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <header className="nav">
        <div className="wrap">
          <Brand />
          <nav className="links">
            <a href="#ferramentas" className="muted">Ferramentas</a>
            <a href="#planos" className="muted">Planos</a>
            {user ? (
              <Link href="/app" className="btn">Minha área</Link>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost">Entrar</Link>
                <a href="#planos" className="btn">Assinar</a>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="wrap">
        <section className="section" style={{ paddingTop: 72 }}>
          <span className="kicker">Planeje. Decida. Conquiste.</span>
          <h1 className="h1" style={{ maxWidth: 820 }}>
            Sua aliada na jornada para fazer escolhas financeiras <span style={{ color: '#20DF78' }}>mais inteligentes!</span>
          </h1>
          <p className="lead">Calculadoras simples para organizar a mesada, planejar metas e descobrir se uma compra cabe no seu bolso antes de gastar.</p>
          <div className="links">
            <a href="#planos" className="btn">Assine o FinanceJovem</a>
            <Link href="/login" className="btn btn-ghost">Já tenho conta</Link>
          </div>
        </section>

        <section id="ferramentas" className="section">
          <span className="kicker">Ferramentas</span>
          <h2 className="h2">Respostas para as perguntas de dinheiro do dia a dia</h2>
          <div className="grid">
            {TOOLS.map(([t, d]) => (
              <div key={t} className="card">
                <strong style={{ fontSize: 18 }}>{t}</strong>
                <span className="muted" style={{ fontSize: 14, lineHeight: 1.5 }}>{d}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="planos" className="section">
          <span className="kicker">Planos</span>
          <h2 className="h2">Escolha o plano que combina com você</h2>
          <div className="grid">
            {PLANS.map((p) => (
              <div key={p.id} className={'card' + (p.hi ? ' card-hi' : '')}>
                <div className="row"><strong style={{ fontSize: 22 }}>{p.name}</strong>{p.hi && <span className="small" style={{ fontWeight: 700 }}>Recomendado</span>}</div>
                <span className="muted">{p.desc}</span>
                <div><span className="price">{p.price}</span><span className="muted"> /mês</span></div>
                <ul className="dotlist">{p.feats.map((f) => <li key={f}>{f}</li>)}</ul>
                <Link href={`/assinar?plano=${p.id}`} className={'btn btn-block' + (p.hi ? '' : '')} style={p.hi ? { background: '#07130F', color: '#F3F7F5' } : undefined}>
                  Assinar {p.name}
                </Link>
              </div>
            ))}
          </div>
          <span className="small">Pix ou cartão de crédito · Plano anual com 2 meses grátis · Cancele quando quiser</span>
        </section>
      </main>

      <footer className="wrap" style={{ padding: '40px 24px', borderTop: '1px solid rgba(243,247,245,.08)' }}>
        <div className="row small">
          <span>© {new Date().getFullYear()} FinanceJovem</span>
          <span>Conteúdo educativo. Não é recomendação de investimento.</span>
        </div>
      </footer>
    </>
  );
}
