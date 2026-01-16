import Meta from '../components/Meta';

export default function Terms() {
  return (
    <>
      <Meta 
        title="Terms of Service - TrustTerms"
        description="Terms and conditions for using TrustTerms"
      />
      
      <main style={{ background: "#0f172a", minHeight: "100vh", color: "white" }}>
        <div style={{ maxWidth: 800, margin: "auto", padding: "60px 20px" }}>
          <a href="/" style={{ color: '#6366f1', fontSize: 14, textDecoration: 'none' }}>
            ← Back to TrustTerms
          </a>
          
          <h1 style={{ fontSize: 36, fontWeight: 800, marginTop: 24, marginBottom: 16 }}>
            Terms of Service
          </h1>
          
          <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 40 }}>
            Last updated: January 14, 2026
          </p>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              1. Agreement to Terms
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              By accessing TrustTerms (trustterms.vercel.app), you agree to these Terms of Service. 
              If you disagree with any part of these terms, please do not use our service.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              2. Description of Service
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              TrustTerms provides AI-powered contract risk analysis for SaaS and commercial 
              agreements. The service:
            </p>
            <ul style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.8, paddingLeft: 20, marginTop: 12 }}>
              <li>Analyzes contract text using AI technology</li>
              <li>Identifies potential risks and non-standard clauses</li>
              <li>Provides recommendations for negotiation</li>
              <li>Generates PDF reports of analysis results</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32, background: '#fee2e2', padding: 20, borderRadius: 12 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: '#991b1b' }}>
              3. Not Legal Advice
            </h2>
            <p style={{ fontSize: 15, color: '#7f1d1d', lineHeight: 1.7, fontWeight: 600 }}>
              IMPORTANT: TrustTerms provides general information only and does NOT constitute 
              legal advice. Our AI analysis:
            </p>
            <ul style={{ fontSize: 15, color: '#7f1d1d', lineHeight: 1.8, paddingLeft: 20, marginTop: 12 }}>
              <li>Is for informational purposes only</li>
              <li>Should not replace consultation with a qualified lawyer</li>
              <li>May contain errors or miss important legal issues</li>
              <li>Does not create an attorney-client relationship</li>
            </ul>
            <p style={{ fontSize: 15, color: '#7f1d1d', lineHeight: 1.7, marginTop: 12, fontWeight: 600 }}>
              Always consult with a licensed attorney before making legal decisions.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              4. User Responsibilities
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              You agree to:
            </p>
            <ul style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.8, paddingLeft: 20, marginTop: 12 }}>
              <li>Provide accurate information</li>
              <li>Use the service only for lawful purposes</li>
              <li>Not attempt to circumvent payment requirements</li>
              <li>Not abuse rate limits or attempt to overload the service</li>
              <li>Not submit malicious content or attempt security breaches</li>
              <li>Not use the service to analyze contracts without proper authorization</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              5. Payment Terms
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              <strong>Pricing:</strong> Current pricing is displayed on our website. Prices are 
              in Swedish Krona (SEK) and may change with notice.
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              <strong>Payment Processing:</strong> Payments are processed securely via Stripe. 
              We do not store credit card information.
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              <strong>One-Time Purchase:</strong> Each payment grants access to analyze one 
              contract. Access tokens expire after 24 hours.
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              <strong>No Refunds:</strong> Due to the nature of our service (instant digital 
              delivery), all sales are final. No refunds are provided after analysis is completed.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              6. Intellectual Property
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              <strong>Your Content:</strong> You retain all rights to contracts you submit. 
              We do not claim ownership of your contract text.
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              <strong>Our Service:</strong> TrustTerms, including all content, features, and 
              functionality, is owned by us and protected by copyright and other intellectual 
              property laws.
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              <strong>Analysis Output:</strong> You may use the analysis results for your 
              internal business purposes. You may not resell or redistribute our analysis services.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              7. Limitations of Liability
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <ul style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.8, paddingLeft: 20, marginTop: 12 }}>
              <li>TrustTerms is provided "AS IS" without warranties of any kind</li>
              <li>We do not guarantee accuracy, completeness, or reliability of analysis results</li>
              <li>We are not liable for any damages arising from use of our service</li>
              <li>Our total liability is limited to the amount you paid for the service</li>
              <li>We are not liable for decisions made based on our analysis</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              8. Data Processing & Privacy
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              <strong>Contract Data:</strong> Contracts are processed in memory only and 
              never stored on our servers.
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              <strong>Third-Party Services:</strong> Contract text is sent to OpenAI's API 
              for analysis. OpenAI does not use API data to train models.
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              See our <a href="/privacy" style={{ color: '#6366f1' }}>Privacy Policy</a> for 
              complete details.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              9. Service Availability
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              We strive for high availability but do not guarantee uninterrupted service. 
              We may suspend service for maintenance or other reasons without liability.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              10. Rate Limits & Fair Use
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              To ensure service quality, we implement rate limits:
            </p>
            <ul style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.8, paddingLeft: 20, marginTop: 12 }}>
              <li>Sample analyses: 3 per hour per IP address</li>
              <li>Paid analyses: 10 per hour per IP address</li>
            </ul>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              Abuse of the service may result in temporary or permanent blocking.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              11. Termination
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              We reserve the right to refuse service or terminate access to anyone who 
              violates these terms or engages in abusive behavior.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              12. Changes to Terms
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              We may update these terms at any time. Continued use of the service after 
              changes constitutes acceptance of new terms.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              13. Governing Law
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              These terms are governed by the laws of Sweden. Disputes shall be resolved 
              in Swedish courts.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              14. Contact
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              Questions about these terms? Contact: <strong>trustterms.help@outlook.com</strong>
            </p>
          </section>
        </div>
      </main>
    </>
  );
}