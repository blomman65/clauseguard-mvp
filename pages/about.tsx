import Meta from '../components/Meta';

export default function About() {
  return (
    <>
      <Meta
        title="About - TrustTerms"
        description="Learn about TrustTerms and who's behind the service"
      />
      <div className="root">

        <nav className="nav">
          <a href="/" className="logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L22 7V17L12 22L2 17V7L12 2Z" stroke="#3B82F6" strokeWidth="1.6" fill="none"/>
              <path d="M12 7L17 9.5V14.5L12 17L7 14.5V9.5L12 7Z" fill="#3B82F6" fillOpacity="0.3"/>
            </svg>
            TrustTerms
          </a>
          <a href="/" className="back-link">← Back to home</a>
        </nav>

        <main className="main">

          <div className="page-header">
            <div className="tag">About</div>
            <h1 className="page-title">Built to level the playing field</h1>
            <p className="page-lead">Legal protection shouldn't require a legal budget. TrustTerms gives founders and operators the same contract clarity that enterprise teams get from expensive law firms.</p>
          </div>

          <section className="section">
            <h2 className="section-title">How It Works</h2>
            <div className="steps">
              {[
                { num: "01", title: "Paste Your Contract", desc: "Copy your SaaS agreement or commercial contract into our secure analysis tool." },
                { num: "02", title: "AI Analysis", desc: "Our GPT-4 powered system scans for hidden risks, unfavorable terms, and non-standard clauses." },
                { num: "03", title: "Get Actionable Insights", desc: "Receive a detailed report with specific negotiation strategies and risk assessments." },
              ].map((s, i) => (
                <div key={i} className="step-card">
                  <div className="step-num">{s.num}</div>
                  <div>
                    <div className="step-title">{s.title}</div>
                    <div className="step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">Privacy &amp; Security</h2>
            <div className="green-card">
              {[
                { icon: "🔒", label: "Never stored", desc: "Contracts are never saved on our servers." },
                { icon: "🔐", label: "Encrypted transit", desc: "All data transmitted via HTTPS/TLS." },
                { icon: "⏱", label: "30-day OpenAI retention", desc: "API data deleted after abuse monitoring." },
                { icon: "🇪🇺", label: "GDPR compliant", desc: "Full transparency on data handling." },
                { icon: "👤", label: "No account required", desc: "Use the service without signing up." },
              ].map((item, i) => (
                <div key={i} className="security-item">
                  <span className="security-icon">{item.icon}</span>
                  <div>
                    <div className="security-label">{item.label}</div>
                    <div className="security-desc">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">Company Information</h2>
            <div className="data-card">
              <table className="data-table">
                <tbody>
                  {[
                    ["Business Name", "TrustTerms"],
                    ["Legal Entity", "Enskild Firma (Sole Proprietorship)"],
                    ["Organization Number", "20080117-1372"],
                    ["VAT Number", "SE080117137201"],
                    ["Contact Email", "trustterms.help@outlook.com"],
                  ].map(([k, v], i) => (
                    <tr key={i}>
                      <td className="data-key">{k}</td>
                      <td className="data-val">
                        {k === "Contact Email"
                          ? <a href={`mailto:${v}`}>{v}</a>
                          : v}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="data-note">For official records, see <a href="https://www.bolagsverket.se" target="_blank" rel="noopener noreferrer">Bolagsverket</a></p>
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">Technology Stack</h2>
            <div className="tech-card">
              {[
                { name: "OpenAI GPT-4", use: "Contract analysis engine" },
                { name: "Stripe", use: "Secure payment processing" },
                { name: "Vercel", use: "Hosting & infrastructure" },
                { name: "PostHog", use: "Privacy-focused analytics (EU)" },
                { name: "Sentry", use: "Error monitoring & reliability" },
              ].map((t, i) => (
                <div key={i} className="tech-row">
                  <span className="tech-name">{t.name}</span>
                  <span className="tech-use">{t.use}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="disclaimer-block">
            <div className="disclaimer-icon">⚠️</div>
            <div>
              <div className="disclaimer-title">Important Legal Disclaimer</div>
              <p className="disclaimer-text">TrustTerms provides general information only and <strong>does NOT constitute legal advice</strong>. Our AI analysis may contain errors or omissions. Always consult a qualified lawyer before making legal decisions or signing contracts. We are not a law firm and do not create an attorney-client relationship.</p>
            </div>
          </div>

        </main>

        <footer className="footer">
          <div className="footer-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/contact">Contact & Support</a>
            <a href="/">Home</a>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #030B18; color: #F1F5F9;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 15px; line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          background-image: radial-gradient(ellipse 80% 40% at 50% -5%, rgba(37,99,235,0.1) 0%, transparent 65%);
        }
        .root { min-height: 100vh; }

        /* NAV */
        .nav {
          position: sticky; top: 0; z-index: 50;
          background: rgba(3,11,24,0.88);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding: 0 24px; height: 54px;
          display: flex; align-items: center; justify-content: space-between;
          max-width: 100%;
        }
        .logo {
          display: flex; align-items: center; gap: 9px;
          font-family: 'Sora', system-ui, sans-serif;
          font-size: 15px; font-weight: 700; color: #F1F5F9;
          text-decoration: none; letter-spacing: -0.02em;
        }
        .back-link {
          font-size: 13px; color: #475569; text-decoration: none;
          transition: color 0.15s;
        }
        .back-link:hover { color: #94A3B8; }

        /* MAIN */
        .main { max-width: 740px; margin: 0 auto; padding: 56px 24px 80px; }

        /* PAGE HEADER */
        .page-header { margin-bottom: 52px; }
        .tag {
          display: inline-block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px; font-weight: 500;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #60A5FA; background: rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.18);
          padding: 4px 10px; border-radius: 5px; margin-bottom: 16px;
        }
        .page-title {
          font-family: 'Sora', system-ui, sans-serif;
          font-size: clamp(28px, 5vw, 38px); font-weight: 800;
          color: #F1F5F9; letter-spacing: -0.04em;
          line-height: 1.1; margin-bottom: 16px;
        }
        .page-lead { font-size: 16px; color: #64748B; line-height: 1.7; max-width: 580px; }

        /* SECTIONS */
        .section { margin-bottom: 44px; }
        .section-title {
          font-family: 'Sora', system-ui, sans-serif;
          font-size: 14px; font-weight: 700; color: #E2E8F0;
          letter-spacing: -0.01em; margin-bottom: 16px;
          padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        /* STEPS */
        .steps { display: flex; flex-direction: column; gap: 10px; }
        .step-card {
          display: flex; align-items: flex-start; gap: 18px;
          background: #0A1628; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 18px 20px;
          transition: border-color 0.2s;
        }
        .step-card:hover { border-color: rgba(255,255,255,0.12); }
        .step-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; font-weight: 500; color: #3B82F6;
          letter-spacing: 0.05em; min-width: 28px; margin-top: 2px;
        }
        .step-title { font-size: 14px; font-weight: 600; color: #E2E8F0; margin-bottom: 4px; }
        .step-desc { font-size: 13.5px; color: #64748B; line-height: 1.6; }

        /* GREEN CARD */
        .green-card {
          background: rgba(16,185,129,0.04);
          border: 1px solid rgba(16,185,129,0.14);
          border-radius: 16px; padding: 20px 22px;
          display: flex; flex-direction: column; gap: 16px;
        }
        .security-item { display: flex; gap: 13px; align-items: flex-start; }
        .security-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
        .security-label { font-size: 13.5px; font-weight: 600; color: #E2E8F0; margin-bottom: 2px; }
        .security-desc { font-size: 12.5px; color: #64748B; }

        /* DATA TABLE */
        .data-card {
          background: #0A1628; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 20px 22px;
        }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table tr { border-bottom: 1px solid rgba(255,255,255,0.04); }
        .data-table tr:last-child { border-bottom: none; }
        .data-key {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; font-weight: 500; color: #475569;
          padding: 11px 0; width: 190px; vertical-align: top;
        }
        .data-val { font-size: 13.5px; color: #CBD5E1; padding: 11px 0 11px 16px; }
        .data-val a { color: #60A5FA; text-decoration: none; }
        .data-val a:hover { text-decoration: underline; }
        .data-note {
          font-size: 12px; color: #475569; margin-top: 14px;
          padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.04);
        }
        .data-note a { color: #60A5FA; text-decoration: none; }

        /* TECH */
        .tech-card {
          background: #0A1628; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; overflow: hidden;
        }
        .tech-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
        }
        .tech-row:last-child { border-bottom: none; }
        .tech-row:hover { background: rgba(255,255,255,0.02); }
        .tech-name { font-size: 13.5px; font-weight: 600; color: #E2E8F0; }
        .tech-use { font-size: 12.5px; color: #64748B; }

        /* DISCLAIMER */
        .disclaimer-block {
          display: flex; gap: 16px; align-items: flex-start;
          background: rgba(239,68,68,0.05);
          border: 1px solid rgba(239,68,68,0.14);
          border-radius: 16px; padding: 20px 22px; margin-top: 12px;
        }
        .disclaimer-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
        .disclaimer-title { font-size: 14px; font-weight: 700; color: #FCA5A5; margin-bottom: 6px; }
        .disclaimer-text { font-size: 13.5px; color: #94A3B8; line-height: 1.65; }
        .disclaimer-text strong { color: #FECACA; }

        /* FOOTER */
        .footer { border-top: 1px solid rgba(255,255,255,0.05); padding: 24px; text-align: center; }
        .footer-links { display: flex; justify-content: center; gap: 24px; flex-wrap: wrap; }
        .footer-links a { font-size: 13px; color: #475569; text-decoration: none; transition: color 0.15s; }
        .footer-links a:hover { color: #94A3B8; }
      `}</style>
    </>
  );
}