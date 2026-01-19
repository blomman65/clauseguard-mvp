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
      if (!res.ok) throw new Error("Failed to create checkout session");
      const data = await res.json();
      window.location.href = data.url;
    } catch (err: any) {
      console.error("Checkout error:", err);
      Sentry.captureException(err, { tags: { action: "checkout_failed" } });
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
      if (!res.ok) throw new Error(data.error || "Analysis failed");

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
        tags: { action: "analysis_failed", is_sample: isSample },
        extra: { contract_length: contractText.length, error_message: errorMessage },
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

      if (!res.ok) throw new Error("PDF export failed");

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
      Sentry.captureException(err, { tags: { action: "pdf_download_failed" } });
      setError("Failed to download PDF. Please try again.");
    }
  };

  const handleSampleClick = () => {
    analytics.sampleClicked();
    setContractText(sampleContract);
    setIsSample(true);
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
        background: "#0f172a",
        minHeight: "100vh",
        color: "white"
      }}>
        {/* Navigation */}
        <nav style={{
          borderBottom: "1px solid #334155",
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50
        }}>
          <div style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div style={{
              fontSize: 20,
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.02em"
            }}>
              TrustTerms
            </div>
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              <a href="#how-it-works" style={{
                color: "#94a3b8",
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 500,
                transition: "color 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.color = "white"}
              onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
                How it works
              </a>
              <a href="#pricing" style={{
                color: "#94a3b8",
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 500,
                transition: "color 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.color = "white"}
              onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
                Pricing
              </a>
            </div>
          </div>
        </nav>

        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px"
        }}>
          
          {/* Hero Section */}
          <div style={{ textAlign: "center", marginBottom: 96, maxWidth: 800, margin: "0 auto 96px" }}>
            <div style={{
              display: "inline-block",
              padding: "8px 16px",
              background: "#1e293b",
              borderRadius: 100,
              fontSize: 13,
              fontWeight: 600,
              color: "#cbd5e1",
              marginBottom: 24,
              letterSpacing: "0.01em",
              border: "1px solid #334155"
            }}>
              AI-Powered Contract Analysis
            </div>

            <h1 style={{
              fontSize: 64,
              fontWeight: 700,
              marginBottom: 24,
              color: "white",
              letterSpacing: "-0.04em",
              lineHeight: 1.1
            }}>
              Spot hidden risks in SaaS contracts
            </h1>

            <p style={{
              fontSize: 22,
              color: "#cbd5e1",
              marginBottom: 40,
              lineHeight: 1.6,
              fontWeight: 400
            }}>
              Get instant AI analysis of your agreements. Identify auto-renewals, liability issues, and unfavorable terms before you sign.
            </p>

            {/* Stats */}
            <div style={{
              display: "flex",
              gap: 48,
              justifyContent: "center",
              marginTop: 48
            }}>
              {[
                { value: "60s", label: "Average analysis time" },
                { value: "100%", label: "Privacy protected" },
                { value: "149 kr", label: "One-time payment" }
              ].map((stat, i) => (
                <div key={i}>
                  <div style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: "white",
                    marginBottom: 4
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: 14,
                    color: "#94a3b8",
                    fontWeight: 500
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Value Props */}
          <div id="how-it-works" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 32,
            marginBottom: 96
          }}>
            {[
              {
                icon: "🔍",
                title: "Identify Hidden Risks",
                desc: "Auto-renewals, liability caps, and termination clauses that could cost you thousands"
              },
              {
                icon: "💰",
                title: "Real Financial Impact",
                desc: "See exactly what risky clauses could cost in actual dollars, not legal jargon"
              },
              {
                icon: "📋",
                title: "Actionable Recommendations",
                desc: "Get specific negotiation points and alternative language to propose"
              }
            ].map((item, i) => (
              <div key={i} style={{
                padding: 32,
                background: "#1e293b",
                borderRadius: 16,
                border: "1px solid #334155",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#475569";
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0, 0, 0, 0.3)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#334155";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}>
                <div style={{
                  fontSize: 40,
                  marginBottom: 16
                }}>
                  {item.icon}
                </div>
                <h3 style={{
                  fontSize: 20,
                  fontWeight: 600,
                  marginBottom: 12,
                  color: "white"
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: 16,
                  color: "#cbd5e1",
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Main Analysis Card */}
          <div id="pricing" style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 20,
            padding: 48,
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
            marginBottom: 96
          }}>
            {/* Try Sample Link */}
            <div style={{ marginBottom: 24 }}>
              <button
                onClick={handleSampleClick}
                disabled={loading}
                style={{
                  fontSize: 15,
                  color: "#6366f1",
                  background: "transparent",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  transition: "all 0.2s",
                  opacity: loading ? 0.4 : 1,
                  padding: 0,
                  textDecoration: "underline",
                  textUnderlineOffset: "4px"
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.currentTarget.style.color = "#818cf8";
                  }
                }}
                onMouseLeave={e => {
                  if (!loading) {
                    e.currentTarget.style.color = "#6366f1";
                  }
                }}
              >
                Try a sample contract (free, no payment needed)
              </button>
            </div>

            {/* Textarea */}
            <div style={{ marginBottom: 16 }}>
              <textarea
                placeholder="Paste your SaaS agreement here...

Or click above to try a sample contract first."
                value={contractText}
                onChange={(e) => {
                  setContractText(e.target.value);
                  setIsSample(false);
                  if (error) setError(null);
                }}
                disabled={loading}
                style={{
                  width: "100%",
                  height: 280,
                  padding: 20,
                  borderRadius: 12,
                  border: isOverLimit ? "2px solid #ef4444" : "2px solid #334155",
                  fontSize: 15,
                  fontFamily: "ui-monospace, 'SF Mono', Monaco, monospace",
                  color: "white",
                  background: loading ? "#0f172a" : "#0a0f1a",
                  resize: "vertical",
                  transition: "all 0.2s",
                  outline: "none",
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? "not-allowed" : "text",
                  lineHeight: 1.6
                }}
                onFocus={e => {
                  if (!isOverLimit && !loading) {
                    e.currentTarget.style.borderColor = "#6366f1";
                  }
                }}
                onBlur={e => {
                  if (!isOverLimit && !loading) {
                    e.currentTarget.style.borderColor = "#334155";
                  }
                }}
              />
            </div>

            {/* Character Count */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
              padding: "12px 16px",
              background: isOverLimit ? "#7f1d1d" : canAnalyze ? "#14532d" : "#0a0f1a",
              borderRadius: 8,
              border: `1px solid ${isOverLimit ? "#991b1b" : canAnalyze ? "#166534" : "#334155"}`
            }}>
              <div style={{
                fontSize: 14,
                color: isOverLimit ? "#fca5a5" : canAnalyze ? "#86efac" : "#94a3b8",
                fontWeight: 500
              }}>
                {canAnalyze && "✓ Ready to analyze"}
                {contractText.length > 0 && contractText.length < 50 && "Minimum 50 characters required"}
                {!contractText.length && "Paste your contract to get started"}
              </div>
              <div style={{
                fontSize: 13,
                color: isOverLimit ? "#fca5a5" : "#94a3b8",
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums"
              }}>
                {charCount.toLocaleString()} / {MAX_CONTRACT_LENGTH.toLocaleString()}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
              {(accessToken || isSample) && (
                <button
                  onClick={analyze}
                  disabled={loading || !canAnalyze}
                  style={{
                    width: "100%",
                    padding: "16px",
                    fontSize: 16,
                    fontWeight: 600,
                    borderRadius: 10,
                    background: (!canAnalyze || loading) ? "#334155" : "#6366f1",
                    color: "white",
                    border: "none",
                    cursor: (!canAnalyze || loading) ? "not-allowed" : "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => {
                    if (canAnalyze && !loading) {
                      e.currentTarget.style.background = "#4f46e5";
                    }
                  }}
                  onMouseLeave={e => {
                    if (canAnalyze && !loading) {
                      e.currentTarget.style.background = "#6366f1";
                    }
                  }}
                >
                  {loading ? "Analyzing..." : "Analyze Contract"}
                </button>
              )}

              {!accessToken && !isSample && (
                <>
                  <button
                    onClick={pay}
                    disabled={checkoutLoading}
                    style={{
                      width: "100%",
                      padding: "16px",
                      fontSize: 16,
                      fontWeight: 600,
                      borderRadius: 10,
                      background: checkoutLoading ? "#334155" : "#6366f1",
                      color: "white",
                      border: "none",
                      cursor: checkoutLoading ? "not-allowed" : "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={e => {
                      if (!checkoutLoading) {
                        e.currentTarget.style.background = "#4f46e5";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!checkoutLoading) {
                        e.currentTarget.style.background = "#6366f1";
                      }
                    }}
                  >
                    {checkoutLoading ? "Loading..." : "Pay 149 kr to Analyze Your Contract"}
                  </button>

                  <div style={{
                    padding: "16px",
                    background: "#0a0f1a",
                    border: "1px solid #334155",
                    borderRadius: 10,
                    textAlign: "center"
                  }}>
                    <p style={{
                      fontSize: 14,
                      color: "#cbd5e1",
                      margin: 0,
                      fontWeight: 500
                    }}>
                      One-time payment • No subscription • Instant access
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{
              marginTop: 48,
              padding: 48,
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 20,
              textAlign: "center"
            }}>
              <div style={{
                width: 48,
                height: 48,
                border: "4px solid #334155",
                borderTopColor: "#6366f1",
                borderRadius: "50%",
                margin: "0 auto 24px",
                animation: "spin 1s linear infinite"
              }} />
              
              <p style={{
                fontSize: 18,
                color: "white",
                fontWeight: 600,
                marginBottom: 8
              }}>
                Analyzing {isSample ? "sample" : "your"} contract...
              </p>
              
              <p style={{
                fontSize: 15,
                color: "#94a3b8",
                margin: 0
              }}>
                {loadingMessage}
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div style={{
              marginTop: 48,
              padding: 24,
              background: "#7f1d1d",
              border: "1px solid #991b1b",
              borderRadius: 12,
              display: "flex",
              alignItems: "start",
              gap: 16
            }}>
              <div style={{
                fontSize: 20,
                flexShrink: 0
              }}>
                ⚠️
              </div>
              <div>
                <p style={{
                  fontSize: 15,
                  color: "#fca5a5",
                  fontWeight: 600,
                  margin: 0
                }}>
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div style={{
              marginTop: 48,
              background: "#1e293b",
              border: "1px solid #334155",
              padding: 48,
              borderRadius: 20,
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)"
            }}>
              {/* Risk Badge */}
              {riskLevel && (
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 24,
                  padding: "10px 20px",
                  borderRadius: 100,
                  background: riskLevel === "HIGH" ? "#7f1d1d" : riskLevel === "MEDIUM" ? "#78350f" : "#14532d",
                  border: `1px solid ${riskLevel === "HIGH" ? "#991b1b" : riskLevel === "MEDIUM" ? "#92400e" : "#166534"}`,
                  fontSize: 14,
                  fontWeight: 700,
                  color: riskLevel === "HIGH" ? "#fca5a5" : riskLevel === "MEDIUM" ? "#fcd34d" : "#86efac",
                  letterSpacing: "0.02em"
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

              {/* Sample Badge */}
              {isSample && (
                <div style={{
                  display: "inline-block",
                  marginLeft: 12,
                  marginBottom: 24,
                  padding: "10px 20px",
                  background: "#78350f",
                  border: "1px solid #92400e",
                  borderRadius: 100,
                  fontSize: 13,
                  color: "#fcd34d",
                  fontWeight: 700,
                  letterSpacing: "0.02em"
                }}>
                  SAMPLE ANALYSIS
                </div>
              )}

              {/* Analysis Content */}
              <div style={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.7,
                fontSize: 15,
                color: "#cbd5e1"
              }}>
                {analysis}
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: 40, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  onClick={downloadPdf}
                  style={{
                    padding: "12px 24px",
                    fontSize: 15,
                    fontWeight: 600,
                    borderRadius: 10,
                    background: "#0a0f1a",
                    color: "white",
                    border: "1px solid #334155",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "#0f172a";
                    e.currentTarget.style.borderColor = "#475569";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "#0a0f1a";
                    e.currentTarget.style.borderColor = "#334155";
                  }}
                >
                  Download PDF Report
                </button>
              </div>

              {/* Upgrade CTA for Sample */}
              {isSample && (
                <div style={{
                  marginTop: 48,
                  padding: 40,
                  background: "#0a0f1a",
                  border: "1px solid #334155",
                  borderRadius: 16,
                  textAlign: "center"
                }}>
                  <h3 style={{
                    fontSize: 24,
                    marginBottom: 12,
                    fontWeight: 600,
                    color: "white"
                  }}>
                    Ready to analyze your real contract?
                  </h3>
                  
                  <p style={{
                    fontSize: 16,
                    marginBottom: 32,
                    color: "#cbd5e1",
                    lineHeight: 1.6,
                    maxWidth: 500,
                    margin: "0 auto 32px"
                  }}>
                    Get instant analysis of your actual agreements with the same depth and clarity
                  </p>
                  
                  <button
                    onClick={pay}
                    disabled={checkoutLoading}
                    style={{
                      padding: "16px 32px",
                      fontSize: 16,
                      fontWeight: 600,
                      borderRadius: 10,
                      background: checkoutLoading ? "#334155" : "#6366f1",
                      color: "white",
                      border: "none",
                      cursor: checkoutLoading ? "not-allowed" : "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={e => {
                      if (!checkoutLoading) {
                        e.currentTarget.style.background = "#4f46e5";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!checkoutLoading) {
                        e.currentTarget.style.background = "#6366f1";
                      }
                    }}
                  >
                    {checkoutLoading ? "Loading..." : "Unlock Full Analysis for 149 kr"}
                  </button>
                  
                  <p style={{
                    fontSize: 14,
                    marginTop: 16,
                    color: "#94a3b8",
                    fontWeight: 500
                  }}>
                    One-time payment • No subscription
                  </p>
                </div>
              )}
            </div>
          )}

          {/* FAQ Section */}
          <div style={{ marginTop: 120 }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{
                fontSize: 36,
                fontWeight: 700,
                color: "white",
                letterSpacing: "-0.02em",
                marginBottom: 12
              }}>
                Frequently Asked Questions
              </h2>
              <p style={{
                fontSize: 16,
                color: "#94a3b8"
              }}>
                Everything you need to know about TrustTerms
              </p>
            </div>

            <div style={{
              display: "grid",
              gap: 16,
              maxWidth: 800,
              margin: "0 auto"
            }}>
              {[
                {
                  q: "Are my contracts safe?",
                  a: "Yes. Contracts are processed in memory only and immediately deleted. Never stored, never used for AI training."
                },
                {
                  q: "Is this legal advice?",
                  a: "No. This is general information to help you spot risks. Always consult a qualified lawyer for legal decisions."
                },
                {
                  q: "How accurate is the AI analysis?",
                  a: "Our AI compares clauses to market standards for SaaS contracts. Use it as a first pass before legal review to save time and money."
                },
                {
                  q: "What happens after I pay?",
                  a: "You get instant access to analyze your contract. Paste it in and click 'Analyze'. Results in under 60 seconds."
                }
              ].map((item, i) => (
                <div key={i} style={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: 12,
                  padding: 24,
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "#475569";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "#334155";
                  e.currentTarget.style.boxShadow = "none";
                }}>
                  <h3 style={{
                    fontSize: 17,
                    fontWeight: 600,
                    marginBottom: 8,
                    color: "white"
                  }}>
                    {item.q}
                  </h3>
                  <p style={{
                    fontSize: 15,
                    color: "#cbd5e1",
                    lineHeight: 1.6,
                    margin: 0
                  }}>
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 120,
            paddingTop: 48,
            borderTop: "1px solid #334155",
            textAlign: "center"
          }}>
            {/* Trust Badges */}
            <div style={{
              display: "flex",
              gap: 32,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 32
            }}>
              {[
                { icon: "🔒", text: "Contracts never stored" },
                { icon: "🇪🇺", text: "GDPR compliant" },
                { icon: "⚡", text: "Instant results" }
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 14,
                  color: "#94a3b8",
                  fontWeight: 500
                }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>

            {/* Links */}
            <div style={{ marginBottom: 24 }}>
              <a
                href="/privacy"
                style={{
                  color: "#94a3b8",
                  marginRight: 24,
                  textDecoration: "none",
                  fontWeight: 500,
                  fontSize: 14,
                  transition: "color 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.color = "white"}
                onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                style={{
                  color: "#94a3b8",
                  textDecoration: "none",
                  fontWeight: 500,
                  fontSize: 14,
                  transition: "color 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.color = "white"}
                onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
              >
                Terms of Service
              </a>
            </div>

            {/* Copyright */}
            <p style={{
              fontSize: 14,
              color: "#64748b",
              margin: 0
            }}>
              © {new Date().getFullYear()} TrustTerms. All rights reserved.
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