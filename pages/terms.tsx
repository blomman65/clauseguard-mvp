import Meta from '../components/Meta';

export default function Terms() {
  return (
    <>
      <Meta
        title="Terms of Service - TrustTerms"
        description="Terms and conditions for using TrustTerms"
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
            <div className="tag">Legal</div>
            <h1 className="page-title">Terms of Service</h1>
            <p className="meta-date">Last updated: January 26, 2025</p>
          </div>

          <div className="prose">

            <h2>1. Agreement to Terms</h2>
            <p>By accessing TrustTerms (trustterms.vercel.app), you agree to these Terms of Service. If you disagree with any part of these terms, please do not use our service.</p>

            <h2>2. Description of Service</h2>
            <p>TrustTerms provides AI-powered contract risk analysis for SaaS and commercial agreements. The service:</p>
            <ul>
              <li>Analyzes contract text using AI technology (powered by OpenAI GPT-4)</li>
              <li>Identifies potential risks and non-standard clauses</li>
              <li>Provides recommendations for negotiation</li>
              <li>Generates PDF reports of analysis results</li>
            </ul>

            <div className="highlight-block">
              <h2>3. Not Legal Advice</h2>
              <p><strong>IMPORTANT:</strong> TrustTerms provides general information only and does NOT constitute legal advice. Our AI analysis:</p>
              <ul>
                <li>Is for informational purposes only</li>
                <li>Should not replace consultation with a qualified lawyer</li>
                <li>May contain errors, omissions, or miss important legal issues</li>
                <li>Does not create an attorney-client relationship</li>
                <li>Should not be relied upon as a substitute for professional legal counsel</li>
              </ul>
              <p><strong>Always consult with a licensed attorney before making legal decisions or signing contracts.</strong></p>
            </div>

            <h2>4. User Responsibilities</h2>
            <p>You agree to:</p>
            <ul>
              <li>Provide accurate information</li>
              <li>Use the service only for lawful purposes</li>
              <li>Not attempt to circumvent payment requirements</li>
              <li>Not abuse rate limits or attempt to overload the service</li>
              <li>Not submit malicious content or attempt security breaches</li>
              <li>Only analyze contracts you have the legal right to analyze</li>
              <li>Not reverse engineer or attempt to extract our AI prompts or system design</li>
            </ul>

            <h2>5. Payment Terms</h2>
            <p><strong>Pricing:</strong> 149 SEK per analysis. Prices may change with 30 days notice.</p>
            <p><strong>Payment Processing:</strong> Via Stripe. We do not store credit card information. PCI-DSS compliant.</p>
            <p><strong>One-Time Purchase:</strong> Each payment grants access to analyze one contract. Access tokens expire after 24 hours.</p>
            <p><strong>Refund Policy:</strong> Refunds are provided in the following cases:</p>
            <ul>
              <li><strong>Technical failure:</strong> If our service fails to deliver an analysis due to our technical issues, we provide a full refund or reactivate your access token.</li>
              <li><strong>Duplicate payment:</strong> If accidentally charged twice, we refund the duplicate charge.</li>
              <li><strong>Service unavailable:</strong> If unavailable for more than 4 hours after payment, you are entitled to a full refund.</li>
            </ul>
            <p>To request a refund, contact <strong>trustterms.help@outlook.com</strong> within 48 hours of payment with your Stripe session ID. Processed within 5–10 business days.</p>
            <p><strong>No refunds for:</strong> Change of mind, user error, dissatisfaction with AI results, or after successfully receiving an analysis.</p>

            <h2>6. Intellectual Property</h2>
            <p><strong>Your Content:</strong> You retain all rights to contracts you submit. We do not claim ownership of your contract text.</p>
            <p><strong>Our Service:</strong> TrustTerms, including all content, features, functionality, and branding, is owned by us and protected by intellectual property laws.</p>
            <p><strong>Analysis Output:</strong> You may use the analysis results for internal business purposes. You may not resell, redistribute, or use our service to create a competing product.</p>

            <h2>7. Limitations of Liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
            <ul>
              <li>TrustTerms is provided "AS IS" without warranties of any kind</li>
              <li>We do not guarantee accuracy, completeness, or reliability of analysis results</li>
              <li>We are not liable for any indirect, incidental, or consequential damages</li>
              <li>Our total liability is limited to the amount you paid (149 SEK)</li>
              <li>We are not liable for decisions made based on our analysis</li>
            </ul>

            <h2>8. Data Processing &amp; Privacy</h2>
            <p>Contracts are processed via OpenAI's API and retained for 30 days before permanent deletion. We do not store contracts on our servers. See our <a href="/privacy">Privacy Policy</a> for complete details.</p>

            <h2>9. Service Availability &amp; Uptime</h2>
            <p>We strive for high availability but do not guarantee uninterrupted service. If service is unavailable for more than 4 hours after your payment, you may request a refund or token reactivation.</p>

            <h2>10. Rate Limits &amp; Fair Use</h2>
            <ul>
              <li>Sample analyses: 3 per hour per IP address</li>
              <li>Paid analyses: 10 per hour per IP address</li>
              <li>Payment verification: 20 per hour per IP address</li>
            </ul>
            <p>Abuse of the service may result in temporary or permanent blocking without refund.</p>

            <h2>11. Termination</h2>
            <p>We reserve the right to refuse service or terminate access to anyone who violates these terms, engages in abusive or fraudulent behavior, or uses the service for illegal purposes.</p>

            <h2>12. Force Majeure</h2>
            <p>We are not liable for failures due to circumstances beyond our reasonable control, including OpenAI API outages, natural disasters, war, internet infrastructure failures, or pandemics.</p>

            <h2>13. Indemnification</h2>
            <p>You agree to indemnify and hold harmless TrustTerms from any claims arising from your use of the service, your violation of these terms, or content you submit.</p>

            <h2>14. Changes to Terms</h2>
            <p>We may update these terms at any time. Material changes will be posted on this page with an updated "Last updated" date. Continued use constitutes acceptance.</p>

            <h2>15. Governing Law &amp; Dispute Resolution</h2>
            <p>These terms are governed by the laws of Sweden. Any disputes shall be resolved in Swedish courts. EU consumers retain their statutory rights under EU consumer protection laws.</p>

            <h2>16. Contact &amp; Company Information</h2>
            <p><strong>Service Name:</strong> TrustTerms<br/>
            <strong>Legal Entity:</strong> Enskild Firma (Sole Proprietorship)<br/>
            <strong>Website:</strong> trustterms.vercel.app<br/>
            <strong>Support Email:</strong> trustterms.help@outlook.com<br/>
            <strong>Response Time:</strong> Within 48 hours for support requests</p>

            <h2>17. Severability</h2>
            <p>If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full force and effect.</p>

            <h2>18. Entire Agreement</h2>
            <p>These terms, together with our Privacy Policy, constitute the entire agreement between you and TrustTerms regarding use of the service.</p>

          </div>
        </main>

        <footer className="footer">
          <div className="footer-links">
            <a href="/about">About</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/contact">Contact</a>
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
          font-size: 15px; line-height: 1.6; -webkit-font-smoothing: antialiased;
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
          display: inline-block; font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
          color: #60A5FA; background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.18);
          padding: 4px 10px; border-radius: 5px; margin-bottom: 14px;
        }
        .page-title {
          font-family: 'Sora', system-ui, sans-serif;
          font-size: clamp(26px, 4vw, 34px); font-weight: 800;
          color: #F1F5F9; letter-spacing: -0.04em; line-height: 1.1; margin-bottom: 10px;
        }
        .meta-date { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #475569; }

        /* PROSE */
        .prose h2 {
          font-family: 'Sora', system-ui, sans-serif;
          font-size: 14px; font-weight: 700; color: #E2E8F0;
          margin: 36px 0 12px; padding-bottom: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .prose h2:first-child { margin-top: 0; }
        .prose p { font-size: 14px; color: #94A3B8; line-height: 1.75; margin-bottom: 12px; }
        .prose ul {
          list-style: none; padding-left: 0; margin-bottom: 12px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .prose li {
          font-size: 14px; color: #94A3B8; line-height: 1.65;
          padding-left: 22px; position: relative;
        }
        .prose li::before { content: '—'; position: absolute; left: 0; color: #3B82F6; font-weight: 700; }
        .prose strong { color: #CBD5E1; font-weight: 600; }
        .prose a { color: #60A5FA; text-decoration: none; }
        .prose a:hover { text-decoration: underline; }

        /* HIGHLIGHT BLOCK — Section 3 */
        .highlight-block {
          background: rgba(239,68,68,0.05);
          border: 1px solid rgba(239,68,68,0.15);
          border-radius: 12px; padding: 20px 22px;
          margin: 28px 0;
        }
        .highlight-block h2 {
          color: #FCA5A5 !important;
          border-bottom-color: rgba(239,68,68,0.1) !important;
          margin-top: 0 !important;
        }
        .highlight-block p,
        .highlight-block li { color: #FDA4AF !important; }
        .highlight-block li::before { color: #ef4444 !important; }
        .highlight-block strong { color: #FECACA !important; }

        .footer { border-top: 1px solid rgba(255,255,255,0.05); padding: 24px; text-align: center; }
        .footer-links { display: flex; justify-content: center; gap: 24px; flex-wrap: wrap; }
        .footer-links a { font-size: 13px; color: #475569; text-decoration: none; transition: color 0.15s; }
        .footer-links a:hover { color: #94A3B8; }
      `}</style>
    </>
  );
}