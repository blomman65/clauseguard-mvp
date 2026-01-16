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
      
      Sentry.captureException(err, {
        tags: {
          action: "checkout_failed",
        },
      });
      
      setError("Failed to start checkout. Please try again or contact support.");
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
        // ⚠️ FIX: Visa mer specifika felmeddelanden
        if (res.status === 429) {
          throw new Error(data.error || "Too many requests. Please wait a moment.");
        }
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
      a.download = `TrustTerms_Analysis_${new Date().toISOString().split('T')[0]}.pdf`;
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
    // ⚠️ FIX: Rensa tidigare analys när man byter till sample
    setAnalysis("");
    setRiskLevel(null);
    setError(null);
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

        <div style={{ maxWidth: 900, margin: "auto", padding: "80px 24px", position: "relative", zIndex: 1 }}>
          
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{
              display: "inline-block",
              padding: "8px 18px",
              background: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.4)",
              borderRadius: 24,
              fontSize: 13,
              fontWeight: 700,
              color: "#c7d2fe",
              marginBottom: 24,
              letterSpacing: "0.5px",
              textTransform: "uppercase"
            }}>
              ⚡ AI-Powered Contract Analysis
            </div>

            <h1 style={{
              fontSize: 64,
              fontWeight: 900,
              marginBottom: 24,
              background: "linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.03em",
              lineHeight: 1.1
            }}>
              TrustTerms
            </h1>

            <p style={{
              fontSize: 22,
              color: "#e2e8f0",
              marginBottom: 32,
              lineHeight: 1.7,
              maxWidth: 680,
              margin: "0 auto 36px",
              fontWeight: 500
            }}>
              Spot hidden risks in SaaS contracts before you sign.
              <br />
              Built for founders who value their time.
            </p>

            <div style={{
              display: "flex",
              gap: 20,
              justifyContent: "center",
              flexWrap: "wrap",
              fontSize: 15,
              color: "#94a3b8",
              fontWeight: 500
            }}>
              <span>✓ 60-second analysis</span>
              <span>✓ No account needed</span>
              <span>✓ Privacy-first</span>
            </div>
          </div>

          {/* Value Props Cards - ⚠️ FÖRBÄTTRAD DESIGN */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 24,
            marginBottom: 64
          }}>
            {[
              { emoji: "🔍", title: "Hidden Risks", desc: "Auto-renewals, liability caps, termination traps" },
              { emoji: "💰", title: "Financial Impact", desc: "See what risky clauses could actually cost you" },
              { emoji: "🎯", title: "Negotiation Tips", desc: "Know exactly what to push back on" }
            ].map((item, i) => (
              <div key={i} style={{
                background: "rgba(15, 23, 42, 0.7)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(100, 116, 139, 0.25)",
                borderRadius: 18,
                padding: 28,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.5)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(99, 102, 241, 0.15)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(100, 116, 139, 0.25)";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
              }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{item.emoji}</div>
                <h3 style={{ fontSize: 19, fontWeight: 700, marginBottom: 10, color: "#f1f5f9" }}>{item.title}</h3>
                <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Main Analysis Card - ⚠️ FÖRBÄTTRAD DESIGN */}
          <div style={{
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(100, 116, 139, 0.35)",
            borderRadius: 24,
            padding: 44,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)"
          }}>
            
            {/* Try Sample Button - ⚠️ FÖRBÄTTRAD */}
            <div style={{ marginBottom: 24 }}>
              <button
                onClick={handleSampleClick}
                disabled={loading}
                style={{
                  fontSize: 15,
                  color: "#a5b4fc",
                  background: "transparent",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  textDecoration: "underline",
                  fontWeight: 600,
                  transition: "color 0.2s",
                  opacity: loading ? 0.5 : 1
                }}
                onMouseEnter={e => !loading && (e.currentTarget.style.color = "#6366f1")}
                onMouseLeave={e => !loading && (e.currentTarget.style.color = "#a5b4fc")}
              >
                ← Try a sample SaaS contract (free)
              </button>
            </div>

            {/* Textarea - ⚠️ FÖRBÄTTRAD */}
            <textarea
              placeholder="Paste your SaaS agreement here...

Or click above to try a sample contract first (completely free, no payment needed)."
              value={contractText}
              onChange={(e) => {
                setContractText(e.target.value);
                setIsSample(false);
                // ⚠️ FIX: Rensa fel när användaren börjar skriva
                if (error) setError(null);
              }}
              disabled={loading}
              style={{
                width: "100%",
                height: 300,
                padding: 22,
                borderRadius: 14,
                border: isOverLimit ? "2px solid #ef4444" : "2px solid rgba(100, 116, 139, 0.4)",
                fontSize: 15,
                fontFamily: "ui-monospace, 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
                color: "#0f172a",
                background: loading ? "#f1f5f9" : "#f8fafc",
                marginBottom: 14,
                resize: "vertical",
                transition: "all 0.3s",
                outline: "none",
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "text"
              }}
              onFocus={e => {
                if (!isOverLimit && !loading) e.currentTarget.style.borderColor = "#6366f1";
              }}
              onBlur={e => {
                if (!isOverLimit && !loading) e.currentTarget.style.borderColor = "rgba(100, 116, 139, 0.4)";
              }}
            />

            {/* Character Count - ⚠️ FÖRBÄTTRAD */}
            <div style={{
              fontSize: 14,
              color: isOverLimit ? "#ef4444" : "#64748b",
              marginBottom: 28,
              textAlign: "right",
              fontWeight: 600
            }}>
              {charCount.toLocaleString()} / {MAX_CONTRACT_LENGTH.toLocaleString()} characters
              {isOverLimit && " — Contract too long"}
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 14, flexDirection: "column" }}>
              
              {/* Analyze Button */}
              {(accessToken || isSample) && (
                <button
                  onClick={analyze}
                  disabled={loading || !canAnalyze}
                  style={{
                    width: "100%",
                    padding: "20px 36px",
                    fontSize: 18,
                    fontWeight: 700,
                    borderRadius: 14,
                    background: (!canAnalyze || loading)
                      ? "rgba(100, 116, 139, 0.3)"
                      : "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    color: "white",
                    border: "none",
                    cursor: (!canAnalyze || loading) ? "not-allowed" : "pointer",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: canAnalyze && !loading ? "0 4px 20px rgba(34, 197, 94, 0.35)" : "none",
                  }}
                  onMouseEnter={e => {
                    if (canAnalyze && !loading) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 32px rgba(34, 197, 94, 0.45)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (canAnalyze && !loading) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 20px rgba(34, 197, 94, 0.35)";
                    }
                  }}
                >
                  {loading ? "⚡ Analyzing..." : "🔍 Analyze Contract"}
                </button>
              )}

              {/* Pay Button */}
              {!accessToken && !isSample && (
                <>
                  <button
                    onClick={pay}
                    disabled={checkoutLoading}
                    style={{
                      width: "100%",
                      padding: "20px 36px",
                      fontSize: 18,
                      fontWeight: 700,
                      borderRadius: 14,
                      background: checkoutLoading
                        ? "rgba(100, 116, 139, 0.3)"
                        : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                      color: "white",
                      border: "none",
                      cursor: checkoutLoading ? "not-allowed" : "pointer",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: checkoutLoading ? "none" : "0 4px 20px rgba(99, 102, 241, 0.35)",
                    }}
                    onMouseEnter={e => {
                      if (!checkoutLoading) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 8px 32px rgba(99, 102, 241, 0.5)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!checkoutLoading) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 20px rgba(99, 102, 241, 0.35)";
                      }
                    }}
                  >
                    {checkoutLoading ? "⏳ Loading..." : "💳 Pay 349 kr to Analyze Your Contract"}
                  </button>

                  <p style={{
                    fontSize: 14,
                    color: "#94a3b8",
                    textAlign: "center",
                    margin: 0,
                    lineHeight: 1.6
                  }}>
                    One-time payment • No subscription • Instant access
                    <br />
                    After payment, return here and click "Analyze"
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Loading State - ⚠️ FÖRBÄTTRAD */}
          {loading && (
            <div style={{
              marginTop: 36,
              padding: 44,
              background: "rgba(30, 41, 59, 0.85)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(100, 116, 139, 0.35)",
              borderRadius: 24,
              textAlign: "center",
            }}>
              <div style={{
                width: 56,
                height: 56,
                border: "4px solid rgba(99, 102, 241, 0.2)",
                borderTopColor: "#6366f1",
                borderRadius: "50%",
                margin: "0 auto 24px",
                animation: "spin 1s linear infinite",
              }} />
              <p style={{ fontSize: 18, color: "#f1f5f9", fontWeight: 700, marginBottom: 10 }}>
                Analyzing {isSample ? "sample" : "your"} contract...
              </p>
              <p style={{ fontSize: 15, color: "#cbd5e1" }}>
                {loadingMessage}
              </p>
            </div>
          )}

          {/* Error State - ⚠️ FÖRBÄTTRAD */}
          {error && (
            <div style={{
              marginTop: 36,
              padding: 28,
              background: "rgba(239, 68, 68, 0.12)",
              border: "2px solid rgba(239, 68, 68, 0.4)",
              borderRadius: 16,
              color: "#fca5a5",
              fontSize: 16,
              fontWeight: 500,
              display: "flex",
              alignItems: "start",
              gap: 12
            }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <div>
                {error}
              </div>
            </div>
          )}

          {/* Analysis Results - ⚠️ FÖRBÄTTRAD */}
          {analysis && (
            <div style={{
              marginTop: 44,
              background: "rgba(15, 23, 42, 0.85)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(100, 116, 139, 0.35)",
              padding: 44,
              borderRadius: 24,
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)"
            }}>
              {/* Risk Badge - ⚠️ FÖRBÄTTRAD */}
              {riskLevel && (
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 28,
                  padding: "12px 24px",
                  borderRadius: 999,
                  background:
                    riskLevel === "HIGH" ? "rgba(239, 68, 68, 0.18)" :
                    riskLevel === "MEDIUM" ? "rgba(245, 158, 11, 0.18)" : "rgba(34, 197, 94, 0.18)",
                  border: `2px solid ${
                    riskLevel === "HIGH" ? "#ef4444" :
                    riskLevel === "MEDIUM" ? "#f59e0b" : "#22c55e"
                  }`,
                  fontSize: 15,
                  fontWeight: 800,
                  color:
                    riskLevel === "HIGH" ? "#fca5a5" :
                    riskLevel === "MEDIUM" ? "#fcd34d" : "#86efac",
                }}>
                  <div style={{
                    width: 10,
                    height: 10,
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
                  marginBottom: 28,
                  padding: "12px 18px",
                  background: "rgba(250, 204, 21, 0.18)",
                  border: "1px solid rgba(250, 204, 21, 0.4)",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "#fde047",
                  fontWeight: 700,
                }}>
                  📋 SAMPLE ANALYSIS
                </div>
              )}

              {/* Analysis content - ⚠️ FÖRBÄTTRAD TYPOGRAFI */}
              <div style={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.85,
                fontSize: 16,
                color: "#e2e8f0"
              }}>
                {analysis}
              </div>

              {/* Action buttons */}
              <div style={{ marginTop: 36, display: "flex", gap: 14, flexWrap: "wrap" }}>
                <button
                  onClick={downloadPdf}
                  style={{
                    padding: "14px 28px",
                    fontSize: 16,
                    fontWeight: 700,
                    borderRadius: 12,
                    background: "rgba(100, 116, 139, 0.25)",
                    color: "#f1f5f9",
                    border: "1px solid rgba(100, 116, 139, 0.4)",
                    cursor: "pointer",
                    transition: "all 0.3s"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(100, 116, 139, 0.35)";
                    e.currentTarget.style.borderColor = "rgba(100, 116, 139, 0.6)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(100, 116, 139, 0.25)";
                    e.currentTarget.style.borderColor = "rgba(100, 116, 139, 0.4)";
                  }}
                >
                  📄 Download PDF Report
                </button>
              </div>

              {/* Upgrade CTA for sample - ⚠️ FÖRBÄTTRAD */}
              {isSample && (
                <div style={{
                  marginTop: 36,
                  padding: 36,
                  background: "linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%)",
                  border: "2px solid rgba(99, 102, 241, 0.5)",
                  borderRadius: 20,
                  textAlign: "center",
                }}>
                  <h3 style={{ fontSize: 24, marginBottom: 14, fontWeight: 800, color: "#f1f5f9" }}>
                    Ready to analyze your real contract?
                  </h3>
                  <p style={{ fontSize: 16, marginBottom: 28, color: "#e2e8f0" }}>
                    Get instant analysis of your actual agreements
                  </p>
                  <button
                    onClick={pay}
                    disabled={checkoutLoading}
                    style={{
                      padding: "18px 36px",
                      fontSize: 18,
                      fontWeight: 700,
                      borderRadius: 14,
                      background: checkoutLoading ? "rgba(100, 116, 139, 0.3)" : "white",
                      color: "#6366f1",
                      border: "none",
                      cursor: checkoutLoading ? "not-allowed" : "pointer",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: checkoutLoading ? "none" : "0 4px 20px rgba(99, 102, 241, 0.3)"
                    }}
                    onMouseEnter={e => {
                      if (!checkoutLoading) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 8px 32px rgba(99, 102, 241, 0.4)";
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
                  <p style={{ fontSize: 14, marginTop: 18, color: "#cbd5e1" }}>
                    💳 One-time payment • No subscription • Instant access
                  </p>
                </div>
              )}
            </div>
          )}

          {/* FAQ Section - OFÖRÄNDRAD men bättre spacing */}
          <div style={{ marginTop: 96 }}>
            <h2 style={{
              fontSize: 36,
              fontWeight: 800,
              marginBottom: 40,
              textAlign: "center",
              color: "#f1f5f9"
            }}>
              Frequently Asked Questions
            </h2>

            <div style={{
              display: "grid",
              gap: 24,
              maxWidth: 720,
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
                  background: "rgba(15, 23, 42, 0.7)",
                  border: "1px solid rgba(100, 116, 139, 0.25)",
                  borderRadius: 16,
                  padding: 28
                }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: "#f1f5f9" }}>
                    {item.q}
                  </h3>
                  <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer - ⚠️ FÖRBÄTTRAD */}
          <div style={{
            marginTop: 96,
            paddingTop: 44,
            borderTop: "1px solid rgba(100, 116, 139, 0.25)",
            textAlign: "center",
            fontSize: 14,
            color: "#64748b"
          }}>
            <p style={{ marginBottom: 16, color: "#94a3b8" }}>
              🔒 Contracts processed securely • Never stored • GDPR compliant
            </p>
            <p>
              <a href="/privacy" style={{ color: "#6366f1", marginRight: 24, textDecoration: "none", fontWeight: 600 }}>
                Privacy Policy
              </a>
              <a href="/terms" style={{ color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>
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