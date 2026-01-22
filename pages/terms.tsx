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
            Last updated: January 23, 2025
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
              <li>Analyzes contract text using AI technology (powered by OpenAI)</li>
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
              <li>May contain errors, omissions, or miss important legal issues</li>
              <li>Does not create an attorney-client relationship</li>
              <li>Should not be relied upon as a substitute for professional legal counsel</li>
            </ul>
            <p style={{ fontSize: 15, color: '#7f1d1d', lineHeight: 1.7, marginTop: 12, fontWeight: 600 }}>
              Always consult with a licensed attorney before making legal decisions or signing contracts.
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
              <li>Only analyze contracts you have the legal right to analyze</li>
              <li>Not use the service to violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              5. Payment Terms
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              <strong>Pricing:</strong> Current pricing is 149 SEK per analysis. Prices are
              in Swedish Krona (SEK) and may change with 30 days notice posted on our website.
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              <strong>Payment Processing:</strong> Payments are processed securely via Stripe.
              We do not store credit card information. All payment data is handled by Stripe in 
              compliance with PCI-DSS standards.
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              <strong>One-Time Purchase:</strong> Each payment grants access to analyze one
              contract. Access tokens expire after 24 hours from issuance.
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              <strong>Refund Policy:</strong> Due to the nature of our service (instant digital
              delivery), refunds are generally not provided. However, we offer refunds in the 
              following cases:
            </p>
            <ul style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.8, paddingLeft: 20, marginTop: 8 }}>
              <li><strong>Technical failure:</strong> If our service fails to deliver an analysis 
              due to our technical issues (not user error), we will provide a full refund or 
              reactivate your access token at no charge.</li>
              <li><strong>Duplicate payment:</strong> If you are accidentally charged twice for 
              the same analysis, we will refund the duplicate charge.</li>
              <li><strong>Service unavailable:</strong> If our service is unavailable for more 
              than 4 hours after payment, you are entitled to a full refund.</li>
            </ul>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              To request a refund, contact <strong>trustterms.help@outlook.com</strong> within 
              48 hours of payment with your Stripe session ID. Refunds are processed within 5-10 
              business days.
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              <strong>No refunds for:</strong> Change of mind, user error (e.g., uploading wrong 
              contract), dissatisfaction with AI analysis results, or after successfully receiving 
              an analysis.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              6. Intellectual Property
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              <strong>Your Content:</strong> You retain all rights to contracts you submit.
              We do not claim ownership of your contract text. By submitting content, you grant 
              us a limited license to process it solely for providing the service.
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              <strong>Our Service:</strong> TrustTerms, including all content, features, functionality,
              design, and branding, is owned by us and protected by copyright, trademark, and other 
              intellectual property laws.
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              <strong>Analysis Output:</strong> You may use the analysis results for your
              internal business purposes. You may not:
            </p>
            <ul style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.8, paddingLeft: 20, marginTop: 8 }}>
              <li>Resell or redistribute our analysis services</li>
              <li>Use our service to create a competing product</li>
              <li>Remove our branding from PDF reports</li>
              <li>Claim the analysis as your own work</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              7. Limitations of Liability
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <ul style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.8, paddingLeft: 20, marginTop: 12 }}>
              <li>TrustTerms is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, 
              express or implied</li>
              <li>We do not guarantee accuracy, completeness, reliability, or timeliness of analysis 
              results</li>
              <li>We are not liable for any direct, indirect, incidental, consequential, or punitive 
              damages arising from use of our service</li>
              <li>Our total liability is limited to the amount you paid for the specific service 
              that gave rise to the claim (149 SEK)</li>
              <li>We are not liable for decisions made based on our analysis</li>
              <li>We are not liable for losses resulting from: AI errors, service downtime, data 
              breaches, third-party services (OpenAI, Stripe), or your misuse of the service</li>
            </ul>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              Some jurisdictions do not allow limitation of liability for certain damages. In such 
              cases, our liability is limited to the maximum extent permitted by law.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              8. Data Processing & Privacy
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              <strong>Contract Data:</strong> Contracts are processed via OpenAI's API, which 
              retains data for 30 days for abuse monitoring before permanent deletion. We do not 
              store contracts on our servers.
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              <strong>Third-Party Services:</strong> We use OpenAI (analysis), Stripe (payments), 
              PostHog (analytics), and Vercel (hosting). Each has their own privacy policies.
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              See our <a href="/privacy" style={{ color: '#6366f1' }}>Privacy Policy</a> for
              complete details on data handling.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              9. Service Availability & Uptime
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              We strive for high availability but do not guarantee uninterrupted service. We may 
              suspend service for:
            </p>
            <ul style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.8, paddingLeft: 20, marginTop: 12 }}>
              <li>Scheduled maintenance (with advance notice when possible)</li>
              <li>Emergency security updates</li>
              <li>Technical issues beyond our control (e.g., OpenAI API outages)</li>
              <li>Legal compliance or abuse prevention</li>
            </ul>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              If service is unavailable for more than 4 hours after your payment, you may request 
              a refund or token reactivation.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              10. Rate Limits & Fair Use
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              To ensure service quality and prevent abuse, we implement rate limits:
            </p>
            <ul style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.8, paddingLeft: 20, marginTop: 12 }}>
              <li>Sample analyses: 3 per hour per IP address</li>
              <li>Paid analyses: 10 per hour per IP address</li>
              <li>Payment verification: 20 per hour per IP address</li>
            </ul>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              Abuse of the service (e.g., automated scraping, API reverse engineering, excessive 
              requests) may result in temporary or permanent blocking without refund.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              11. Termination
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              We reserve the right to refuse service or terminate access to anyone who:
            </p>
            <ul style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.8, paddingLeft: 20, marginTop: 12 }}>
              <li>Violates these terms</li>
              <li>Engages in abusive or fraudulent behavior</li>
              <li>Attempts to compromise security or reverse engineer our service</li>
              <li>Uses the service for illegal purposes</li>
            </ul>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              Termination does not entitle you to a refund for completed services.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              12. Indemnification
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              You agree to indemnify and hold harmless TrustTerms from any claims, damages, or 
              expenses arising from:
            </p>
            <ul style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.8, paddingLeft: 20, marginTop: 12 }}>
              <li>Your use of the service</li>
              <li>Your violation of these terms</li>
              <li>Your violation of any laws or third-party rights</li>
              <li>Content you submit to the service</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              13. Changes to Terms
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              We may update these terms at any time. Material changes will be posted on this page 
              with an updated "Last updated" date. Continued use of the service after changes 
              constitutes acceptance of new terms.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              14. Governing Law & Dispute Resolution
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              These terms are governed by the laws of Sweden, without regard to conflict of law 
              provisions. Any disputes shall be resolved in Swedish courts.
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              For EU consumers: Nothing in these terms affects your statutory rights under EU law.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              15. Contact & Company Information
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              <strong>Service Name:</strong> TrustTerms<br />
              <strong>Website:</strong> trustterms.vercel.app<br />
              <strong>Support Email:</strong> trustterms.help@outlook.com<br />
              <strong>Response Time:</strong> Within 48 hours for support requests
            </p>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginTop: 12 }}>
              For questions about these terms, refund requests, or technical support, 
              contact us at the email above.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              16. Severability
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              If any provision of these terms is found to be unenforceable, the remaining 
              provisions will continue in full force and effect.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              17. Entire Agreement
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7 }}>
              These terms, together with our Privacy Policy, constitute the entire agreement 
              between you and TrustTerms regarding use of the service.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}