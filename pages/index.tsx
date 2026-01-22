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
        background: "linear-gradient(180deg, #050810 0%, #0a0e1a 50%, #0f172a 100%)",
        minHeight: "100vh",
        color: "white",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Premium animated background */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(59, 130, 246, 0.08) 0%, transparent 40%)
          `,
          pointerEvents: "none",
          animation: "gradientShift 15s ease infinite"
        }} />


        {/* Refined grid pattern */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(148, 163, 184, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          pointerEvents: "none",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)"
        }} />


        {/* Floating orbs for depth */}
        <div style={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(60px)",
          pointerEvents: "none",
          animation: "float 20s ease-in-out infinite"
        }} />
       
        <div style={{
          position: "absolute",
          bottom: "10%",
          right: "5%",
          width: 350,
          height: 350,
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(60px)",
          pointerEvents: "none",
          animation: "float 25s ease-in-out infinite reverse"
        }} />


        <div style={{
          maxWidth: 920,
          margin: "auto",
          padding: "100px 28px 80px",
          position: "relative",
          zIndex: 1
        }}>
         
          {/* Premium Header */}
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            {/* Badge */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 26px",
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)",
              border: "1px solid rgba(99, 102, 241, 0.4)",
              borderRadius: 100,
              fontSize: 13,
              fontWeight: 700,
              color: "#e0e7ff",
              marginBottom: 32,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              boxShadow: "0 4px 20px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
            }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)",
                boxShadow: "0 0 12px rgba(129, 140, 248, 0.6)"
              }} />
              AI-Powered Contract Analysis
            </div>


            {/* Main Title with premium gradient */}
            <h1 style={{
              fontSize: 80,
              fontWeight: 900,
              marginBottom: 32,
              background: "linear-gradient(135deg, #ffffff 0%, #e0e7ff 40%, #c7d2fe 70%, #a5b4fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.05em",
              lineHeight: 0.95,
              textShadow: "0 0 80px rgba(99, 102, 241, 0.3)",
              position: "relative"
            }}>
              TrustTerms
            </h1>


            {/* Subtitle with better hierarchy */}
            <p style={{
              fontSize: 26,
              color: "#f1f5f9",
              marginBottom: 16,
              lineHeight: 1.5,
              maxWidth: 740,
              margin: "0 auto 16px",
              fontWeight: 600,
              letterSpacing: "-0.01em"
            }}>
              Spot hidden risks in SaaS contracts before you sign
            </p>
           
            <p style={{
              fontSize: 18,
              color: "#cbd5e1",
              maxWidth: 640,
              margin: "0 auto 48px",
              lineHeight: 1.7,
              fontWeight: 500
            }}>
              Built for founders who value their time and money
            </p>


            {/* Feature badges with icons */}
            <div style={{
              display: "flex",
              gap: 24,
              justifyContent: "center",
              flexWrap: "wrap",
              fontSize: 15,
              fontWeight: 600
            }}>
              {[
                { icon: "⚡", text: "60-second analysis", color: "#fbbf24" },
                { icon: "🔒", text: "Privacy-first", color: "#34d399" },
                { icon: "🎯", text: "No account needed", color: "#60a5fa" }
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 20px",
                  background: "rgba(15, 23, 42, 0.6)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(100, 116, 139, 0.3)",
                  borderRadius: 12,
                  color: "#e2e8f0"
                }}>
                  <span style={{ fontSize: 18, filter: `drop-shadow(0 0 8px ${item.color})` }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>


          {/* Premium Value Props Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
            marginBottom: 80
          }}>
            {[
              {
                icon: "🔍",
                iconBg: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                title: "Hidden Risks",
                desc: "Uncover auto-renewals, liability caps, and termination traps that could cost you thousands",
                gradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.05) 100%)",
                borderColor: "rgba(239, 68, 68, 0.25)",
                glowColor: "rgba(239, 68, 68, 0.15)"
              },
              {
                icon: "💰",
                iconBg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                title: "Financial Impact",
                desc: "See exactly what risky clauses could cost you in real dollars, not legal jargon",
                gradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.05) 100%)",
                borderColor: "rgba(245, 158, 11, 0.25)",
                glowColor: "rgba(245, 158, 11, 0.15)"
              },
              {
                icon: "🎯",
                iconBg: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                title: "Negotiation Strategy",
                desc: "Get specific recommendations on what to push back on and how to phrase it",
                gradient: "linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(22, 163, 74, 0.05) 100%)",
                borderColor: "rgba(34, 197, 94, 0.25)",
                glowColor: "rgba(34, 197, 94, 0.15)"
              }
            ].map((item, i) => (
              <div key={i} style={{
                background: item.gradient,
                backdropFilter: "blur(16px)",
                border: `1px solid ${item.borderColor}`,
                borderRadius: 24,
                padding: 36,
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "default",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-12px) scale(1.02)";
                e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.6)";
                e.currentTarget.style.boxShadow = `0 24px 48px ${item.glowColor}, 0 0 0 1px rgba(255, 255, 255, 0.1) inset`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.borderColor = item.borderColor;
                e.currentTarget.style.boxShadow = "none";
              }}>
                {/* Icon circle */}
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: item.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  marginBottom: 24,
                  boxShadow: `0 8px 24px ${item.glowColor}, inset 0 2px 0 rgba(255, 255, 255, 0.2)`
                }}>
                  {item.icon}
                </div>
               
                <h3 style={{
                  fontSize: 22,
                  fontWeight: 800,
                  marginBottom: 14,
                  color: "#f8fafc",
                  letterSpacing: "-0.02em"
                }}>
                  {item.title}
                </h3>
               
                <p style={{
                  fontSize: 16,
                  color: "#cbd5e1",
                  lineHeight: 1.7,
                  margin: 0,
                  fontWeight: 500
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>{/* Premium Main Analysis Card */}
          <div style={{
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)",
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            borderRadius: 32,
            padding: 56,
            boxShadow: `
              0 32px 80px rgba(0, 0, 0, 0.6),
              0 0 0 1px rgba(255, 255, 255, 0.03) inset,
              0 2px 0 rgba(255, 255, 255, 0.05) inset
            `,
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Top accent line */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: "linear-gradient(90deg, transparent 0%, #6366f1 20%, #8b5cf6 50%, #6366f1 80%, transparent 100%)",
              opacity: 0.6
            }} />


            {/* Try Sample Button - Premium style */}
            <div style={{ marginBottom: 32 }}>
              <button
                onClick={handleSampleClick}
                disabled={loading}
                style={{
                  fontSize: 16,
                  color: "#c7d2fe",
                  background: "transparent",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  textDecoration: "none",
                  fontWeight: 700,
                  transition: "all 0.3s ease",
                  opacity: loading ? 0.4 : 1,
                  padding: "12px 0",
                  borderBottom: "2px solid transparent",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.currentTarget.style.color = "#a5b4fc";
                    e.currentTarget.style.borderBottomColor = "#6366f1";
                    e.currentTarget.style.transform = "translateX(-4px)";
                  }
                }}
                onMouseLeave={e => {
                  if (!loading) {
                    e.currentTarget.style.color = "#c7d2fe";
                    e.currentTarget.style.borderBottomColor = "transparent";
                    e.currentTarget.style.transform = "translateX(0)";
                  }
                }}
              >
                <span style={{ fontSize: 18 }}>←</span> Try a sample SaaS contract (free)
              </button>
            </div>


            {/* Premium Textarea */}
            <div style={{ position: "relative", marginBottom: 20 }}>
              <textarea
                placeholder="Paste your SaaS agreement here...


Or click above to try a sample contract first (completely free, no payment needed)."
                value={contractText}
                onChange={(e) => {
                  setContractText(e.target.value);
                  setIsSample(false);
                  if (error) setError(null);
                }}
                disabled={loading}
                style={{
                  width: "100%",
                  height: 340,
                  padding: 28,
                  borderRadius: 20,
                  border: isOverLimit
                    ? "2px solid #ef4444"
                    : "2px solid rgba(148, 163, 184, 0.25)",
                  fontSize: 16,
                  fontFamily: "ui-monospace, 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
                  color: "#0f172a",
                  background: loading ? "#f1f5f9" : "#ffffff",
                  resize: "vertical",
                  transition: "all 0.3s ease",
                  outline: "none",
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "text",
                  lineHeight: 1.65,
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)"
                }}
                onFocus={e => {
                  if (!isOverLimit && !loading) {
                    e.currentTarget.style.borderColor = "#6366f1";
                    e.currentTarget.style.boxShadow = "0 0 0 4px rgba(99, 102, 241, 0.12), 0 8px 24px rgba(99, 102, 241, 0.15)";
                  }
                }}
                onBlur={e => {
                  if (!isOverLimit && !loading) {
                    e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.25)";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.08)";
                  }
                }}
              />
            </div>


            {/* Character Count - Enhanced */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 36,
              padding: "16px 20px",
              background: isOverLimit
                ? "rgba(239, 68, 68, 0.08)"
                : canAnalyze
                ? "rgba(34, 197, 94, 0.08)"
                : "rgba(100, 116, 139, 0.08)",
              borderRadius: 12,
              border: `1px solid ${
                isOverLimit
                  ? "rgba(239, 68, 68, 0.3)"
                  : canAnalyze
                  ? "rgba(34, 197, 94, 0.3)"
                  : "rgba(100, 116, 139, 0.2)"
              }`
            }}>
              <div style={{
                fontSize: 14,
                color: isOverLimit
                  ? "#fca5a5"
                  : canAnalyze
                  ? "#86efac"
                  : "#94a3b8",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8
              }}>
                {canAnalyze && <span style={{ fontSize: 16 }}>✓</span>}
                {canAnalyze && "Ready to analyze"}
                {contractText.length > 0 && contractText.length < 50 && (
                  <>
                    <span style={{ fontSize: 16 }}>⚠️</span>
                    Minimum 50 characters required
                  </>
                )}
                {!contractText.length && "Paste your contract to get started"}
              </div>
              <div style={{
                fontSize: 14,
                color: isOverLimit
                  ? "#ef4444"
                  : charCount > MAX_CONTRACT_LENGTH * 0.9
                  ? "#f59e0b"
                  : "#64748b",
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums"
              }}>
                {charCount.toLocaleString()} / {MAX_CONTRACT_LENGTH.toLocaleString()}
                {isOverLimit && (
                  <span style={{ marginLeft: 8, color: "#ef4444" }}>— Too long</span>
                )}
              </div>
            </div>


            {/* Premium Action Buttons */}
            <div style={{ display: "flex", gap: 16, flexDirection: "column" }}>
             
              {/* Analyze Button - Premium design */}
              {(accessToken || isSample) && (
                <button
                  onClick={analyze}
                  disabled={loading || !canAnalyze}
                  style={{
                    width: "100%",
                    padding: "24px 48px",
                    fontSize: 19,
                    fontWeight: 800,
                    borderRadius: 18,
                    background: (!canAnalyze || loading)
                      ? "rgba(100, 116, 139, 0.25)"
                      : "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    color: "white",
                    border: "none",
                    cursor: (!canAnalyze || loading) ? "not-allowed" : "pointer",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: canAnalyze && !loading
                      ? "0 8px 32px rgba(34, 197, 94, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2)"
                      : "none",
                    letterSpacing: "0.01em",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseEnter={e => {
                    if (canAnalyze && !loading) {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 16px 48px rgba(34, 197, 94, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.2)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (canAnalyze && !loading) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 8px 32px rgba(34, 197, 94, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2)";
                    }
                  }}
                >
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                      <span style={{ fontSize: 20 }}>⚡</span> Analyzing...
                    </span>
                  ) : (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                      <span style={{ fontSize: 20 }}>🔍</span> Analyze Contract
                    </span>
                  )}
                </button>
              )}


              {/* Pay Button - Premium design */}
              {!accessToken && !isSample && (
                <>
                  <button
                    onClick={pay}
                    disabled={checkoutLoading}
                    style={{
                      width: "100%",
                      padding: "24px 48px",
                      fontSize: 19,
                      fontWeight: 800,
                      borderRadius: 18,
                      background: checkoutLoading
                        ? "rgba(100, 116, 139, 0.25)"
                        : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                      color: "white",
                      border: "none",
                      cursor: checkoutLoading ? "not-allowed" : "pointer",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: checkoutLoading
                        ? "none"
                        : "0 8px 32px rgba(99, 102, 241, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2)",
                      letterSpacing: "0.01em",
                      position: "relative",
                      overflow: "hidden"
                    }}
                    onMouseEnter={e => {
                      if (!checkoutLoading) {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 16px 48px rgba(99, 102, 241, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.2)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!checkoutLoading) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 8px 32px rgba(99, 102, 241, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2)";
                      }
                    }}
                  >
                    {checkoutLoading ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                        <span style={{ fontSize: 20 }}>⏳</span> Loading...
                      </span>
                    ) : (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                        <span style={{ fontSize: 20 }}>💳</span> Pay 149 kr to Analyze Your Contract
                      </span>
                    )}
                  </button>


                  {/* Info box */}
                  <div style={{
                    padding: "24px",
                    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)",
                    border: "1px solid rgba(99, 102, 241, 0.25)",
                    borderRadius: 16,
                    textAlign: "center"
                  }}>
                    <p style={{
                      fontSize: 15,
                      color: "#e0e7ff",
                      margin: 0,
                      lineHeight: 1.7,
                      fontWeight: 600
                    }}>
                      One-time payment • No subscription • Instant access
                    </p>
                    <p style={{
                      fontSize: 14,
                      color: "#cbd5e1",
                      margin: "8px 0 0",
                      lineHeight: 1.6
                    }}>
                      After payment, return here and click "Analyze"
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>


          {/* Premium Loading State */}
          {loading && (
            <div style={{
              marginTop: 48,
              padding: 56,
              background: "linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)",
              backdropFilter: "blur(40px)",
              border: "1px solid rgba(148, 163, 184, 0.25)",
              borderRadius: 32,
              textAlign: "center",
              boxShadow: "0 32px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset"
            }}>
              {/* Animated spinner */}
              <div style={{
                width: 72,
                height: 72,
                border: "6px solid rgba(99, 102, 241, 0.15)",
                borderTopColor: "#6366f1",
                borderRadius: "50%",
                margin: "0 auto 32px",
                animation: "spin 1s linear infinite",
                boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)"
              }} />
             
              <p style={{
                fontSize: 22,
                color: "#f8fafc",
                fontWeight: 800,
                marginBottom: 16,
                letterSpacing: "-0.01em"
              }}>
                Analyzing {isSample ? "sample" : "your"} contract...
              </p>
             
              <p style={{
                fontSize: 17,
                color: "#cbd5e1",
                fontWeight: 600,
                background: "linear-gradient(90deg, #cbd5e1 0%, #94a3b8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                {loadingMessage}
              </p>
            </div>
          )}


          {/* Premium Error State */}
          {error && (
            <div style={{
              marginTop: 48,
              padding: 36,
              background: "linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.1) 100%)",
              border: "2px solid rgba(239, 68, 68, 0.4)",
              borderRadius: 20,
              display: "flex",
              alignItems: "start",
              gap: 20,
              boxShadow: "0 12px 32px rgba(239, 68, 68, 0.25)"
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                flexShrink: 0
              }}>
                ⚠️
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: 18,
                  color: "#fca5a5",
                  fontWeight: 700,
                  margin: "0 0 8px",
                  letterSpacing: "-0.01em"
                }}>
                  {error}
                </p>
                {(error.includes("rate limit") || error.includes("Too many")) && (
                  <p style={{
                    fontSize: 15,
                    color: "#fecaca",
                    margin: 0,
                    lineHeight: 1.6
                  }}>
                    This helps us keep costs down and prevent abuse. Thanks for understanding!
                  </p>
                )}
              </div>
            </div>
          )}


          {/* Premium Analysis Results */}
          {analysis && (
            <div style={{
              marginTop: 56,
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)",
              backdropFilter: "blur(40px)",
              border: "1px solid rgba(148, 163, 184, 0.25)",
              padding: 56,
              borderRadius: 32,
              boxShadow: "0 32px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05) inset",
              position: "relative",
              overflow: "hidden"
            }}>
              {/* Top accent */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: riskLevel === "HIGH"
                  ? "linear-gradient(90deg, transparent 0%, #ef4444 50%, transparent 100%)"
                  : riskLevel === "MEDIUM"
                  ? "linear-gradient(90deg, transparent 0%, #f59e0b 50%, transparent 100%)"
                  : "linear-gradient(90deg, transparent 0%, #22c55e 50%, transparent 100%)"
              }} />


              {/* Premium Risk Badge */}
              {riskLevel && (
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 36,
                  padding: "16px 32px",
                  borderRadius: 100,
                  background: riskLevel === "HIGH"
                    ? "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%)"
                    : riskLevel === "MEDIUM"
                    ? "linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.15) 100%)"
                    : "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.15) 100%)",
                  border: `2px solid ${
                    riskLevel === "HIGH" ? "#ef4444" :
                    riskLevel === "MEDIUM" ? "#f59e0b" : "#22c55e"
                  }`,
                  fontSize: 17,
                  fontWeight: 900,
                  color: riskLevel === "HIGH" ? "#fca5a5" :
                    riskLevel === "MEDIUM" ? "#fcd34d" : "#86efac",
                  boxShadow: `0 8px 24px ${
                    riskLevel === "HIGH" ? "rgba(239, 68, 68, 0.35)" :
                    riskLevel === "MEDIUM" ? "rgba(245, 158, 11, 0.35)" : "rgba(34, 197, 94, 0.35)"
                  }, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
                  letterSpacing: "0.03em"
                }}>
                  <div style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "currentColor",
                    boxShadow: "0 0 16px currentColor, 0 0 8px currentColor inset"
                  }} />
                  OVERALL RISK: {riskLevel}
                </div>
              )}


              {/* Sample badge */}
              {isSample && (
                <div style={{
                  display: "inline-block",
                  marginLeft: 16,
                  marginBottom: 36,
                  padding: "16px 26px",
                  background: "linear-gradient(135deg, rgba(250, 204, 21, 0.2) 0%, rgba(234, 179, 8, 0.15) 100%)",
                  border: "1px solid rgba(250, 204, 21, 0.5)",
                  borderRadius: 100,
                  fontSize: 14,
                  color: "#fde047",
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                  boxShadow: "0 4px 16px rgba(250, 204, 21, 0.2)"
                }}>
                  📋 SAMPLE ANALYSIS
                </div>
              )}


              {/* Analysis content with better typography */}
              {/* Analysis content with better typography */}
<div style={{
  lineHeight: 1.7,
  fontSize: 16,
  color: "#cbd5e1",
  fontWeight: 400,
  letterSpacing: "-0.011em",
  maxWidth: 800
}}>
  {analysis.split('\n').map((line, index) => {
    const trimmedLine = line.trim();

    // --- SPECIAL: Overall Risk Line ---
    if (index === 0 && trimmedLine.startsWith("Overall risk level:")) {
      return (
        <h2 key={index} style={{
          fontSize: 32,
          fontWeight: 800,
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginTop: 0,
          marginBottom: 32,
          letterSpacing: "-0.035em",
          lineHeight: 1.2
        }}>
          {trimmedLine}
        </h2>
      );
    }

    // --- HEADINGS ---
    if (trimmedLine.startsWith('##')) {
      return (
        <h3 key={index} style={{
          fontSize: 20,
          fontWeight: 700,
          color: "#f1f5f9",
          marginTop: index === 0 ? 0 : 48,
          marginBottom: 20,
          letterSpacing: "-0.022em",
          lineHeight: 1.3,
          borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
          paddingBottom: 12
        }}>
          {trimmedLine.replace(/^##\s*/, '')}
        </h3>
      );
    }
    if (trimmedLine.startsWith('#')) {
      return (
        <h2 key={index} style={{
          fontSize: 26,
          fontWeight: 800,
          color: "#f8fafc",
          marginTop: index === 0 ? 0 : 56,
          marginBottom: 28,
          letterSpacing: "-0.03em",
          lineHeight: 1.25
        }}>
          {trimmedLine.replace(/^#\s*/, '')}
        </h2>
      );
    }

    // --- BULLETS / DASHES ---
    let normalizedLine = trimmedLine.replace(/^•\s*/, '- ').replace(/^\*\s*/, '- ');

    if (normalizedLine.startsWith('-')) {
      return (
        <div key={index} style={{
          display: 'flex',
          gap: 14,
          marginBottom: 14,
          paddingLeft: 4,
          position: 'relative'
        }}>
          <span style={{ 
            color: "#6366f1", 
            fontWeight: 600,
            fontSize: 24,
            lineHeight: 1.7,
            marginTop: -2
          }}>•</span>
          <span style={{ 
            flex: 1,
            color: "#e2e8f0"
          }}>
            {normalizedLine.replace(/^-+\s*/, '')}
          </span>
        </div>
      );
    }

    // --- NUMRERADE LISTOR ---
    if (/^\d+\./.test(trimmedLine)) {
      const numberMatch = trimmedLine.match(/^(\d+)\./);
      const number = numberMatch ? numberMatch[1] : '';
      return (
        <div key={index} style={{
          display: 'flex',
          gap: 14,
          marginBottom: 14,
          paddingLeft: 4
        }}>
          <span style={{ 
            color: "#8b5cf6", 
            fontWeight: 700,
            fontSize: 16,
            lineHeight: 1.7,
            minWidth: 28,
            textAlign: 'right'
          }}>{number}.</span>
          <span style={{ 
            flex: 1,
            color: "#e2e8f0"
          }}>
            {trimmedLine.replace(/^\d+\.\s*/, '')}
          </span>
        </div>
      );
    }

    // --- FETSTIL ---
    let processedLine = line;
    const boldRegex = /\*\*(.+?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={`bold-${index}-${match.index}`} style={{ 
          color: "#f1f5f9", 
          fontWeight: 650
        }}>
          {match[1]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    // --- TOM RAD ---
    if (trimmedLine === '') {
      return <div key={index} style={{ height: 20 }} />;
    }

    // --- VANLIG TEXT ---
    return (
      <p key={index} style={{ 
        marginBottom: 14,
        lineHeight: 1.7,
        color: "#cbd5e1"
      }}>
        {parts.length > 0 ? parts : line}
      </p>
    );
  })}
</div>



              {/* Premium Action buttons */}
              <div style={{ marginTop: 48, display: "flex", gap: 16, flexWrap: "wrap" }}>
                <button
                  onClick={downloadPdf}
                  style={{
                    padding: "18px 36px",
                    fontSize: 17,
                    fontWeight: 700,
                    borderRadius: 16,
                    background: "linear-gradient(135deg, rgba(100, 116, 139, 0.3) 0%, rgba(71, 85, 105, 0.3) 100%)",
                    color: "#f1f5f9",
                    border: "1px solid rgba(148, 163, 184, 0.4)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(100, 116, 139, 0.5) 0%, rgba(71, 85, 105, 0.5) 100%)";
                    e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.6)";
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.3)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(100, 116, 139, 0.3) 0%, rgba(71, 85, 105, 0.3) 100%)";
                    e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.4)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.2)";
                  }}
                >
                  <span style={{ fontSize: 22 }}>📄</span> Download PDF Report
                </button>
              </div>


              {/* Premium Upgrade CTA for sample */}
              {isSample && (
                <div style={{
                  marginTop: 52,
                  padding: 48,
                  background: "linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.2) 100%)",
                  border: "2px solid rgba(99, 102, 241, 0.5)",
                  borderRadius: 28,
                  textAlign: "center",
                  boxShadow: "0 16px 48px rgba(99, 102, 241, 0.25), inset 0 2px 0 rgba(255, 255, 255, 0.1)",
                  position: "relative",
                  overflow: "hidden"
                }}>
                  {/* Accent glow */}
                  <div style={{
                    position: "absolute",
                    top: "-50%",
                    left: "-50%",
                    width: "200%",
                    height: "200%",
                    background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
                    pointerEvents: "none"
                  }} />
                 
                  <div style={{ position: "relative" }}>
                    <h3 style={{
                      fontSize: 30,
                      marginBottom: 18,
                      fontWeight: 900,
                      color: "#f8fafc",
                      letterSpacing: "-0.02em"
                    }}>
                      Ready to analyze your real contract?
                    </h3>
                   
                    <p style={{
                      fontSize: 18,
                      marginBottom: 36,
                      color: "#e0e7ff",
                      lineHeight: 1.7,
                      maxWidth: 600,
                      margin: "0 auto 36px"
                    }}>
                      Get instant analysis of your actual agreements with the same depth and clarity
                    </p>
                   
                    <button
                      onClick={pay}
                      disabled={checkoutLoading}
                      style={{
                        padding: "22px 48px",
                        fontSize: 20,
                        fontWeight: 800,
                        borderRadius: 18,
                        background: checkoutLoading ? "rgba(100, 116, 139, 0.3)" : "white",
                        color: checkoutLoading ? "#94a3b8" : "#6366f1",
                        border: "none",
                        cursor: checkoutLoading ? "not-allowed" : "pointer",
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: checkoutLoading
                          ? "none"
                          : "0 8px 32px rgba(255, 255, 255, 0.35), inset 0 2px 0 rgba(255, 255, 255, 0.5)",
                        letterSpacing: "-0.01em"
                      }}
                      onMouseEnter={e => {
                        if (!checkoutLoading) {
                          e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                          e.currentTarget.style.boxShadow = "0 16px 48px rgba(255, 255, 255, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.5)";
                        }
                      }}
                      onMouseLeave={e => {
                        if (!checkoutLoading) {
                          e.currentTarget.style.transform = "translateY(0) scale(1)";
                          e.currentTarget.style.boxShadow = "0 8px 32px rgba(255, 255, 255, 0.35), inset 0 2px 0 rgba(255, 255, 255, 0.5)";
                        }
                      }}
                    >
                      {checkoutLoading ? "Loading..." : "Unlock Full Analysis for 149 kr"}
                    </button>
                   
                    <p style={{
                      fontSize: 15,
                      marginTop: 24,
                      color: "#cbd5e1",
                      fontWeight: 600
                    }}>
                      One-time payment • No subscription • Instant access
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* Premium FAQ Section */}
          <div style={{ marginTop: 120 }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <h2 style={{
                fontSize: 44,
                fontWeight: 900,
                color: "#f8fafc",
                letterSpacing: "-0.03em",
                marginBottom: 16
              }}>
                Frequently Asked Questions
              </h2>
              <p style={{
                fontSize: 17,
                color: "#94a3b8",
                maxWidth: 600,
                margin: "0 auto"
              }}>
                Everything you need to know about TrustTerms
              </p>
            </div><div style={{
              display: "grid",
              gap: 20,
              maxWidth: 800,
              margin: "0 auto"
            }}>
              {[
                {
                  q: "Are my contracts safe?",
                  a: "Yes. Contracts are processed in memory only and immediately deleted. Never stored, never used for AI training. We take your privacy seriously."
                },
                {
                  q: "Is this legal advice?",
                  a: "No. This is general information to help you spot risks. Always consult a qualified lawyer for binding legal decisions."
                },
                {
                  q: "How accurate is the AI analysis?",
                  a: "Our AI is specifically trained on SaaS contracts and compares clauses to market standards. Use it as a first pass before legal review to save time and money."
                },
                {
                  q: "What happens after I pay?",
                  a: "You get instant access to analyze your contract. Paste it in the box above and click 'Analyze'. Results in under 60 seconds."
                }
              ].map((item, i) => (
                <div key={i} style={{
                  background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.7) 100%)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  borderRadius: 20,
                  padding: 32,
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "default"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)";
                  e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.4)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.3)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.7) 100%)";
                  e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.2)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}>
                  <h3 style={{
                    fontSize: 19,
                    fontWeight: 800,
                    marginBottom: 14,
                    color: "#f8fafc",
                    letterSpacing: "-0.01em"
                  }}>
                    {item.q}
                  </h3>
                  <p style={{
                    fontSize: 16,
                    color: "#cbd5e1",
                    lineHeight: 1.8,
                    margin: 0,
                    fontWeight: 500
                  }}>
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>


          {/* Premium Footer */}
          <div style={{
            marginTop: 120,
            paddingTop: 56,
            borderTop: "1px solid rgba(148, 163, 184, 0.15)",
            textAlign: "center"
          }}>
            {/* Trust badges */}
            <div style={{
              display: "flex",
              gap: 32,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 32
            }}>
              {[
                { icon: "🔒", text: "Contracts processed securely" },
                { icon: "🗑️", text: "Never stored" },
                { icon: "🇪🇺", text: "GDPR compliant" }
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 15,
                  color: "#94a3b8",
                  fontWeight: 600
                }}>
                  <span style={{ fontSize: 18, filter: "drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))" }}>
                    {item.icon}
                  </span>
                  {item.text}
                </div>
              ))}
            </div>


            {/* Links */}
            <div style={{ marginBottom: 32 }}>
              <a
                href="/privacy"
                style={{
                  color: "#818cf8",
                  marginRight: 32,
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: 15,
                  transition: "color 0.3s"
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#a5b4fc"}
                onMouseLeave={e => e.currentTarget.style.color = "#818cf8"}
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                style={{
                  color: "#818cf8",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: 15,
                  transition: "color 0.3s"
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#a5b4fc"}
                onMouseLeave={e => e.currentTarget.style.color = "#818cf8"}
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
       
        @keyframes gradientShift {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
       
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
      `}</style>
    </>
  );
}
