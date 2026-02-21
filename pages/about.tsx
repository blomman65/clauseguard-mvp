import Meta from '../components/Meta';

export default function About() {
  return (
    <>
      <Meta
        title="About - TrustTerms"
        description="Learn about TrustTerms and who's behind the service"
      />
      <div className="ip-root">
        <nav className="ip-nav">
          <a href="/" className="ip-nav-logo">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L18 6V14L10 18L2 14V6L10 2Z" stroke="#3B82F6" strokeWidth="1.5" fill="none"/>
              <path d="M10 6L14 8V12L10 14L6 12V8L10 6Z" fill="#3B82F6" opacity="0.4"/>
            </svg>
            TrustTerms
          </a>
          <a href="/" className="ip-back">← Back to home</a>
        </nav>

        <main className="ip-main">
          <div className="ip-page-header">
            <div className="ip-page-tag">About</div>
            <h1 className="ip-page-title">Built to level the playing field</h1>
            <p className="ip-page-lead">Legal protection shouldn't require a legal budget. TrustTerms gives founders and operators the same contract clarity that enterprise teams get from expensive law firms.</p>
          </div>

          <div className="ip-section">
            <h2 className="ip-section-title">How It Works</h2>
            <div className="ip-steps">
              {[
                { num: "01", title: "Paste Your Contract", desc: "Copy your SaaS agreement or commercial contract into our secure analysis tool." },
                { num: "02", title: "AI Analysis", desc: "Our GPT-4 powered system scans for hidden risks, unfavorable terms, and non-standard clauses." },
                { num: "03", title: "Get Actionable Insights", desc: "Receive a detailed report with specific negotiation strategies and risk assessments." },
              ].map((s, i) => (
                <div key={i} className="ip-step">
                  <div className="ip-step-num">{s.num}</div>
                  <div>
                    <div className="ip-step-title">{s.title}</div>
                    <div className="ip-step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ip-section">
            <h2 className="ip-section-title">Privacy & Security</h2>
            <div className="ip-card ip-card--green">
              <div className="ip-security-grid">
                {[
                  { icon: "🔒", label: "Never stored", desc: "Contracts are never saved on our servers." },
                  { icon: "🔐", label: "Encrypted transit", desc: "All data transmitted via HTTPS/TLS." },
                  { icon: "⏱", label: "30-day OpenAI retention", desc: "API data deleted after abuse monitoring." },
                  { icon: "🇪🇺", label: "GDPR compliant", desc: "Full transparency on data handling." },
                  { icon: "👤", label: "No account required", desc: "Use the service without signing up." },
                ].map((item, i) => (
                  <div key={i} className="ip-security-item">
                    <span className="ip-security-icon">{item.icon}</span>
                    <div>
                      <div className="ip-security-label">{item.label}</div>
                      <div className="ip-security-desc">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="ip-section">
            <h2 className="ip-section-title">Company Information</h2>
            <div className="ip-card">
              <table className="ip-table">
                <tbody>
                  {[
                    ["Business Name", "TrustTerms"],
                    ["Legal Entity", "Enskild Firma (Sole Proprietorship)"],
                    ["Organization Number", "[To be added after registration]"],
                    ["VAT Number", "[To be added if VAT registered]"],
                    ["Contact Email", "trustterms.help@outlook.com"],
                  ].map(([k, v], i) => (
                    <tr key={i}>
                      <td className="ip-table-key">{k}</td>
                      <td className="ip-table-val">
                        {k === "Contact Email"
                          ? <a href={`mailto:${v}`}>{v}</a>
                          : v}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="ip-table-note">For official records, see <a href="https://www.bolagsverket.se" target="_blank" rel="noopener noreferrer">Bolagsverket</a></p>
            </div>
          </div>

          <div className="ip-section">
            <h2 className="ip-section-title">Technology Stack</h2>
            <div className="ip-tech-grid">
              {[
                { name: "OpenAI GPT-4", use: "Contract analysis engine" },
                { name: "Stripe", use: "Secure payment processing" },
                { name: "Vercel", use: "Hosting & infrastructure" },
                { name: "PostHog", use: "Privacy-focused analytics (EU)" },
                { name: "Sentry", use: "Error monitoring & reliability" },
              ].map((t, i) => (
                <div key={i} className="ip-tech-row">
                  <span className="ip-tech-name">{t.name}</span>
                  <span className="ip-tech-use">{t.use}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ip-disclaimer">
            <div className="ip-disclaimer-icon">⚠️</div>
            <div>
              <div className="ip-disclaimer-title">Important Legal Disclaimer</div>
              <p className="ip-disclaimer-text">TrustTerms provides general information only and <strong>does NOT constitute legal advice</strong>. Our AI analysis may contain errors or omissions. Always consult a qualified lawyer before making legal decisions or signing contracts. We are not a law firm and do not create an attorney-client relationship.</p>
            </div>
          </div>
        </main>

        <footer className="ip-footer">
          <div className="ip-footer-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/contact">Contact & Support</a>
            <a href="/">Home</a>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #030B18; color: #F1F5F9; font-family: 'DM Sans', system-ui, sans-serif; font-size: 15px; line-height: 1.6; -webkit-font-smoothing: antialiased; }
        .ip-root { min-height: 100vh; background: #030B18; }
        .ip-nav { position: sticky; top: 0; z-index: 50; background: rgba(3,11,24,0.9); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,0.05); padding: 0 24px; height: 52px; display: flex; align-items: center; justify-content: space-between; }
        .ip-nav-logo { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #F1F5F9; text-decoration: none; letter-spacing: -0.01em; }
        .ip-back { font-size: 13px; color: #475569; text-decoration: none; transition: color 0.15s; }
        .ip-back:hover { color: #94A3B8; }
        .ip-main { max-width: 740px; margin: 0 auto; padding: 56px 24px 80px; }
        .ip-page-header { margin-bottom: 56px; }
        .ip-page-tag { display: inline-block; font-family: 'JetBrains Mono', monospace; font-size: 10.5px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #60A5FA; background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.18); padding: 4px 10px; border-radius: 4px; margin-bottom: 16px; }
        .ip-page-title { font-family: 'Sora', system-ui, sans-serif; font-size: clamp(28px, 5vw, 38px); font-weight: 800; color: #F1F5F9; letter-spacing: -0.04em; line-height: 1.1; margin-bottom: 16px; }
        .ip-page-lead { font-size: 16px; color: #64748B; line-height: 1.7; max-width: 580px; }
        .ip-section { margin-bottom: 44px; }
        .ip-section-title { font-family: 'Sora', system-ui, sans-serif; font-size: 14.5px; font-weight: 700; color: #E2E8F0; letter-spacing: -0.02em; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .ip-card { background: #0A1628; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 20px 22px; }
        .ip-card--green { background: rgba(16,185,129,0.04); border-color: rgba(16,185,129,0.12); }
        .ip-steps { display: flex; flex-direction: column; gap: 12px; }
        .ip-step { display: flex; align-items: flex-start; gap: 18px; background: #0A1628; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 18px 20px; }
        .ip-step-num { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 500; color: #3B82F6; letter-spacing: 0.05em; min-width: 28px; margin-top: 2px; }
        .ip-step-title { font-size: 14px; font-weight: 600; color: #E2E8F0; margin-bottom: 4px; }
        .ip-step-desc { font-size: 13.5px; color: #64748B; line-height: 1.6; }
        .ip-security-grid { display: flex; flex-direction: column; gap: 14px; }
        .ip-security-item { display: flex; gap: 12px; align-items: flex-start; }
        .ip-security-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
        .ip-security-label { font-size: 13.5px; font-weight: 600; color: #E2E8F0; margin-bottom: 2px; }
        .ip-security-desc { font-size: 12.5px; color: #64748B; }
        .ip-table { width: 100%; border-collapse: collapse; }
        .ip-table tr { border-bottom: 1px solid rgba(255,255,255,0.04); }
        .ip-table tr:last-child { border-bottom: none; }
        .ip-table-key { font-size: 12.5px; font-weight: 600; color: #475569; padding: 10px 0; width: 180px; vertical-align: top; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.02em; }
        .ip-table-val { font-size: 13.5px; color: #CBD5E1; padding: 10px 0 10px 16px; }
        .ip-table-val a { color: #60A5FA; text-decoration: none; }
        .ip-table-val a:hover { text-decoration: underline; }
        .ip-table-note { font-size: 12px; color: #475569; margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.04); }
        .ip-table-note a { color: #60A5FA; text-decoration: none; }
        .ip-tech-grid { background: #0A1628; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; overflow: hidden; }
        .ip-tech-row { display: flex; justify-content: space-between; align-items: center; padding: 13px 20px; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .ip-tech-row:last-child { border-bottom: none; }
        .ip-tech-name { font-size: 13.5px; font-weight: 600; color: #E2E8F0; }
        .ip-tech-use { font-size: 12.5px; color: #64748B; }
        .ip-disclaimer { display: flex; gap: 16px; align-items: flex-start; background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.15); border-radius: 14px; padding: 20px 22px; margin-top: 48px; }
        .ip-disclaimer-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
        .ip-disclaimer-title { font-size: 14px; font-weight: 700; color: #FCA5A5; margin-bottom: 6px; }
        .ip-disclaimer-text { font-size: 13.5px; color: #94A3B8; line-height: 1.65; }
        .ip-disclaimer-text strong { color: #FECACA; }
        .ip-footer { border-top: 1px solid rgba(255,255,255,0.05); padding: 24px; text-align: center; }
        .ip-footer-links { display: flex; justify-content: center; gap: 24px; flex-wrap: wrap; }
        .ip-footer-links a { font-size: 13px; color: #475569; text-decoration: none; transition: color 0.15s; }
        .ip-footer-links a:hover { color: #94A3B8; }
      `}</style>
    </>
  );
}