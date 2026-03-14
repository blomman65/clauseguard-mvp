import Meta from '../components/Meta';

export default function Contact() {
  const helpItems = [
    { icon: "🔧", title: "Technical Issues", desc: "Analysis failed, payment problems, PDF download issues, or any technical errors." },
    { icon: "💰", title: "Billing & Refunds", desc: "Refund requests, duplicate charges, or payment questions." },
    { icon: "❓", title: "General Questions", desc: "How the service works, pricing, data privacy, or usage questions." },
    { icon: "🐛", title: "Bug Reports", desc: "Found a bug? Let us know so we can fix it." },
    { icon: "💡", title: "Feature Requests", desc: "Have ideas for improving TrustTerms? We'd love to hear them." },
    { icon: "🔒", title: "Privacy & GDPR", desc: "Data deletion requests, privacy concerns, or GDPR-related inquiries." },
  ];

  return (
    <>
      <Meta
        title="Contact & Support - TrustTerms"
        description="Get help with TrustTerms or contact our support team"
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
            <div className="tag">Support</div>
            <h1 className="page-title">Contact & Support</h1>
            <p className="page-lead">We're here to help. Reach out for any questions, issues, or feedback.</p>
          </div>

          {/* Email card */}
          <div className="email-card">
            <div className="email-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="5" width="16" height="12" rx="2" stroke="#60A5FA" strokeWidth="1.4"/>
                <path d="M2 7l8 5 8-5" stroke="#60A5FA" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="email-content">
              <div className="email-label">Email Support</div>
              <a href="mailto:trustterms.help@outlook.com" className="email-address">
                trustterms.help@outlook.com
              </a>
              <div className="email-note">We respond within 48 hours (usually much faster).</div>
            </div>
          </div>

          <section className="section">
            <h2 className="section-title">What We Can Help With</h2>
            <div className="help-grid">
              {helpItems.map((item, i) => (
                <div key={i} className="help-card">
                  <span className="help-icon">{item.icon}</span>
                  <div>
                    <div className="help-title">{item.title}</div>
                    <div className="help-desc">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">Quick Answers</h2>
            <div className="qa-list">
              {[
                {
                  q: "How do I get a refund?",
                  a: "Email us at trustterms.help@outlook.com with your Stripe session ID within 48 hours. Refunds are provided for technical failures, duplicate payments, or service unavailability.",
                },
                {
                  q: "The analysis failed. What should I do?",
                  a: "Email us immediately with details of the error. We'll either reactivate your access token or provide a full refund. Technical failures on our end are always remedied.",
                },
                {
                  q: "How do I delete my data?",
                  a: "We don't store your contract text on our servers. It's processed via OpenAI's API, which retains data for 30 days before permanent deletion. For analytics data deletion, email us.",
                },
                {
                  q: "Can I get a receipt or invoice?",
                  a: "Yes! Check your email for the Stripe receipt, or contact us and we'll send you one.",
                },
              ].map((item, i) => (
                <div key={i} className="qa-item">
                  <div className="qa-q">{item.q}</div>
                  <div className="qa-a">{item.a}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">Response Times</h2>
            <div className="times-card">
              {[
                { type: "Technical issues & refunds", time: "Within 24 hours" },
                { type: "General questions", time: "Within 48 hours" },
                { type: "GDPR requests", time: "Within 30 days (required by law)" },
              ].map((t, i) => (
                <div key={i} className="time-row">
                  <span className="time-type">{t.type}</span>
                  <span className="time-val">{t.time}</span>
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
                    ["Contact Email", "trustterms.help@outlook.com"],
                  ].map(([k, v], i) => (
                    <tr key={i}>
                      <td className="data-key">{k}</td>
                      <td className="data-val">
                        {k === "Contact Email" ? <a href={`mailto:${v}`}>{v}</a> : v}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </main>

        <footer className="footer">
          <div className="footer-links">
            <a href="/about">About</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
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

        .nav {
          position: sticky; top: 0; z-index: 50;
          background: rgba(3,11,24,0.88); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding: 0 24px; height: 54px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .logo {
          display: flex; align-items: center; gap: 9px;
          font-family: 'Sora', system-ui, sans-serif;
          font-size: 15px; font-weight: 700; color: #F1F5F9;
          text-decoration: none; letter-spacing: -0.02em;
        }
        .back-link { font-size: 13px; color: #475569; text-decoration: none; transition: color 0.15s; }
        .back-link:hover { color: #94A3B8; }

        .main { max-width: 720px; margin: 0 auto; padding: 56px 24px 80px; }

        .page-header { margin-bottom: 44px; }
        .tag {
          display: inline-block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px; font-weight: 500;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #60A5FA; background: rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.18);
          padding: 4px 10px; border-radius: 5px; margin-bottom: 14px;
        }
        .page-title {
          font-family: 'Sora', system-ui, sans-serif;
          font-size: clamp(26px, 4vw, 34px); font-weight: 800;
          color: #F1F5F9; letter-spacing: -0.04em; line-height: 1.1; margin-bottom: 12px;
        }
        .page-lead { font-size: 15px; color: #64748B; line-height: 1.7; }

        .section { margin-bottom: 40px; }
        .section-title {
          font-family: 'Sora', system-ui, sans-serif;
          font-size: 14px; font-weight: 700; color: #E2E8F0;
          margin-bottom: 14px; padding-bottom: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        /* EMAIL CARD */
        .email-card {
          display: flex; gap: 18px; align-items: flex-start;
          background: rgba(37,99,235,0.06);
          border: 1px solid rgba(59,130,246,0.16);
          border-radius: 18px; padding: 22px 24px; margin-bottom: 40px;
          transition: border-color 0.2s;
        }
        .email-card:hover { border-color: rgba(59,130,246,0.28); }
        .email-icon-wrap {
          width: 42px; height: 42px;
          background: rgba(59,130,246,0.1);
          border: 1px solid rgba(59,130,246,0.16);
          border-radius: 11px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .email-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px; font-weight: 500; letter-spacing: 0.09em;
          text-transform: uppercase; color: #60A5FA; margin-bottom: 6px;
        }
        .email-address {
          display: block; font-family: 'Sora', system-ui, sans-serif;
          font-size: 16px; font-weight: 700; color: #F1F5F9;
          text-decoration: none; margin-bottom: 6px; letter-spacing: -0.01em;
          transition: color 0.15s;
        }
        .email-address:hover { color: #60A5FA; }
        .email-note { font-size: 12.5px; color: #475569; }

        /* HELP GRID */
        .help-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        @media(max-width:580px){ .help-grid { grid-template-columns: 1fr; } }
        .help-card {
          display: flex; gap: 13px; align-items: flex-start;
          background: #0A1628; border: 1px solid rgba(255,255,255,0.06);
          border-radius: 13px; padding: 16px 18px;
          transition: border-color 0.15s;
        }
        .help-card:hover { border-color: rgba(255,255,255,0.12); }
        .help-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
        .help-title { font-size: 13.5px; font-weight: 600; color: #E2E8F0; margin-bottom: 4px; }
        .help-desc { font-size: 12.5px; color: #64748B; line-height: 1.55; }

        /* QA */
        .qa-list {
          background: #0A1628; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; overflow: hidden;
        }
        .qa-item { padding: 18px 22px; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .qa-item:last-child { border-bottom: none; }
        .qa-q { font-size: 13.5px; font-weight: 600; color: #E2E8F0; margin-bottom: 7px; }
        .qa-a { font-size: 13px; color: #64748B; line-height: 1.65; }

        /* TIMES */
        .times-card {
          background: rgba(16,185,129,0.04);
          border: 1px solid rgba(16,185,129,0.14);
          border-radius: 16px; overflow: hidden;
        }
        .time-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.03);
          flex-wrap: wrap; gap: 8px;
        }
        .time-row:last-child { border-bottom: none; }
        .time-type { font-size: 13.5px; color: #94A3B8; }
        .time-val {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; font-weight: 600; color: #10B981;
        }

        /* DATA TABLE */
        .data-card { background: #0A1628; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px 22px; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table tr { border-bottom: 1px solid rgba(255,255,255,0.04); }
        .data-table tr:last-child { border-bottom: none; }
        .data-key { font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 500; color: #475569; padding: 11px 0; width: 175px; vertical-align: top; }
        .data-val { font-size: 13.5px; color: #CBD5E1; padding: 11px 0 11px 16px; }
        .data-val a { color: #60A5FA; text-decoration: none; }
        .data-val a:hover { text-decoration: underline; }

        .footer { border-top: 1px solid rgba(255,255,255,0.05); padding: 24px; text-align: center; }
        .footer-links { display: flex; justify-content: center; gap: 24px; flex-wrap: wrap; }
        .footer-links a { font-size: 13px; color: #475569; text-decoration: none; transition: color 0.15s; }
        .footer-links a:hover { color: #94A3B8; }
      `}</style>
    </>
  );
}