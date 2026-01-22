import Meta from '../components/Meta';

export default function Privacy() {
  return (
    <>
      <Meta
        title="Privacy Policy - TrustTerms"
        description="How TrustTerms handles your data and protects your privacy"
      />
     
      <main style={{ background: "#0f172a", minHeight: "100vh", color: "white" }}>
        <div style={{ maxWidth: 800, margin: "auto", padding: "60px 20px" }}>
          <a href="/" style={{ color: '#6366f1', fontSize: 14, textDecoration: 'none' }}>
            ← Back to TrustTerms
          </a>
         
          <h1 style={{ fontSize: 36, fontWeight: 800, marginTop: 24, marginBottom: 16 }}>
            Privacy Policy
          </h1>
         
          <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 40 }}>
            Last updated: January 23, 2025
          </p>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              1. What Data We Collect
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              <strong>Contract Text:</strong> When you submit a contract for analysis, we process it
              via OpenAI's API. <strong>Important:</strong> OpenAI retains API data for 30 days for abuse 
              monitoring purposes before permanent deletion. Your contract is never stored on our servers, 
              but is temporarily retained by OpenAI during this period. After 30 days, it is permanently deleted.
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              <strong>Payment Information:</strong> We use Stripe to process payments. We do not
              store credit card information. Stripe handles all payment data securely. We receive only:
              payment confirmation, session ID, and payment timestamp.
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              <strong>Analytics Data:</strong> With your consent, we use PostHog to collect anonymous 
              usage data (page views, button clicks, analysis completion). No personal identifiers are 
              collected. You can opt out via our cookie banner.
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              <strong>Technical Data:</strong> We collect IP addresses for rate limiting and security 
              purposes. These are stored temporarily (24 hours) in our rate limiting system.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              2. How We Use Your Data
            </h2>
            <ul style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.8, paddingLeft: 20 }}>
              <li>To provide contract analysis services via OpenAI's API</li>
              <li>To process payments securely via Stripe</li>
              <li>To improve our product based on anonymous usage patterns</li>
              <li>To prevent fraud and abuse (rate limiting, security monitoring)</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              3. Data Sharing & Third Parties
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              We share data only with:
            </p>
            <ul style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.8, paddingLeft: 20, marginTop: 12 }}>
              <li><strong>OpenAI:</strong> Contract text is sent to OpenAI's API for analysis.
              OpenAI retains this data for 30 days for abuse monitoring, then permanently deletes it.
              OpenAI does not use API data to train their models. <a href="https://openai.com/policies/api-data-usage-policies" 
              style={{ color: '#6366f1' }} target="_blank" rel="noopener noreferrer">Learn more</a></li>
              <li><strong>Stripe:</strong> Payment processing only. Stripe complies with PCI-DSS standards.</li>
              <li><strong>PostHog (EU):</strong> Anonymous analytics (only if you accept cookies). 
              All data is stored in EU servers.</li>
              <li><strong>Vercel:</strong> Hosting infrastructure (EU/global regions)</li>
              <li><strong>Upstash (Vercel KV):</strong> Temporary token storage (max 24 hours)</li>
            </ul>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              We do NOT sell, rent, or share your data with advertisers or marketing companies.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              4. Data Retention
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              <strong>Contract text:</strong> Retained by OpenAI for 30 days, then permanently deleted. 
              Not stored on our servers.
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 8 }}>
              <strong>Payment records:</strong> Stored by Stripe per their retention policy (7 years for 
              tax compliance)
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 8 }}>
              <strong>Access tokens:</strong> Automatically deleted after 24 hours
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 8 }}>
              <strong>IP addresses (rate limiting):</strong> Automatically deleted after 1 hour
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 8 }}>
              <strong>Analytics data:</strong> Retained for 12 months, then automatically deleted
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              5. Your Rights (GDPR)
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              Under GDPR, you have the right to:
            </p>
            <ul style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.8, paddingLeft: 20, marginTop: 12 }}>
              <li>Access your personal data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing</li>
              <li>Data portability</li>
              <li>Withdraw consent for cookies/analytics at any time</li>
              <li>Lodge a complaint with your local data protection authority</li>
            </ul>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              Since we don't store contract text (beyond OpenAI's 30-day retention) or require accounts, 
              there is minimal personal data to manage. For any privacy requests or to exercise your rights, 
              contact: <strong>trustterms.help@outlook.com</strong>
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              We will respond to all requests within 30 days as required by GDPR.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              6. Security
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              We implement industry-standard security measures:
            </p>
            <ul style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.8, paddingLeft: 20, marginTop: 12 }}>
              <li>All connections use HTTPS/TLS encryption</li>
              <li>Contract text is processed in memory only (never written to disk on our servers)</li>
              <li>Rate limiting to prevent abuse (10 requests/hour for paid, 3/hour for samples)</li>
              <li>One-time access tokens with 24-hour expiry</li>
              <li>Regular security audits and monitoring via Sentry</li>
              <li>Content Security Policy (CSP) headers to prevent XSS attacks</li>
              <li>Input sanitization to prevent injection attacks</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              7. Cookies & Tracking
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              We use cookies for:
            </p>
            <ul style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.8, paddingLeft: 20, marginTop: 12 }}>
              <li><strong>Essential:</strong> Cookie consent preferences (localStorage only)</li>
              <li><strong>Analytics (optional):</strong> PostHog tracking - requires your explicit consent</li>
            </ul>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              You can control cookie preferences via our cookie banner or browser settings. Declining 
              cookies will not affect core functionality.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              8. International Data Transfers
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              Your data may be processed in:
            </p>
            <ul style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.8, paddingLeft: 20, marginTop: 12 }}>
              <li><strong>EU:</strong> PostHog analytics (EU servers), Vercel hosting (EU regions)</li>
              <li><strong>USA:</strong> OpenAI API (with Standard Contractual Clauses), Stripe payments</li>
            </ul>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              All transfers comply with GDPR requirements via Standard Contractual Clauses (SCCs) 
              and adequate safeguards.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              9. Children's Privacy
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              Our service is not intended for anyone under 18 years of age. We do not knowingly 
              collect data from children.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              10. Changes to This Policy
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              We may update this policy occasionally. Material changes will be notified via email 
              (if we have your email) or a prominent notice on our website. Continued use after 
              changes constitutes acceptance.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              11. Contact & Data Controller
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              <strong>Data Controller:</strong> TrustTerms<br />
              <strong>Email:</strong> trustterms.help@outlook.com<br />
              <strong>Response time:</strong> Within 30 days for GDPR requests
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              For privacy questions, concerns, or to exercise your GDPR rights, email us at the 
              address above.
            </p>
          </section>

          <div style={{
            marginTop: 48,
            padding: 20,
            background: '#1e293b',
            borderRadius: 12,
            border: '1px solid #334155'
          }}>
            <p style={{ fontSize: 14, color: '#cbd5e1', margin: 0 }}>
              <strong>🔒 Your contracts are processed securely.</strong> We process them via OpenAI's 
              API, which retains data for 30 days before permanent deletion. We never store your 
              contracts on our servers.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}