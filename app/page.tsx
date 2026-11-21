import Link from "next/link";

const services = [
  { icon: "🔧", name: "Reparos e manutenção", detail: "Pequenos consertos para sua casa", tag: "MAIS PROCURADO" },
  { icon: "⚡", name: "Eletricista", detail: "Instalações e serviços elétricos", tag: "PROFISSIONAIS" },
  { icon: "🛠️", name: "Reformas", detail: "Transforme seu ambiente", tag: "ORÇAMENTOS" },
];

export default function Home() {
  return (
    <main className="site-shell">
      <header className="topbar">
        <Link className="brand" href="/"><span className="brand-mark">M</span>Mestre</Link>
        <Link className="top-link" href="/acesso">Entrar na plataforma ↗</Link>
      </header>

      <section className="hero">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot" /> Conexões que resolvem</div>
          <h1>O profissional certo, <span>do seu jeito.</span></h1>
          <p className="hero-copy">Encontre quem entende do assunto ou mostre seu trabalho para novos clientes. No Mestre, contratar e oferecer serviços fica mais simples.</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/acesso?tipo=cliente">Quero contratar <span>→</span></Link>
            <Link className="btn btn-secondary" href="/acesso?tipo=prestador">Quero oferecer serviços</Link>
          </div>
          <div className="trust-line"><span className="trust-icon">✓</span> Cadastro gratuito · Publique pedidos · Compare propostas</div>
        </div>

        <div className="visual" aria-label="Exemplo de profissionais disponíveis">
          <div className="visual-card">
            <div className="visual-card-top">
              <div><div className="visual-label">Encontre profissionais</div><div style={{fontWeight:800,fontSize:20,marginTop:5}}>Perto de você</div></div>
              <div className="avatar-stack"><span className="avatar">👨🏻</span><span className="avatar">👩🏽</span><span className="avatar">👨🏾</span></div>
            </div>
            {services.map((service) => <div className="service-row" key={service.name}>
              <div className="service-icon">{service.icon}</div>
              <div><div className="service-name">{service.name}</div><div className="service-meta">{service.detail}</div></div>
              <span className="service-tag">{service.tag}</span>
            </div>)}
          </div>
          <div className="floating-note">Seu próximo serviço começa aqui ✨</div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Como você quer usar o Mestre?</h2>
          <p>Escolha seu caminho. O cadastro é simples e gratuito.</p>
        </div>
        <div className="choice-grid">
          <Link className="choice" href="/acesso?tipo=cliente">
            <span className="choice-icon">🏡</span>
            <span><h3>Sou cliente</h3><p>Publique o que precisa, receba propostas e escolha o profissional ideal.</p></span>
            <span className="choice-arrow">→</span>
          </Link>
          <Link className="choice" href="/acesso?tipo=prestador">
            <span className="choice-icon">🧰</span>
            <span><h3>Sou prestador de serviços</h3><p>Crie seu perfil, mostre seus trabalhos e encontre novas oportunidades.</p></span>
            <span className="choice-arrow">→</span>
          </Link>
        </div>
      </section>
      <footer className="footer">© {new Date().getFullYear()} Mestre. Conectando pessoas e bons profissionais.</footer>
    </main>
  );
}
