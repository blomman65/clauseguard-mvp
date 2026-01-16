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
            Last updated: January 14, 2026
          </p>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              1. What Data We Collect
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              <strong>Contract Text:</strong> When you submit a contract for analysis, we process it 
              in memory only. Your contract text is <strong>never stored</strong> on our servers or 
              databases. It is sent to OpenAI's API for analysis and then immediately discarded.
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              <strong>Payment Information:</strong> We use Stripe to process payments. We do not 
              store credit card information. Stripe handles all payment data securely.
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              <strong>Analytics Data:</strong> We use PostHog to collect anonymous usage data 
              (page views, button clicks, analysis completion). This helps us improve the product. 
              You can opt out via our cookie banner.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              2. How We Use Your Data
            </h2>
            <ul style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.8, paddingLeft: 20 }}>
              <li>To provide contract analysis services</li>
              <li>To process payments securely</li>
              <li>To improve our product based on anonymous usage patterns</li>
              <li>To prevent fraud and abuse (rate limiting, security monitoring)</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              3. Data Sharing
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              We share data only with:
            </p>
            <ul style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.8, paddingLeft: 20, marginTop: 12 }}>
              <li><strong>OpenAI:</strong> Contract text is sent to OpenAI's API for analysis. 
              OpenAI does not use data submitted via their API to train models (per their API terms).</li>
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>PostHog:</strong> Anonymous analytics (if you accept cookies)</li>
              <li><strong>Vercel:</strong> Hosting infrastructure</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              4. Data Retention
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              <strong>Contract text:</strong> Not stored (processed in memory only)
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 8 }}>
              <strong>Payment records:</strong> Stored by Stripe per their retention policy
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 8 }}>
              <strong>Access tokens:</strong> Automatically deleted after 24 hours
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
              <li>Withdraw consent for cookies/analytics</li>
            </ul>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              Since we don't store contract text or require accounts, there is minimal personal 
              data to manage. For any privacy requests, contact: <strong>privacy@trustterms.com</strong>
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
              <li>All connections use HTTPS encryption</li>
              <li>Contract text is processed in memory only (never written to disk)</li>
              <li>Rate limiting to prevent abuse</li>
              <li>One-time access tokens (24-hour expiry)</li>
              <li>Regular security audits</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              7. Cookies
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              We use cookies for:
            </p>
            <ul style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.8, paddingLeft: 20, marginTop: 12 }}>
              <li><strong>Essential:</strong> Session management, security</li>
              <li><strong>Analytics:</strong> PostHog tracking (optional, requires consent)</li>
            </ul>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              You can control cookie preferences via our cookie banner or browser settings.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              8. Changes to This Policy
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              We may update this policy occasionally. Changes will be posted on this page with 
              an updated "Last updated" date.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              9. Contact Us
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              Questions about privacy? Email us at: <strong>trustterms.help@outlook.com</strong>
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
              <strong>🔒 Your contracts are safe.</strong> We process them in memory only. 
              No storage, no training data, no third-party access beyond OpenAI's API.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}