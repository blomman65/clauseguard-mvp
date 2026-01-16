import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { analytics } from "../lib/analytics";
import Meta from "../components/Meta";

const MAX_CONTRACT_LENGTH = 50000;

export default function Home() {
  const [contractText, setContractText] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
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
    // Vänta lite så PostHog hinner initieras
    const timer = setTimeout(() => {
      analytics.conversionFunnelStep("landed");
    }, 500);
    
    return () => clearTimeout(timer);
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
    setCheckoutLoading(true);
    analytics.checkoutStarted();
    analytics.conversionFunnelStep("clicked_pay");
    
    try {
      const res = await fetch("/api/create-checkout-session", { method: "POST" });
      
      if (!res.ok) {
        throw new Error("Failed to create checkout session");
      }
      
      const data = await res.json();
      window.location.href = data.url;
    } catch (err: any) {
      console.error("Checkout error:", err);
      
      // Log to Sentry
      Sentry.captureException(err, {
        tags: {
          action: "checkout_failed",
        },
      });
      
      setError("Failed to start checkout. Please try again.");
      setCheckoutLoading(false);
    }
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
        throw new Error(data.error || "Analysis failed");
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
    } catch (err: any) {
      console.error("Analysis error:", err);
      
      const errorMessage = err.message || "Something went wrong. Please try again.";
      setError(errorMessage);
      
      // Log to Sentry
      Sentry.captureException(err, {
        tags: {
          action: "analysis_failed",
          is_sample: isSample,
        },
        extra: {
          contract_length: contractText.length,
          error_message: errorMessage,
        },
      });
      
      analytics.analysisFailed(errorMessage, isSample);
    }

    setLoading(false);
  };

  const downloadPdf = async () => {
    analytics.pdfDownloaded(riskLevel || "UNKNOWN");
    
    try {
      const res = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis, riskLevel }),
      });

      if (!res.ok) {
        throw new Error("PDF export failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "TrustTerms_Contract_Analysis.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("PDF download error:", err);
      
      Sentry.captureException(err, {
        tags: {
          action: "pdf_download_failed",
        },
      });
      
      setError("Failed to download PDF. Please try again.");
    }
  };

  const handleSampleClick = () => {
    analytics.sampleClicked();
    setContractText(sampleContract);
    setIsSample(true);
  };

  const charCount = contractText.length;
  const isOverLimit = charCount > MAX_CONTRACT_LENGTH;
  const canAnalyze = contractText.length >= 50 && !isOverLimit;

  return (
    <>
      <Meta />
      <main style={{
        background: "linear-gradient(to bottom, #0f172a 0%, #1e293b 100%)",
        minHeight: "100vh",
        color: "white",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Subtle animated background */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
          pointerEvents: "none"
        }} />

        <div style={{ maxWidth: 880, margin: "auto", padding: "80px 24px", position: "relative", zIndex: 1 }}>
          
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{
              display: "inline-block",
              padding: "6px 16px",
              background: "rgba(99, 102, 241, 0.1)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              color: "#a5b4fc",
              marginBottom: 20,
              letterSpacing: "0.5px"
            }}>
              ⚡ AI-POWERED CONTRACT ANALYSIS
            </div>

            <h1 style={{
              fontSize: 56,
              fontWeight: 900,
              marginBottom: 20,
              background: "linear-gradient(to right, #ffffff, #a5b4fc)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
              lineHeight: 1.1
            }}>
              TrustTerms
            </h1>

            <p style={{
              fontSize: 20,
              color: "#cbd5e1",
              marginBottom: 32,
              lineHeight: 1.6,
              maxWidth: 600,
              margin: "0 auto 32px"
            }}>
              Spot hidden risks in SaaS contracts before you sign.
              Built for founders and CFOs who need answers in minutes, not days.
            </p>

            <div style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
              fontSize: 14,
              color: "#94a3b8"
            }}>
              <span>✓ 60-second analysis</span>
              <span>✓ No account needed</span>
              <span>✓ Privacy-first</span>
            </div>
          </div>

          {/* Value Props Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 20,
            marginBottom: 60
          }}>
            {[
              { emoji: "🔍", title: "Hidden Risks", desc: "Auto-renewals, liability caps, termination traps" },
              { emoji: "💰", title: "Financial Impact", desc: "See what risky clauses could actually cost you" },
              { emoji: "🎯", title: "Negotiation Tips", desc: "Know exactly what to push back on before signing" }
            ].map((item, i) => (
              <div key={i} style={{
                background: "rgba(15, 23, 42, 0.6)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(100, 116, 139, 0.2)",
                borderRadius: 16,
                padding: 24,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.4)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(100, 116, 139, 0.2)";
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{item.emoji}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Main Analysis Card */}
          <div style={{
            background: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(100, 116, 139, 0.3)",
            borderRadius: 20,
            padding: 40,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
          }}>
            
            {/* Try Sample Button */}
            <div style={{ marginBottom: 20 }}>
              <button
                onClick={handleSampleClick}
                style={{
                  fontSize: 14,
                  color: "#a5b4fc",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontWeight: 600,
                  transition: "color 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#6366f1"}
                onMouseLeave={e => e.currentTarget.style.color = "#a5b4fc"}
              >
                ← Try a sample SaaS contract (free)
              </button>
            </div>

            {/* Textarea */}
            <textarea
              placeholder="Paste your SaaS agreement here...

Or click above to try a sample contract first (completely free, no payment needed)."
              value={contractText}
              onChange={(e) => {
                setContractText(e.target.value);
                setIsSample(false);
              }}
              style={{
                width: "100%",
                height: 280,
                padding: 20,
                borderRadius: 12,
                border: isOverLimit ? "2px solid #ef4444" : "2px solid rgba(100, 116, 139, 0.3)",
                fontSize: 15,
                fontFamily: "ui-monospace, monospace",
                color: "#0f172a",
                background: "#f8fafc",
                marginBottom: 12,
                resize: "vertical",
                transition: "border-color 0.3s",
                outline: "none"
              }}
              onFocus={e => {
                if (!isOverLimit) e.currentTarget.style.borderColor = "#6366f1";
              }}
              onBlur={e => {
                if (!isOverLimit) e.currentTarget.style.borderColor = "rgba(100, 116, 139, 0.3)";
              }}
            />

            {/* Character Count */}
            <div style={{
              fontSize: 13,
              color: isOverLimit ? "#ef4444" : "#64748b",
              marginBottom: 24,
              textAlign: "right",
              fontWeight: 500
            }}>
              {charCount.toLocaleString()} / {MAX_CONTRACT_LENGTH.toLocaleString()} characters
              {isOverLimit && " - Contract too long"}
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
              
              {/* Analyze Button (if already paid or sample) */}
              {(accessToken || isSample) && (
                <button
                  onClick={analyze}
                  disabled={loading || !canAnalyze}
                  style={{
                    width: "100%",
                    padding: "18px 32px",
                    fontSize: 18,
                    fontWeight: 700,
                    borderRadius: 12,
                    background: (!canAnalyze || loading)
                      ? "rgba(100, 116, 139, 0.3)"
                      : "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    color: "white",
                    border: "none",
                    cursor: (!canAnalyze || loading) ? "not-allowed" : "pointer",
                    transition: "all 0.3s",
                    boxShadow: canAnalyze && !loading ? "0 4px 20px rgba(34, 197, 94, 0.3)" : "none",
                  }}
                  onMouseEnter={e => {
                    if (canAnalyze && !loading) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 30px rgba(34, 197, 94, 0.4)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (canAnalyze && !loading) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 20px rgba(34, 197, 94, 0.3)";
                    }
                  }}
                >
                  {loading ? "⚡ Analyzing..." : "🔍 Analyze Contract"}
                </button>
              )}

              {/* Pay Button (if not paid and not sample) */}
              {!accessToken && !isSample && (
                <button
                  onClick={pay}
                  disabled={checkoutLoading}
                  style={{
                    width: "100%",
                    padding: "18px 32px",
                    fontSize: 18,
                    fontWeight: 700,
                    borderRadius: 12,
                    background: checkoutLoading 
                      ? "rgba(100, 116, 139, 0.3)"
                      : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                    color: "white",
                    border: "none",
                    cursor: checkoutLoading ? "not-allowed" : "pointer",
                    transition: "all 0.3s",
                    boxShadow: checkoutLoading ? "none" : "0 4px 20px rgba(99, 102, 241, 0.3)",
                  }}
                  onMouseEnter={e => {
                    if (!checkoutLoading) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 30px rgba(99, 102, 241, 0.5)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!checkoutLoading) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 20px rgba(99, 102, 241, 0.3)";
                    }
                  }}
                >
                  {checkoutLoading ? "⏳ Loading checkout..." : "💳 Pay 349 kr to Analyze Your Contract"}
                </button>
              )}

              {/* Info text under button */}
              {!accessToken && !isSample && (
                <p style={{
                  fontSize: 13,
                  color: "#94a3b8",
                  textAlign: "center",
                  margin: 0,
                  lineHeight: 1.5
                }}>
                  One-time payment • No subscription • Instant access
                  <br />
                  After payment, come back here and click "Analyze"
                </p>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{
              marginTop: 32,
              padding: 40,
              background: "rgba(30, 41, 59, 0.8)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(100, 116, 139, 0.3)",
              borderRadius: 20,
              textAlign: "center",
            }}>
              <div style={{
                width: 50,
                height: 50,
                border: "4px solid rgba(99, 102, 241, 0.2)",
                borderTopColor: "#6366f1",
                borderRadius: "50%",
                margin: "0 auto 20px",
                animation: "spin 1s linear infinite",
              }} />
              <p style={{ fontSize: 16, color: "#e2e8f0", fontWeight: 600, marginBottom: 8 }}>
                Analyzing {isSample ? "sample" : "your"} contract...
              </p>
              <p style={{ fontSize: 14, color: "#94a3b8" }}>
                {loadingMessage}
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div style={{
              marginTop: 32,
              padding: 24,
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: 12,
              color: "#fca5a5",
              fontSize: 15
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div style={{
              marginTop: 40,
              background: "rgba(15, 23, 42, 0.8)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(100, 116, 139, 0.3)",
              padding: 40,
              borderRadius: 20,
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
            }}>
              {/* Risk Badge */}
              {riskLevel && (
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 24,
                  padding: "10px 20px",
                  borderRadius: 999,
                  background:
                    riskLevel === "HIGH" ? "rgba(239, 68, 68, 0.15)" :
                    riskLevel === "MEDIUM" ? "rgba(245, 158, 11, 0.15)" : "rgba(34, 197, 94, 0.15)",
                  border: `2px solid ${
                    riskLevel === "HIGH" ? "#ef4444" :
                    riskLevel === "MEDIUM" ? "#f59e0b" : "#22c55e"
                  }`,
                  fontSize: 14,
                  fontWeight: 800,
                  color:
                    riskLevel === "HIGH" ? "#fca5a5" :
                    riskLevel === "MEDIUM" ? "#fcd34d" : "#86efac",
                }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "currentColor"
                  }} />
                  OVERALL RISK: {riskLevel}
                </div>
              )}

              {/* Sample badge */}
              {isSample && (
                <div style={{
                  display: "inline-block",
                  marginLeft: 12,
                  marginBottom: 24,
                  padding: "10px 16px",
                  background: "rgba(250, 204, 21, 0.15)",
                  border: "1px solid rgba(250, 204, 21, 0.3)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#fde047",
                  fontWeight: 700,
                }}>
                  📋 SAMPLE ANALYSIS
                </div>
              )}

              {/* Analysis content */}
              <div style={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.8,
                fontSize: 15,
                color: "#e2e8f0"
              }}>
                {analysis}
              </div>

              {/* Action buttons */}
              <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  onClick={downloadPdf}
                  style={{
                    padding: "12px 24px",
                    fontSize: 15,
                    fontWeight: 700,
                    borderRadius: 10,
                    background: "rgba(100, 116, 139, 0.2)",
                    color: "#e2e8f0",
                    border: "1px solid rgba(100, 116, 139, 0.3)",
                    cursor: "pointer",
                    transition: "all 0.3s"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(100, 116, 139, 0.3)";
                    e.currentTarget.style.borderColor = "rgba(100, 116, 139, 0.5)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(100, 116, 139, 0.2)";
                    e.currentTarget.style.borderColor = "rgba(100, 116, 139, 0.3)";
                  }}
                >
                  📄 Download PDF Report
                </button>
              </div>

              {/* Upgrade CTA for sample */}
              {isSample && (
                <div style={{
                  marginTop: 32,
                  padding: 32,
                  background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)",
                  border: "2px solid rgba(99, 102, 241, 0.4)",
                  borderRadius: 16,
                  textAlign: "center",
                }}>
                  <h3 style={{ fontSize: 22, marginBottom: 12, fontWeight: 800 }}>
                    Ready to analyze your real contract?
                  </h3>
                  <p style={{ fontSize: 15, marginBottom: 24, color: "#cbd5e1" }}>
                    Get instant analysis of your actual agreements
                  </p>
                  <button
                    onClick={pay}
                    disabled={checkoutLoading}
                    style={{
                      padding: "16px 32px",
                      fontSize: 17,
                      fontWeight: 700,
                      borderRadius: 12,
                      background: checkoutLoading ? "rgba(100, 116, 139, 0.3)" : "white",
                      color: "#6366f1",
                      border: "none",
                      cursor: checkoutLoading ? "not-allowed" : "pointer",
                      transition: "all 0.3s",
                      boxShadow: checkoutLoading ? "none" : "0 4px 20px rgba(99, 102, 241, 0.3)"
                    }}
                    onMouseEnter={e => {
                      if (!checkoutLoading) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 6px 30px rgba(99, 102, 241, 0.4)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!checkoutLoading) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 20px rgba(99, 102, 241, 0.3)";
                      }
                    }}
                  >
                    {checkoutLoading ? "Loading..." : "Unlock Full Analysis for 349 kr"}
                  </button>
                  <p style={{ fontSize: 13, marginTop: 16, color: "#94a3b8" }}>
                    💳 One-time payment • No subscription • Instant access
                  </p>
                </div>
              )}
            </div>
          )}

          {/* FAQ Section */}
          <div style={{ marginTop: 80 }}>
            <h2 style={{
              fontSize: 32,
              fontWeight: 800,
              marginBottom: 32,
              textAlign: "center"
            }}>
              Frequently Asked Questions
            </h2>

            <div style={{
              display: "grid",
              gap: 20,
              maxWidth: 700,
              margin: "0 auto"
            }}>
              {[
                {
                  q: "Are my contracts safe?",
                  a: "Yes. Contracts are processed in memory only and immediately deleted. Never stored, never used for AI training."
                },
                {
                  q: "Is this legal advice?",
                  a: "No. This is general information to help you spot risks. Always consult a qualified lawyer for binding legal decisions."
                },
                {
                  q: "How accurate is the AI analysis?",
                  a: "Our AI is trained specifically on SaaS contracts and compares clauses to market standards. Use it as a first pass before legal review."
                },
                {
                  q: "What happens after I pay?",
                  a: "You get instant access to analyze your contract. Paste it in the box above and click 'Analyze'. Results in 60 seconds."
                }
              ].map((item, i) => (
                <div key={i} style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(100, 116, 139, 0.2)",
                  borderRadius: 12,
                  padding: 24
                }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                    {item.q}
                  </h3>
                  <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 80,
            paddingTop: 40,
            borderTop: "1px solid rgba(100, 116, 139, 0.2)",
            textAlign: "center",
            fontSize: 13,
            color: "#64748b"
          }}>
            <p style={{ marginBottom: 12 }}>
              🔒 Contracts processed securely • Never stored • GDPR compliant
            </p>
            <p>
              <a href="/privacy" style={{ color: "#6366f1", marginRight: 20, textDecoration: "none" }}>
                Privacy Policy
              </a>
              <a href="/terms" style={{ color: "#6366f1", textDecoration: "none" }}>
                Terms of Service
              </a>
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