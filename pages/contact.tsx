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
            <div className="ip-page-tag">Support</div>
            <h1 className="ip-page-title">Contact & Support</h1>
            <p className="ip-page-lead">We're here to help. Reach out for any questions, issues, or feedback.</p>
          </div>

          {/* Email card */}
          <div className="ct-email-card">
            <div className="ct-email-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="5" width="16" height="12" rx="2" stroke="#60A5FA" strokeWidth="1.4"/>
                <path d="M2 7l8 5 8-5" stroke="#60A5FA" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="ct-email-content">
              <div className="ct-email-label">Email Support</div>
              <a href="mailto:trustterms.help@outlook.com" className="ct-email-addr">
                trustterms.help@outlook.com
              </a>
              <div className="ct-email-note">We respond within 48 hours (usually much faster).</div>
            </div>
          </div>

          {/* Help items */}
          <div className="ip-section">
            <h2 className="ip-section-title">What We Can Help With</h2>
            <div className="ct-help-grid">
              {helpItems.map((item, i) => (
                <div key={i} className="ct-help-card">
                  <span className="ct-help-icon">{item.icon}</span>
                  <div>
                    <div className="ct-help-title">{item.title}</div>
                    <div className="ct-help-desc">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick answers */}
          <div className="ip-section">
            <h2 className="ip-section-title">Quick Answers</h2>
            <div className="ct-qa-list">
              {[
                {
                  q: "How do I get a refund?",
                  a: "Email us at trustterms.help@outlook.com with your Stripe session ID within 48 hours. Refunds are provided for technical failures, duplicate payments, or service unavailability. See our Terms of Service for details.",
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
                <div key={i} className="ct-qa-item">
                  <div className="ct-qa-q">{item.q}</div>
                  <div className="ct-qa-a">{item.a}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Response times */}
          <div className="ip-section">
            <h2 className="ip-section-title">Response Times</h2>
            <div className="ct-times">
              {[
                { type: "Technical issues & refunds", time: "Within 24 hours" },
                { type: "General questions", time: "Within 48 hours" },
                { type: "GDPR requests", time: "Within 30 days (required by law)" },
              ].map((t, i) => (
                <div key={i} className="ct-time-row">
                  <span className="ct-time-type">{t.type}</span>
                  <span className="ct-time-val">{t.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Company info */}
          <div className="ip-section">
            <h2 className="ip-section-title">Company Information</h2>
            <div className="ip-card">
              <table className="ip-table">
                <tbody>
                  {[
                    ["Business Name", "TrustTerms"],
                    ["Legal Entity", "Enskild Firma (Sole Proprietorship)"],
                    ["Organization Number", "[To be added after registration]"],
                    ["Contact Email", "trustterms.help@outlook.com"],
                  ].map(([k, v], i) => (
                    <tr key={i}>
                      <td className="ip-table-key">{k}</td>
                      <td className="ip-table-val">
                        {k === "Contact Email" ? <a href={`mailto:${v}`}>{v}</a> : v}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <footer className="ip-footer">
          <div className="ip-footer-links">
            <a href="/about">About</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
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
        .ip-main { max-width: 720px; margin: 0 auto; padding: 56px 24px 80px; }
        .ip-page-header { margin-bottom: 44px; }
        .ip-page-tag { display: inline-block; font-family: 'JetBrains Mono', monospace; font-size: 10.5px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #60A5FA; background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.18); padding: 4px 10px; border-radius: 4px; margin-bottom: 14px; }
        .ip-page-title { font-family: 'Sora', system-ui, sans-serif; font-size: clamp(26px, 4vw, 34px); font-weight: 800; color: #F1F5F9; letter-spacing: -0.04em; line-height: 1.1; margin-bottom: 12px; }
        .ip-page-lead { font-size: 15px; color: #64748B; line-height: 1.7; }
        .ip-section { margin-bottom: 40px; }
        .ip-section-title { font-family: 'Sora', system-ui, sans-serif; font-size: 14.5px; font-weight: 700; color: #E2E8F0; letter-spacing: -0.02em; margin-bottom: 14px; padding-bottom: 9px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .ip-card { background: #0A1628; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 20px 22px; }
        .ip-table { width: 100%; border-collapse: collapse; }
        .ip-table tr { border-bottom: 1px solid rgba(255,255,255,0.04); }
        .ip-table tr:last-child { border-bottom: none; }
        .ip-table-key { font-size: 12px; font-weight: 600; color: #475569; padding: 10px 0; width: 160px; vertical-align: top; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.02em; }
        .ip-table-val { font-size: 13.5px; color: #CBD5E1; padding: 10px 0 10px 16px; }
        .ip-table-val a { color: #60A5FA; text-decoration: none; }
        .ip-table-val a:hover { text-decoration: underline; }

        /* Email card */
        .ct-email-card { display: flex; gap: 18px; align-items: flex-start; background: rgba(37,99,235,0.06); border: 1px solid rgba(59,130,246,0.15); border-radius: 16px; padding: 22px 24px; margin-bottom: 40px; }
        .ct-email-icon { width: 40px; height: 40px; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.15); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ct-email-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #60A5FA; margin-bottom: 6px; }
        .ct-email-addr { display: block; font-size: 16px; font-weight: 700; color: #F1F5F9; text-decoration: none; margin-bottom: 6px; letter-spacing: -0.01em; }
        .ct-email-addr:hover { color: #60A5FA; }
        .ct-email-note { font-size: 12.5px; color: #475569; }

        /* Help grid */
        .ct-help-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        @media (max-width: 580px) { .ct-help-grid { grid-template-columns: 1fr; } }
        .ct-help-card { display: flex; gap: 14px; align-items: flex-start; background: #0A1628; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px 18px; transition: border-color 0.15s; }
        .ct-help-card:hover { border-color: rgba(255,255,255,0.12); }
        .ct-help-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
        .ct-help-title { font-size: 13.5px; font-weight: 600; color: #E2E8F0; margin-bottom: 4px; }
        .ct-help-desc { font-size: 12.5px; color: #64748B; line-height: 1.55; }

        /* QA */
        .ct-qa-list { display: flex; flex-direction: column; gap: 0; background: #0A1628; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; overflow: hidden; }
        .ct-qa-item { padding: 18px 22px; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .ct-qa-item:last-child { border-bottom: none; }
        .ct-qa-q { font-size: 13.5px; font-weight: 600; color: #E2E8F0; margin-bottom: 7px; }
        .ct-qa-a { font-size: 13px; color: #64748B; line-height: 1.65; }

        /* Times */
        .ct-times { background: rgba(16,185,129,0.04); border: 1px solid rgba(16,185,129,0.12); border-radius: 14px; overflow: hidden; }
        .ct-time-row { display: flex; justify-content: space-between; align-items: center; padding: 13px 20px; border-bottom: 1px solid rgba(255,255,255,0.03); flex-wrap: wrap; gap: 8px; }
        .ct-time-row:last-child { border-bottom: none; }
        .ct-time-type { font-size: 13.5px; color: #94A3B8; }
        .ct-time-val { font-size: 12.5px; font-weight: 600; color: #10B981; font-family: 'JetBrains Mono', monospace; }

        .ip-footer { border-top: 1px solid rgba(255,255,255,0.05); padding: 24px; text-align: center; }
        .ip-footer-links { display: flex; justify-content: center; gap: 24px; flex-wrap: wrap; }
        .ip-footer-links a { font-size: 13px; color: #475569; text-decoration: none; transition: color 0.15s; }
        .ip-footer-links a:hover { color: #94A3B8; }
      `}</style>
    </>
  );
}