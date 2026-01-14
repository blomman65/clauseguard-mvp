import { useEffect, useState } from "react";
import { analytics } from "../lib/analytics";
import Meta from "../components/Meta";

const MAX_CONTRACT_LENGTH = 50000;

export default function Home() {
  const [contractText, setContractText] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSample, setIsSample] = useState(false);
  const [riskLevel, setRiskLevel] = useState<"LOW" | "MEDIUM" | "HIGH" | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");

  const sampleContract = `This Agreement shall automatically renew for successive 12-month terms unless either party provides written notice at least 90 days prior to the end of the current term. The Vendor may modify pricing and terms upon renewal with 30 days notice. Liability is capped at fees paid in the last three (3) months. The Vendor may terminate this Agreement for convenience upon 30 days written notice.`;

  const loadingMessages = [
    "Scanning for auto-renewal clauses...",
    "Checking liability caps...",
    "Analyzing termination rights...",
    "Reviewing pricing terms...",
    "Identifying non-standard clauses...",
  ];

  useEffect(() => {
    analytics.conversionFunnelStep("landed");
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      setAccessToken(token);
      analytics.paymentCompleted();
      analytics.conversionFunnelStep("completed_payment");
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  useEffect(() => {
    if (loading) {
      let index = 0;
      const interval = setInterval(() => {
        setLoadingMessage(loadingMessages[index % loadingMessages.length]);
        index++;
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const pay = async () => {
    setError(null);
    analytics.checkoutStarted();
    analytics.conversionFunnelStep("clicked_pay");
    const res = await fetch("/api/create-checkout-session", { method: "POST" });
    const data = await res.json();
    window.location.href = data.url;
  };

  const extractRiskLevel = (text: string) => {
    const firstLines = text.slice(0, 200).toUpperCase();
    if (firstLines.includes("HIGH")) return "HIGH";
    if (firstLines.includes("MEDIUM")) return "MEDIUM";
    if (firstLines.includes("LOW")) return "LOW";
    return null;
  };

  const analyze = async () => {
    const startTime = Date.now();
    
    setLoading(true);
    setError(null);
    setAnalysis("");
    setRiskLevel(null);
    setLoadingMessage(loadingMessages[0]);

    if (!accessToken && !isSample) {
      setError("You need to pay before analyzing your own contract.");
      setLoading(false);
      return;
    }

    analytics.analysisStarted(isSample, contractText.length);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractText, accessToken, isSample }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Analysis failed");
        analytics.analysisFailed(data.error || "Unknown error", isSample);
        setLoading(false);
        return;
      }

      const risk = extractRiskLevel(data.analysis);
      setRiskLevel(risk);
      setAnalysis(data.analysis);

      const timeElapsed = Date.now() - startTime;
      analytics.analysisCompleted(isSample, risk || "UNKNOWN", timeElapsed);

      if (isSample) {
        analytics.sampleAnalyzed(risk || "UNKNOWN");
        analytics.conversionFunnelStep("viewed_sample");
      } else {
        analytics.conversionFunnelStep("analyzed_own");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      analytics.analysisFailed("Network error", isSample);
    }

    setLoading(false);
  };

  const downloadPdf = async () => {
    analytics.pdfDownloaded(riskLevel || "UNKNOWN");
    
    const res = await fetch("/api/export-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysis, riskLevel }),
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "TrustTerms_Contract_Analysis.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleSampleClick = () => {
    analytics.sampleClicked();
    setContractText(sampleContract);
    setIsSample(true);
  };

  const charCount = contractText.length;
  const isOverLimit = charCount > MAX_CONTRACT_LENGTH;

  return (
    <>
      <Meta />
      <main style={{ background: "#0f172a", minHeight: "100vh", color: "white" }}>
        <div style={{ maxWidth: 720, margin: "auto", padding: "60px 20px" }}>
          <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 12 }}>
            TrustTerms
          </h1>

          <p style={{ fontSize: 18, color: "#cbd5f5", marginBottom: 24 }}>
            TrustTerms analyzes SaaS and commercial contracts using AI and highlights
            financial risk, hidden clauses, and what you should renegotiate.
            Built for founders, CFOs, and operators.
          </p>

          <div style={{ marginBottom: 48 }}>
            <p style={{ fontSize: 14, color: "#a5b4fc", marginBottom: 12 }}>
              Used by early-stage founders and operators to sanity-check contracts
              before legal review.
            </p>

            <div style={{ background: "#020617", borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>
                Most contract risk is invisible until it's too late
              </h2>

              <ul style={{ fontSize: 15, lineHeight: 1.7, color: "#cbd5f5", paddingLeft: 20 }}>
                <li>Auto-renewals that quietly lock you in</li>
                <li>Liability caps that don't match your exposure</li>
                <li>Termination clauses favoring the vendor</li>
                <li>Pricing terms that increase costs over time</li>
              </ul>

              <p style={{ marginTop: 16, fontSize: 14, color: "#e5e7eb" }}>
                TrustTerms scans your agreement and explains the real risk in plain
                language — so you know what to negotiate before signing.
              </p>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              How it works
            </h3>

            <ol style={{ fontSize: 14, color: "#cbd5f5", paddingLeft: 20, lineHeight: 1.6 }}>
              <li>Paste your contract</li>
              <li>Get an instant risk analysis</li>
              <li>See what to renegotiate before signing</li>
            </ol>

            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
              No account required. One-time analysis. Takes under 60 seconds.
            </p>
          </div>

          <button
            onClick={handleSampleClick}
            style={{
              marginBottom: 12,
              fontSize: 14,
              color: "#a5b4fc",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Try a sample SaaS agreement (free)
          </button>

          <textarea
            placeholder="Paste your agreement here..."
            value={contractText}
            onChange={(e) => {
              setContractText(e.target.value);
              setIsSample(false);
            }}
            style={{
              width: "100%",
              height: 220,
              padding: 16,
              borderRadius: 12,
              border: isOverLimit ? "2px solid #ef4444" : "none",
              fontSize: 15,
              color: "#0f172a",
              marginBottom: 8,
            }}
          />

          <div style={{
            fontSize: 12,
            color: isOverLimit ? "#ef4444" : "#94a3b8",
            marginBottom: 20,
            textAlign: "right",
          }}>
            {charCount.toLocaleString()} / {MAX_CONTRACT_LENGTH.toLocaleString()} characters
            {isOverLimit && " - Contract too long"}
          </div>

          {!accessToken && !isSample ? (
            <button
              onClick={pay}
              disabled={isOverLimit || charCount < 50}
              style={{
                width: "100%",
                padding: 16,
                fontSize: 18,
                fontWeight: 700,
                borderRadius: 12,
                background: (isOverLimit || charCount < 50) ? "#334155" : "#6366f1",
                color: "white",
                border: "none",
                cursor: (isOverLimit || charCount < 50) ? "not-allowed" : "pointer",
                opacity: (isOverLimit || charCount < 50) ? 0.5 : 1,
              }}
            >
              Pay 349 kr to analyze your own contract
            </button>
          ) : (
            <button
              onClick={analyze}
              disabled={loading || isOverLimit || charCount < 50}
              style={{
                width: "100%",
                padding: 16,
                fontSize: 18,
                fontWeight: 700,
                borderRadius: 12,
                background: (loading || isOverLimit || charCount < 50) ? "#334155" : "#22c55e",
                color: "white",
                border: "none",
                cursor: (loading || isOverLimit || charCount < 50) ? "not-allowed" : "pointer",
                opacity: (loading || isOverLimit || charCount < 50) ? 0.7 : 1,
              }}
            >
              {loading ? "Analyzing…" : "Analyze agreement"}
            </button>
          )}

          {loading && (
            <div style={{
              marginTop: 20,
              padding: 24,
              background: "#1e293b",
              borderRadius: 12,
              textAlign: "center",
            }}>
              <div style={{
                display: "inline-block",
                width: 40,
                height: 40,
                border: "4px solid #334155",
                borderTopColor: "#6366f1",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }} />
              <p style={{ marginTop: 12, fontSize: 14, color: "#cbd5e1" }}>
                Analyzing {isSample ? "sample" : "your"} contract...
              </p>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                {loadingMessage}
              </p>
            </div>
          )}

          {error && (
            <p style={{ marginTop: 24, color: "#f87171", fontSize: 14 }}>
              {error}
            </p>
          )}

          {analysis && (
            <div style={{
              marginTop: 40,
              background: "#020617",
              padding: 24,
              borderRadius: 12,
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
              fontSize: 15,
            }}>
              {riskLevel && (
                <div style={{
                  display: "inline-block",
                  marginBottom: 16,
                  padding: "6px 12px",
                  borderRadius: 999,
                  background:
                    riskLevel === "HIGH" ? "#ef4444" :
                    riskLevel === "MEDIUM" ? "#f59e0b" : "#22c55e",
                  fontSize: 12,
                  fontWeight: 800,
                }}>
                  Overall risk: {riskLevel}
                </div>
              )}

              {isSample && (
                <div style={{
                  marginBottom: 12,
                  fontSize: 12,
                  color: "#facc15",
                  fontWeight: 700,
                }}>
                  SAMPLE ANALYSIS – example output
                </div>
              )}

              {analysis}

              <button
                onClick={downloadPdf}
                style={{
                  marginTop: 24,
                  padding: "10px 16px",
                  fontSize: 14,
                  fontWeight: 700,
                  borderRadius: 10,
                  background: "#334155",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                📄 Download PDF
              </button>

              {isSample && (
                <div style={{
                  marginTop: 24,
                  padding: 24,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: 12,
                  textAlign: "center",
                }}>
                  <h3 style={{ fontSize: 20, marginBottom: 8, fontWeight: 800 }}>
                    Impressed? Analyze your real contract
                  </h3>
                  <p style={{ fontSize: 14, marginBottom: 16, opacity: 0.95 }}>
                    ✓ Hidden renewal clauses  ✓ Liability caps  ✓ Vendor lock-in
                  </p>
                  <button
                    onClick={pay}
                    style={{
                      padding: "14px 28px",
                      fontSize: 16,
                      fontWeight: 700,
                      borderRadius: 12,
                      background: "white",
                      color: "#667eea",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Unlock full analysis for 349 kr
                  </button>
                  <p style={{ fontSize: 12, marginTop: 12, opacity: 0.9 }}>
                    💳 Secure payment via Stripe  •  No subscription  •  One-time purchase
                  </p>
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: 60 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              Frequently Asked Questions
            </h3>

            <div style={{ marginBottom: 12 }}>
              <strong>Q: Are my contracts safe?</strong>
              <p style={{ fontSize: 14, color: "#cbd5f5", margin: "4px 0 8px" }}>
                TrustTerms processes contracts securely in memory only. Your documents
                are not stored or used for training AI models.
              </p>
            </div>

            <div style={{ marginBottom: 12 }}>
              <strong>Q: Can AI really understand legal contracts?</strong>
              <p style={{ fontSize: 14, color: "#cbd5f5", margin: "4px 0 8px" }}>
                TrustTerms uses advanced AI trained to spot common commercial and SaaS
                contract risks. It highlights potential financial exposure and non-standard clauses.
              </p>
            </div>

            <div style={{ marginBottom: 12 }}>
              <strong>Q: Is this legal advice?</strong>
              <p style={{ fontSize: 14, color: "#cbd5f5", margin: "4px 0 8px" }}>
                No. This is general information to support decision-making. Always consult
                a qualified lawyer for binding advice.
              </p>
            </div>

            <div style={{ marginBottom: 12 }}>
              <strong>Q: When is this analysis enough?</strong>
              <p style={{ fontSize: 14, color: "#cbd5f5", margin: "4px 0 8px" }}>
                It's perfect for spotting high-risk clauses quickly before contract review.
                Use it as a sanity check to avoid surprises and negotiate smarter.
              </p>
            </div>

            <div style={{
              marginTop: 32,
              padding: 24,
              borderRadius: 12,
              background: "#020617",
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
                Why CFOs and Founders Trust TrustTerms
              </h3>
              <ul style={{ fontSize: 14, color: "#cbd5f5", lineHeight: 1.6, paddingLeft: 20 }}>
                <li>Instant contract analysis without waiting for a lawyer</li>
                <li>Clear, non-legal language for decision-making</li>
                <li>Secure: contracts are not stored or shared</li>
                <li>Supports smart negotiation — saves time and money</li>
              </ul>
            </div>
          </div>

          <div style={{ marginTop: 40, fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
            <p style={{ marginBottom: 8 }}>
              Contracts are processed securely and not stored after analysis.
            </p>
            <p>
              <a href="/privacy" style={{ color: "#6366f1", marginRight: 16 }}>Privacy Policy</a>
              <a href="/terms" style={{ color: "#6366f1" }}>Terms of Service</a>
            </p>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}