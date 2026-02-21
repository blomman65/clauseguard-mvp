import Meta from '../components/Meta';

// Import shared styles from about.tsx — in practice, move SHARED_STYLES to a shared file
// For now, redeclare here (same content)
declare const SHARED_STYLES: string;

export default function Privacy() {
  return (
    <>
      <Meta
        title="Privacy Policy - TrustTerms"
        description="How TrustTerms handles your data and protects your privacy"
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
            <div className="ip-page-tag">Legal</div>
            <h1 className="ip-page-title">Privacy Policy</h1>
            <p className="ip-meta">Last updated: January 26, 2025</p>
          </div>

          <div className="ip-prose">
            <h2>1. Data Controller</h2>
            <p><strong>Legal Entity:</strong> TrustTerms, Enskild Firma<br/>
            <strong>Organization Number:</strong> [To be added after registration]<br/>
            <strong>Contact Email:</strong> trustterms.help@outlook.com<br/>
            <strong>Response Time:</strong> Within 30 days for GDPR requests</p>
            <p>For official company records, see <a href="https://www.bolagsverket.se" target="_blank" rel="noopener noreferrer">Bolagsverket</a>.</p>

            <h2>2. What Data We Collect</h2>
            <p><strong>Contract Text:</strong> Processed via OpenAI's API. OpenAI retains API data for 30 days for abuse monitoring before permanent deletion. Your contract is never stored on our servers.</p>
            <p><strong>Payment Information:</strong> We use Stripe to process payments. We do not store credit card information. We receive only: payment confirmation, session ID, and payment timestamp.</p>
            <p><strong>Analytics Data:</strong> With your consent, we use PostHog to collect anonymous usage data. No personal identifiers are collected. You can opt out via our cookie banner.</p>
            <p><strong>Technical Data:</strong> IP addresses collected for rate limiting (stored temporarily, 1 hour).</p>

            <h2>3. How We Use Your Data</h2>
            <ul>
              <li>To provide contract analysis services via OpenAI's API</li>
              <li>To process payments securely via Stripe</li>
              <li>To improve our product based on anonymous usage patterns</li>
              <li>To prevent fraud and abuse (rate limiting, security monitoring)</li>
              <li>To comply with legal obligations</li>
            </ul>

            <h2>4. Data Sharing & Third Parties</h2>
            <p>We share data only with:</p>
            <ul>
              <li><strong>OpenAI:</strong> Contract text sent to OpenAI's API for analysis. Retained 30 days for abuse monitoring, then permanently deleted. Not used to train models. <a href="https://openai.com/policies/api-data-usage-policies" target="_blank" rel="noopener noreferrer">Learn more</a></li>
              <li><strong>Stripe:</strong> Payment processing only. PCI-DSS compliant.</li>
              <li><strong>PostHog (EU):</strong> Anonymous analytics (only if you accept cookies). EU servers.</li>
              <li><strong>Vercel:</strong> Hosting infrastructure</li>
              <li><strong>Upstash (Vercel KV):</strong> Temporary token storage (max 24 hours)</li>
            </ul>
            <p>We do NOT sell, rent, or share your data with advertisers or marketing companies.</p>

            <h2>5. Data Retention</h2>
            <ul>
              <li><strong>Contract text:</strong> 30 days via OpenAI, then permanently deleted. Not stored on our servers.</li>
              <li><strong>Payment records:</strong> Stored by Stripe per their retention policy (7 years for tax compliance)</li>
              <li><strong>Access tokens:</strong> Automatically deleted after 24 hours</li>
              <li><strong>IP addresses (rate limiting):</strong> Automatically deleted after 1 hour</li>
              <li><strong>Analytics data:</strong> Retained for 12 months, then automatically deleted</li>
            </ul>

            <h2>6. Your Rights (GDPR)</h2>
            <p>Under GDPR, you have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing</li>
              <li>Data portability</li>
              <li>Withdraw consent for cookies/analytics at any time</li>
              <li>Lodge a complaint with your local data protection authority</li>
            </ul>
            <p>Contact: <strong>trustterms.help@outlook.com</strong>. We respond within 30 days as required by GDPR.</p>

            <h2>7. Data Breach Notification</h2>
            <p>In the event of a data breach, we will notify affected users within 72 hours as required by GDPR Article 33.</p>

            <h2>8. Data Processing Agreement (DPA)</h2>
            <p>Business customers may request a DPA at <strong>trustterms.help@outlook.com</strong>.</p>

            <h2>9. Security</h2>
            <ul>
              <li>All connections use HTTPS/TLS encryption</li>
              <li>Contract text processed in memory only (never written to disk on our servers)</li>
              <li>Rate limiting to prevent abuse</li>
              <li>One-time access tokens with 24-hour expiry</li>
              <li>Regular security audits via Sentry</li>
              <li>Input sanitization to prevent injection attacks</li>
            </ul>

            <h2>10. Cookies & Tracking</h2>
            <ul>
              <li><strong>Essential:</strong> Cookie consent preferences (localStorage only)</li>
              <li><strong>Analytics (optional):</strong> PostHog — requires explicit consent</li>
            </ul>
            <p>You can control cookie preferences via our cookie banner. Declining cookies will not affect core functionality.</p>

            <h2>11. International Data Transfers</h2>
            <ul>
              <li><strong>EU:</strong> PostHog analytics (EU servers), Vercel hosting (EU regions)</li>
              <li><strong>USA:</strong> OpenAI API (with Standard Contractual Clauses), Stripe payments</li>
            </ul>
            <p>All transfers comply with GDPR requirements via Standard Contractual Clauses (SCCs).</p>

            <h2>12. Children's Privacy</h2>
            <p>Our service is not intended for anyone under 16 years of age. We do not knowingly collect data from children.</p>

            <h2>13. Changes to This Policy</h2>
            <p>Material changes will be notified via email or a prominent notice on our website. The "Last updated" date at the top reflects the most recent changes.</p>

            <h2>14. Contact & Supervisory Authority</h2>
            <p><strong>Email:</strong> trustterms.help@outlook.com<br/>
            <strong>Response time:</strong> Within 30 days for GDPR requests</p>
            <p>If not satisfied, you may lodge a complaint with the <a href="https://www.imy.se" target="_blank" rel="noopener noreferrer">Swedish Data Protection Authority (IMY)</a> or your local authority.</p>
          </div>
        </main>

        <footer className="ip-footer">
          <div className="ip-footer-links">
            <a href="/about">About</a>
            <a href="/terms">Terms of Service</a>
            <a href="/contact">Contact</a>
            <a href="/">Home</a>
          </div>
        </footer>
      </div>
      <style jsx>{INNER_STYLES}</style>
    </>
  );
}

const INNER_STYLES = `
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
  .ip-meta { font-size: 12px; color: #475569; font-family: 'JetBrains Mono', monospace; }
  .ip-prose h2 { font-family: 'Sora', system-ui, sans-serif; font-size: 14.5px; font-weight: 700; color: #E2E8F0; letter-spacing: -0.02em; margin: 34px 0 12px; padding-bottom: 9px; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .ip-prose h2:first-child { margin-top: 0; }
  .ip-prose p { font-size: 14px; color: #94A3B8; line-height: 1.75; margin-bottom: 12px; }
  .ip-prose ul { padding-left: 0; list-style: none; margin-bottom: 12px; display: flex; flex-direction: column; gap: 7px; }
  .ip-prose li { font-size: 14px; color: #94A3B8; line-height: 1.65; padding-left: 20px; position: relative; }
  .ip-prose li::before { content: '—'; position: absolute; left: 0; color: #3B82F6; font-weight: 600; }
  .ip-prose strong { color: #CBD5E1; font-weight: 600; }
  .ip-prose a { color: #60A5FA; text-decoration: none; }
  .ip-prose a:hover { text-decoration: underline; }
  .ip-footer { border-top: 1px solid rgba(255,255,255,0.05); padding: 24px; text-align: center; }
  .ip-footer-links { display: flex; justify-content: center; gap: 24px; flex-wrap: wrap; }
  .ip-footer-links a { font-size: 13px; color: #475569; text-decoration: none; transition: color 0.15s; }
  .ip-footer-links a:hover { color: #94A3B8; }
`;