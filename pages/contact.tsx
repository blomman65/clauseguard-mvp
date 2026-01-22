import Meta from '../components/Meta';

export default function Contact() {
  const helpItems = [
    {
      icon: '🔧',
      title: 'Technical Issues',
      desc: 'Analysis failed, payment problems, PDF download issues, or any technical errors'
    },
    {
      icon: '💰',
      title: 'Billing & Refunds',
      desc: 'Refund requests, duplicate charges, or payment questions'
    },
    {
      icon: '❓',
      title: 'General Questions',
      desc: 'How the service works, pricing, data privacy, or usage questions'
    },
    {
      icon: '🐛',
      title: 'Bug Reports',
      desc: 'Found a bug? Let us know so we can fix it'
    },
    {
      icon: '💡',
      title: 'Feature Requests',
      desc: 'Have ideas for improving TrustTerms? We\'d love to hear them'
    },
    {
      icon: '🔒',
      title: 'Privacy & GDPR',
      desc: 'Data deletion requests, privacy concerns, or GDPR-related inquiries'
    }
  ];

  return (
    <>
      <Meta
        title="Contact & Support - TrustTerms"
        description="Get help with TrustTerms or contact our support team"
      />
     
      <main style={{ background: "#0f172a", minHeight: "100vh", color: "white" }}>
        <div style={{ maxWidth: 800, margin: "auto", padding: "60px 20px" }}>
          <a href="/" style={{ color: '#6366f1', fontSize: 14, textDecoration: 'none' }}>
            ← Back to TrustTerms
          </a>
         
          <h1 style={{ fontSize: 36, fontWeight: 800, marginTop: 24, marginBottom: 16 }}>
            Contact & Support
          </h1>
         
          <p style={{ fontSize: 16, color: '#cbd5e1', marginBottom: 48, lineHeight: 1.7 }}>
            We&apos;re here to help! Get in touch with any questions, issues, or feedback.
          </p>

          <section style={{ 
            marginBottom: 48, 
            padding: 32, 
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 16
          }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: '#f8fafc' }}>
              📧 Email Support
            </h2>
            <p style={{ fontSize: 17, color: '#cbd5e1', marginBottom: 12, lineHeight: 1.7 }}>
              <strong>Email:</strong>{' '}
              <a 
                href="mailto:trustterms.help@outlook.com" 
                style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}
              >
                trustterms.help@outlook.com
              </a>
            </p>
            <p style={{ fontSize: 15, color: '#94a3b8', margin: 0 }}>
              We respond to all inquiries within 48 hours (usually much faster).
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: '#f8fafc' }}>
              What We Can Help With
            </h2>
            
            <div style={{ display: 'grid', gap: 16 }}>
              {helpItems.map((item, i) => (
                <div key={i} style={{
                  padding: 24,
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: 12,
                  display: 'flex',
                  gap: 16,
                  alignItems: 'start'
                }}>
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, color: '#f1f5f9' }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: 15, color: '#cbd5e1', margin: 0, lineHeight: 1.6 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: '#f8fafc' }}>
              Quick Answers
            </h2>
            
            <div style={{
              padding: 24,
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: 12
            }}>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#f1f5f9' }}>
                  How do I get a refund?
                </h3>
                <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                  Email us at trustterms.help@outlook.com with your Stripe session ID within 48 hours. 
                  Refunds are provided for technical failures, duplicate payments, or service unavailability. 
                  See our <a href="/terms" style={{ color: '#818cf8' }}>Terms of Service</a> for details.
                </p>
              </div>

              <div style={{ marginBottom: 20, paddingTop: 20, borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#f1f5f9' }}>
                  The analysis failed. What should I do?
                </h3>
                <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                  Email us immediately with details of the error. We&apos;ll either reactivate your access 
                  token or provide a full refund. Technical failures on our end are always refunded.
                </p>
              </div>

              <div style={{ marginBottom: 20, paddingTop: 20, borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#f1f5f9' }}>
                  How do I delete my data?
                </h3>
                <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                  We don&apos;t store your contract text on our servers. It&apos;s processed via OpenAI&apos;s API, 
                  which retains data for 30 days before permanent deletion. For analytics data deletion, 
                  email us. See our <a href="/privacy" style={{ color: '#818cf8' }}>Privacy Policy</a>.
                </p>
              </div>

              <div style={{ paddingTop: 20, borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#f1f5f9' }}>
                  Can I get a receipt or invoice?
                </h3>
                <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                  Yes! Check your email for the Stripe receipt, or contact us and we&apos;ll send you one.
                </p>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: '#f8fafc' }}>
              Response Times
            </h2>
            
            <div style={{
              padding: 24,
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: 12
            }}>
              <ul style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
                <li><strong>Technical issues & refunds:</strong> Within 24 hours</li>
                <li><strong>General questions:</strong> Within 48 hours</li>
                <li><strong>GDPR requests:</strong> Within 30 days (as required by law)</li>
              </ul>
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: '#f8fafc' }}>
              About TrustTerms
            </h2>
            
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginBottom: 16 }}>
              TrustTerms is an AI-powered contract analysis tool designed to help startups and 
              small businesses identify risks in SaaS and commercial agreements before signing.
            </p>
            
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginBottom: 16 }}>
              We built this tool because we believe legal protection shouldn&apos;t only be accessible 
              to those who can afford expensive lawyers. Our AI analysis gives you the insights 
              you need to negotiate better deals and avoid costly mistakes.
            </p>
            
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginBottom: 0 }}>
              <strong>Privacy-first:</strong> We never store your contracts on our servers. 
              Your data is processed securely via OpenAI's API, which retains it for 30 days 
              for abuse monitoring before permanent deletion.
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
            <a href="/" style={{ color: '#818cf8', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              Back to Home
            </a>
          </div>
        </div>
      </main>
    </>
  );
}