import Meta from '../components/Meta';

export default function About() {
  return (
    <>
      <Meta
        title="About - TrustTerms"
        description="Learn about TrustTerms and who's behind the service"
      />
      
      <main style={{ background: "#0f172a", minHeight: "100vh", color: "white" }}>
        <div style={{ maxWidth: 800, margin: "auto", padding: "60px 20px" }}>
          <a href="/" style={{ color: '#6366f1', fontSize: 14, textDecoration: 'none' }}>
            ← Back to TrustTerms
          </a>
          
          <h1 style={{ fontSize: 36, fontWeight: 800, marginTop: 24, marginBottom: 16 }}>
            About TrustTerms
          </h1>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: '#f8fafc' }}>
              Our Mission
            </h2>
            <p style={{ fontSize: 16, color: '#cbd5e1', lineHeight: 1.7, marginBottom: 16 }}>
              Legal protection shouldn't only be accessible to those who can afford expensive lawyers. 
              We built TrustTerms to democratize contract analysis and help startups, small businesses, 
              and individuals spot risks before they sign.
            </p>
            <p style={{ fontSize: 16, color: '#cbd5e1', lineHeight: 1.7 }}>
              Our AI-powered analysis gives you the insights you need to negotiate better deals 
              and avoid costly mistakes—all in under 60 seconds.
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: '#f8fafc' }}>
              How It Works
            </h2>
            <div style={{ display: 'grid', gap: 20 }}>
              {[
                {
                  num: "1",
                  title: "Paste Your Contract",
                  desc: "Copy your SaaS agreement or commercial contract into our secure analysis tool"
                },
                {
                  num: "2", 
                  title: "AI Analysis",
                  desc: "Our GPT-4 powered system scans for hidden risks, unfavorable terms, and non-standard clauses"
                },
                {
                  num: "3",
                  title: "Get Actionable Insights",
                  desc: "Receive a detailed report with specific negotiation strategies and risk assessments"
                }
              ].map((step, i) => (
                <div key={i} style={{
                  padding: 24,
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: 12,
                  display: 'flex',
                  gap: 20,
                  alignItems: 'start'
                }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    fontWeight: 800,
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                  }}>
                    {step.num}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#f1f5f9' }}>
                      {step.title}
                    </h3>
                    <p style={{ fontSize: 15, color: '#cbd5e1', margin: 0, lineHeight: 1.6 }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: '#f8fafc' }}>
              Privacy & Security First
            </h2>
            <div style={{
              padding: 24,
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: 12
            }}>
              <ul style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
                <li><strong>Never stored:</strong> Your contracts are never saved on our servers</li>
                <li><strong>Encrypted processing:</strong> All data is transmitted via HTTPS/TLS</li>
                <li><strong>30-day retention by OpenAI:</strong> API data is deleted after abuse monitoring</li>
                <li><strong>GDPR compliant:</strong> Full transparency on data handling</li>
                <li><strong>No account required:</strong> Use the service without creating an account</li>
              </ul>
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: '#f8fafc' }}>
              Company Information
            </h2>
            <div style={{
              padding: 24,
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: 12
            }}>
              <p style={{ fontSize: 16, color: '#cbd5e1', lineHeight: 1.7, margin: '0 0 12px' }}>
                <strong style={{ color: '#f1f5f9' }}>Business Name:</strong> TrustTerms<br />
                <strong style={{ color: '#f1f5f9' }}>Legal Entity:</strong> Enskild Firma (Sole Proprietorship)<br />
                <strong style={{ color: '#f1f5f9' }}>Organization Number:</strong> [Lägg till efter registrering]<br />
                <strong style={{ color: '#f1f5f9' }}>VAT Number:</strong> [Lägg till om momsregistrerad]<br />
                <strong style={{ color: '#f1f5f9' }}>Contact Email:</strong>{' '}
                <a href="mailto:trustterms.help@outlook.com" style={{ color: '#818cf8' }}>
                  trustterms.help@outlook.com
                </a>
              </p>
              <p style={{ fontSize: 14, color: '#94a3b8', margin: '16px 0 0', lineHeight: 1.6 }}>
                For official company records, see{' '}
                <a 
                  href="https://www.bolagsverket.se" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#818cf8' }}
                >
                  Bolagsverket
                </a>
                {' '}(Swedish Companies Registration Office)
              </p>
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: '#f8fafc' }}>
              Technology & Partners
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginBottom: 16 }}>
              TrustTerms is built with cutting-edge technology to ensure accuracy, speed, and security:
            </p>
            <div style={{ display: 'grid', gap: 12 }}>
              {[
                { name: "OpenAI GPT-4", use: "Contract analysis engine" },
                { name: "Stripe", use: "Secure payment processing" },
                { name: "Vercel", use: "Hosting & infrastructure" },
                { name: "PostHog", use: "Privacy-focused analytics (EU servers)" },
                { name: "Sentry", use: "Error monitoring & reliability" }
              ].map((tech, i) => (
                <div key={i} style={{
                  padding: 16,
                  background: 'rgba(30, 41, 59, 0.3)',
                  border: '1px solid rgba(148, 163, 184, 0.15)',
                  borderRadius: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>
                    {tech.name}
                  </span>
                  <span style={{ fontSize: 14, color: '#94a3b8' }}>
                    {tech.use}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section style={{
            padding: 32,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '2px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 16,
            marginBottom: 48
          }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: '#fca5a5' }}>
              ⚠️ Important Legal Disclaimer
            </h2>
            <p style={{ fontSize: 15, color: '#fecaca', lineHeight: 1.7, margin: 0 }}>
              TrustTerms provides general information only and <strong>does NOT constitute legal advice</strong>. 
              Our AI analysis may contain errors, omissions, or miss important legal nuances. Always consult 
              a qualified lawyer before making legal decisions or signing contracts. We are not a law firm 
              and do not create an attorney-client relationship.
            </p>
          </section>

          <div style={{
            paddingTop: 32,
            borderTop: '1px solid rgba(148, 163, 184, 0.2)',
            display: 'flex',
            gap: 24,
            flexWrap: 'wrap'
          }}>
            <a href="/privacy" style={{ color: '#818cf8', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              Privacy Policy
            </a>
            <a href="/terms" style={{ color: '#818cf8', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              Terms of Service
            </a>
            <a href="/contact" style={{ color: '#818cf8', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              Contact & Support
            </a>
            <a href="/" style={{ color: '#818cf8', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              Back to Home
            </a>
          </div>
        </div>
      </main>
    </>
  );
}