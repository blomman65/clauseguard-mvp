import { useEffect, useState, useRef } from "react";
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
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const sampleContract = `SAAS SERVICE AGREEMENT


This Software as a Service Agreement ("Agreement") is entered into between CloudTech Solutions Inc. ("Vendor") and the subscribing customer ("Customer").


1. TERM AND RENEWAL
This Agreement shall commence on the date of Customer's first payment and continue for an initial term of twelve (12) months. This Agreement shall automatically renew for successive twelve (12) month terms unless either party provides written notice of non-renewal at least ninety (90) days prior to the end of the current term. Vendor may modify pricing and terms upon renewal with thirty (30) days written notice.


2. FEES AND PAYMENT
Customer agrees to pay the subscription fees as set forth in the applicable order form. All fees are non-refundable except as expressly set forth herein. Vendor reserves the right to modify pricing upon renewal or with sixty (60) days notice during the subscription term. Late payments will accrue interest at 1.5% per month or the maximum rate permitted by law, whichever is less.


3. LIABILITY AND INDEMNIFICATION
Vendor's total liability under this Agreement is limited to the amount of fees paid by Customer in the three (3) months immediately preceding the claim. Vendor shall not be liable for any indirect, incidental, consequential, or punitive damages. Customer agrees to indemnify Vendor against any third-party claims arising from Customer's use of the Service.


4. TERMINATION
Either party may terminate this Agreement for convenience upon thirty (30) days written notice. Vendor may terminate immediately upon Customer's breach of payment obligations or violation of acceptable use policies. Upon termination, Customer shall immediately cease use of the Service and all fees paid are non-refundable.


5. DATA AND PRIVACY
Customer data will be stored on Vendor's servers in the United States. Vendor may use Customer data to improve the Service and for marketing purposes. Upon termination, Vendor will retain Customer data for ninety (90) days, after which it may be permanently deleted at Vendor's discretion.


6. WARRANTIES AND DISCLAIMERS
THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. Vendor does not warrant that the Service will be uninterrupted or error-free. Vendor disclaims all warranties, express or implied, including merchantability and fitness for a particular purpose.


7. CHANGES TO SERVICE
Vendor reserves the right to modify or discontinue any feature of the Service at any time without notice or liability to Customer.


By clicking "I Accept" or using the Service, Customer agrees to be bound by these terms.`;


  const loadingMessages = [
    "Scanning for auto-renewal clauses...",
    "Checking liability caps...",
    "Analyzing termination rights...",
    "Reviewing pricing terms...",
    "Identifying non-standard clauses...",
  ];


  useEffect(() => {
    const timer = setTimeout(() => { analytics.conversionFunnelStep("landed"); }, 500);
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
      a.download = `TrustTerms_Analysis_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
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
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setPdfError("Only PDF files are accepted.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPdfError("File too large. Maximum size is 10 MB.");
      return;
    }

    setPdfLoading(true);
    setPdfError(null);
    setError(null);

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to parse PDF.");
      setContractText(data.text);
      setIsSample(false);
      setAnalysis("");
      setRiskLevel(null);
    } catch (err: any) {
      setPdfError(err.message || "Failed to read PDF. Please paste the text manually instead.");
    } finally {
      setPdfLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };


  const charCount = contractText.length;
  const isOverLimit = charCount > MAX_CONTRACT_LENGTH;
  const canAnalyze = contractText.length >= 50 && !isOverLimit;


  const riskColors = {
    HIGH: { bg: "rgba(220,38,38,0.08)", border: "rgba(220,38,38,0.3)", text: "#ef4444", dot: "#ef4444" },
    MEDIUM: { bg: "rgba(217,119,6,0.08)", border: "rgba(217,119,6,0.3)", text: "#f59e0b", dot: "#f59e0b" },
    LOW: { bg: "rgba(5,150,105,0.08)", border: "rgba(5,150,105,0.3)", text: "#10b981", dot: "#10b981" },
  };


  return (
    <>
      <Meta />
      <main className="tt-main">


        {/* ── HEADER ── */}
        <header className="tt-header">
          <div className="tt-header-inner">
            <div className="tt-logo">
              <div className="tt-logo-mark">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L18 6V14L10 18L2 14V6L10 2Z" stroke="#3B82F6" strokeWidth="1.5" fill="none"/>
                  <path d="M10 6L14 8V12L10 14L6 12V8L10 6Z" fill="#3B82F6" opacity="0.4"/>
                </svg>
              </div>
              <span className="tt-logo-text">TrustTerms</span>
            </div>
            <nav className="tt-nav">
              <a href="/about" className="tt-nav-link">About</a>
              <a href="/contact" className="tt-nav-link">Support</a>
            </nav>
          </div>
        </header>


        {/* ── DISCLAIMER BANNER ── */}
        <div className="tt-disclaimer">
          <div className="tt-disclaimer-inner">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flexShrink:0}}>
              <circle cx="7" cy="7" r="6" stroke="#60A5FA" strokeWidth="1.2"/>
              <path d="M7 6v4M7 4.5v.5" stroke="#60A5FA" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span><strong>Not legal advice.</strong> This tool provides general information only. Always consult a qualified lawyer before signing contracts.</span>
          </div>
        </div>


        <div className="tt-container">


          {/* ── HERO ── */}
          <section className="tt-hero">
            <div className="tt-hero-badge">
              <span className="tt-badge-dot" />
              AI-Powered Contract Intelligence
            </div>
            <h1 className="tt-hero-title">
              Spot hidden risks<br />
              <span className="tt-hero-accent">before you sign</span>
            </h1>
            <p className="tt-hero-sub">
              Enterprise-grade SaaS contract analysis in under 60 seconds.<br />
              Built for founders and CFOs who can't afford costly surprises.
            </p>
            <div className="tt-hero-stats">
              {[
                { value: "60s", label: "Average analysis time" },
                { value: "5+", label: "Risk categories checked" },
                { value: "100%", label: "Privacy-first processing" },
              ].map((s, i) => (
                <div key={i} className="tt-stat">
                  <div className="tt-stat-value">{s.value}</div>
                  <div className="tt-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </section>


          {/* ── FEATURE CARDS ── */}
          <div className="tt-features">
            {[
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="9" cy="9" r="6" stroke="#EF4444" strokeWidth="1.5"/>
                    <path d="M14 14L18 18" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M9 6v3l2 2" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                ),
                color: "#EF4444",
                title: "Hidden Risk Detection",
                desc: "Auto-renewals, liability caps, and termination traps — flagged before they cost you."
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10h12M4 6h8M4 14h6" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round"/>
                    <rect x="13" y="11" width="5" height="6" rx="1" stroke="#3B82F6" strokeWidth="1.2"/>
                    <path d="M14 11V9a1 1 0 012 0v2" stroke="#3B82F6" strokeWidth="1.2"/>
                  </svg>
                ),
                color: "#3B82F6",
                title: "Financial Impact Analysis",
                desc: "Quantified dollar exposure — not legal jargon, but business consequences."
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 3l2 5h5l-4 3 1.5 5L10 13l-4.5 3L7 11 3 8h5z" stroke="#10B981" strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
                  </svg>
                ),
                color: "#10B981",
                title: "Negotiation Playbook",
                desc: "Ranked priorities with exact language to push back on — not just 'negotiate this'."
              },
            ].map((f, i) => (
              <div key={i} className="tt-feature-card">
                <div className="tt-feature-icon" style={{ "--fcolor": f.color } as any}>
                  {f.icon}
                </div>
                <h3 className="tt-feature-title">{f.title}</h3>
                <p className="tt-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>


          {/* ── MAIN ANALYSIS PANEL ── */}
          <div className="tt-panel">
            {/* Panel header */}
            <div className="tt-panel-header">
              <div className="tt-panel-title-group">
                <h2 className="tt-panel-title">Contract Analysis</h2>
                <p className="tt-panel-subtitle">Paste your SaaS agreement or upload a PDF below.</p>
              </div>
              <div className="tt-panel-actions">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  style={{ display: "none" }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || pdfLoading}
                  className="tt-upload-btn"
                >
                  {pdfLoading ? (
                    <><span className="tt-spinner tt-spinner--sm" /> Reading PDF...</>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 9V2M4 5l3-3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 10v1a1 1 0 001 1h8a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                      Upload PDF
                    </>
                  )}
                </button>
                <button
                  onClick={handleSampleClick}
                  disabled={loading || pdfLoading}
                  className="tt-sample-btn"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="2" y="2" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M5 5h4M5 7h4M5 9h2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                  </svg>
                  Try sample contract (free)
                </button>
              </div>
            </div>
            {pdfError && (
              <div className="tt-pdf-error">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="6.5" cy="6.5" r="5.5" stroke="#EF4444" strokeWidth="1.2"/>
                  <path d="M6.5 4.5v3M6.5 9v.2" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                {pdfError}
              </div>
            )}


            {/* Token status bar */}
            {accessToken && (
              <div className="tt-token-bar">
                <div className="tt-token-dot" />
                <span>Access token active — ready to analyze your contract</span>
              </div>
            )}


            {/* Textarea */}
            <div className="tt-textarea-wrap">
              <textarea
                placeholder={`Paste your SaaS agreement here...\n\nOr click "Try sample contract" above to see a demo analysis.`}
                value={contractText}
                onChange={(e) => {
                  setContractText(e.target.value);
                  setIsSample(false);
                  if (error) setError(null);
                  if (pdfError) setPdfError(null);
                }}
                disabled={loading || pdfLoading}
                className={`tt-textarea${isOverLimit ? " tt-textarea--error" : ""}`}
              />
              {isSample && (
                <div className="tt-textarea-badge">SAMPLE</div>
              )}
              {pdfLoading && (
                <div className="tt-textarea-overlay">
                  <span className="tt-spinner" />
                  <span>Extracting text from PDF…</span>
                </div>
              )}
            </div>


            {/* Character count row */}
            <div className="tt-char-row">
              <div className={`tt-char-status${canAnalyze ? " tt-char-status--ready" : isOverLimit ? " tt-char-status--error" : ""}`}>
                {canAnalyze && (
                  <><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> Ready to analyze</>
                )}
                {contractText.length > 0 && contractText.length < 50 && "Minimum 50 characters required"}
                {!contractText.length && "Paste your contract to get started"}
                {isOverLimit && <><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M6 4v3M6 8.5v.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> Contract too long</>}
              </div>
              <div className={`tt-char-count${isOverLimit ? " tt-char-count--error" : charCount > MAX_CONTRACT_LENGTH * 0.9 ? " tt-char-count--warn" : ""}`}>
                {charCount.toLocaleString()} / {MAX_CONTRACT_LENGTH.toLocaleString()}
              </div>
            </div>


            {/* Action buttons */}
            <div className="tt-actions">
              {(accessToken || isSample) ? (
                <button
                  onClick={analyze}
                  disabled={loading || !canAnalyze}
                  className="tt-btn tt-btn--primary tt-btn--full"
                >
                  {loading ? (
                    <><span className="tt-spinner" /> Analyzing contract...</>
                  ) : (
                    <><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> Analyze Contract</>
                  )}
                </button>
              ) : (
                <div className="tt-pay-group">
                  <button
                    onClick={pay}
                    disabled={checkoutLoading}
                    className="tt-btn tt-btn--primary tt-btn--full"
                  >
                    {checkoutLoading ? (
                      <><span className="tt-spinner" /> Loading checkout...</>
                    ) : (
                      <><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 5V4a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.4"/><path d="M2 9h12" stroke="currentColor" strokeWidth="1.2"/></svg> Pay 149 kr — Analyze My Contract</>
                    )}
                  </button>
                  <div className="tt-pay-meta">
                    <span>One-time payment</span>
                    <span className="tt-meta-dot">·</span>
                    <span>No subscription</span>
                    <span className="tt-meta-dot">·</span>
                    <span>Instant access</span>
                  </div>
                </div>
              )}
            </div>
          </div>


          {/* ── LOADING STATE ── */}
          {loading && (
            <div className="tt-loading-panel">
              <div className="tt-loading-pulse">
                <div className="tt-loading-ring" />
                <div className="tt-loading-ring tt-loading-ring--2" />
              </div>
              <div className="tt-loading-text">
                <h3>Analyzing {isSample ? "sample" : "your"} contract</h3>
                <p className="tt-loading-msg">{loadingMessage}</p>
              </div>
              <div className="tt-loading-steps">
                {loadingMessages.map((msg, i) => (
                  <div key={i} className={`tt-loading-step${loadingMessage === msg ? " active" : ""}`} />
                ))}
              </div>
            </div>
          )}


          {/* ── ERROR STATE ── */}
          {error && (
            <div className="tt-error-panel">
              <div className="tt-error-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7.5" stroke="#EF4444" strokeWidth="1.5"/>
                  <path d="M9 6v4M9 11.5v.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="tt-error-title">Analysis Error</div>
                <div className="tt-error-msg">{error}</div>
              </div>
            </div>
          )}


          {/* ── ANALYSIS RESULTS ── */}
          {analysis && (
            <div className="tt-results">


              {/* Results header */}
              <div className="tt-results-header">
                <div className="tt-results-title-row">
                  <h2 className="tt-results-title">Analysis Report</h2>
                  {isSample && <div className="tt-sample-badge">SAMPLE</div>}
                </div>


                {/* Risk level badge */}
                {riskLevel && (
                  <div
                    className="tt-risk-badge"
                    style={{
                      background: riskColors[riskLevel].bg,
                      borderColor: riskColors[riskLevel].border,
                      color: riskColors[riskLevel].text,
                    } as any}
                  >
                    <div className="tt-risk-dot" style={{ background: riskColors[riskLevel].dot }} />
                    <span className="tt-risk-label">Overall Risk</span>
                    <span className="tt-risk-level">{riskLevel}</span>
                  </div>
                )}
              </div>


              {/* Analysis content */}
              <div className="tt-analysis-body">
                {analysis.split("\n").map((line, index) => {
                  const trimmedLine = line.trim();


                  if (index === 0 && trimmedLine.startsWith("Overall risk level:")) {
                    return null; // shown in badge above
                  }
                  if (index === 1 && trimmedLine === "") return null;


                  if (trimmedLine.startsWith("### ")) {
                    return (
                      <h4 key={index} className="tt-analysis-h3">
                        {trimmedLine.replace(/^###\s*/, "")}
                      </h4>
                    );
                  }
                  if (trimmedLine.startsWith("## ")) {
                    return (
                      <h3 key={index} className="tt-analysis-h2">
                        {trimmedLine.replace(/^##\s*/, "")}
                      </h3>
                    );
                  }
                  if (trimmedLine.startsWith("# ")) {
                    return (
                      <h2 key={index} className="tt-analysis-h1">
                        {trimmedLine.replace(/^#\s*/, "")}
                      </h2>
                    );
                  }


                  let normalizedLine = trimmedLine.replace(/^[•*]\s*/, "- ");
                  if (normalizedLine.startsWith("- ")) {
                    return (
                      <div key={index} className="tt-analysis-bullet">
                        <span className="tt-bullet-mark">—</span>
                        <span>{normalizedLine.replace(/^-\s*/, "")}</span>
                      </div>
                    );
                  }


                  if (/^\d+\./.test(trimmedLine)) {
                    const match = trimmedLine.match(/^(\d+)\./);
                    const num = match ? match[1] : "";
                    return (
                      <div key={index} className="tt-analysis-numbered">
                        <span className="tt-num-mark">{num}</span>
                        <span>{trimmedLine.replace(/^\d+\.\s*/, "")}</span>
                      </div>
                    );
                  }


                  if (trimmedLine === "") return <div key={index} className="tt-analysis-spacer" />;


                  // Process bold
                  const parts: any[] = [];
                  const boldRegex = /\*\*(.+?)\*\*/g;
                  let lastIndex = 0;
                  let match;
                  while ((match = boldRegex.exec(line)) !== null) {
                    if (match.index > lastIndex) parts.push(line.substring(lastIndex, match.index));
                    parts.push(<strong key={`b${index}-${match.index}`} className="tt-bold">{match[1]}</strong>);
                    lastIndex = match.index + match[0].length;
                  }
                  if (lastIndex < line.length) parts.push(line.substring(lastIndex));


                  return (
                    <p key={index} className="tt-analysis-p">
                      {parts.length > 0 ? parts : line}
                    </p>
                  );
                })}
              </div>


              {/* Results actions */}
              <div className="tt-results-actions">
                <button onClick={downloadPdf} className="tt-btn tt-btn--secondary">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M7.5 2v7M4.5 6l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 11v1a1 1 0 001 1h9a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  Download PDF Report
                </button>
              </div>


              {/* Upgrade CTA for sample */}
              {isSample && (
                <div className="tt-upgrade-cta">
                  <div className="tt-upgrade-content">
                    <div className="tt-upgrade-left">
                      <h3 className="tt-upgrade-title">Ready to analyze your real contract?</h3>
                      <p className="tt-upgrade-desc">Get the same depth of analysis on your actual agreements — one-time payment, instant access.</p>
                    </div>
                    <button
                      onClick={pay}
                      disabled={checkoutLoading}
                      className="tt-btn tt-btn--upgrade"
                    >
                      {checkoutLoading ? "Loading..." : "Analyze My Contract — 149 kr"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* ── FAQ ── */}
          <section className="tt-faq">
            <div className="tt-section-header">
              <h2 className="tt-section-title">Frequently Asked Questions</h2>
              <p className="tt-section-sub">Everything you need to know</p>
            </div>
            <div className="tt-faq-grid">
              {[
                {
                  q: "Are my contracts safe?",
                  a: "We do not store your contracts or use them to train AI models. Your contract is processed via OpenAI's API, which retains data for up to 30 days for abuse monitoring before permanent deletion."
                },
                {
                  q: "Is this legal advice?",
                  a: "No. The analysis provides general information and risk indicators only — not legal advice. Always consult a qualified lawyer before making legally binding decisions."
                },
                {
                  q: "How accurate is the AI analysis?",
                  a: "Our AI benchmarks clauses against common market standards for SaaS agreements. It is designed as a first-pass review to identify potential risks before a full legal review."
                },
                {
                  q: "What happens after I pay?",
                  a: "You get instant access. Paste your contract above and click Analyze. Results are typically delivered in under 60 seconds."
                },
              ].map((item, i) => (
                <div key={i} className="tt-faq-card">
                  <h3 className="tt-faq-q">{item.q}</h3>
                  <p className="tt-faq-a">{item.a}</p>
                </div>
              ))}
            </div>
          </section>


          {/* ── FOOTER ── */}
          <footer className="tt-footer">
            <div className="tt-footer-trust">
              {[
                { icon: "🔒", text: "Processed securely via HTTPS" },
                { icon: "🗑", text: "Never stored on our servers" },
                { icon: "🇪🇺", text: "GDPR compliant" },
              ].map((t, i) => (
                <div key={i} className="tt-trust-item">
                  <span>{t.icon}</span>
                  <span>{t.text}</span>
                </div>
              ))}
            </div>
            <div className="tt-footer-links">
              <a href="/about">About</a>
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/contact">Contact</a>
            </div>
            <p className="tt-footer-copy">© {new Date().getFullYear()} TrustTerms. All rights reserved.</p>
          </footer>


        </div>
      </main>


      {/* ── ALL STYLES ── */}
      <style jsx global>{`
        /* ─────────────────────────────
           DESIGN TOKENS
        ───────────────────────────── */
        :root {
          --bg-base:        #030B18;
          --bg-surface:     #060F1E;
          --bg-elevated:    #0A1628;
          --bg-card:        #0D1B30;
          --bg-card-hover:  #102038;


          --border-subtle:  rgba(255,255,255,0.05);
          --border-default: rgba(255,255,255,0.08);
          --border-strong:  rgba(255,255,255,0.14);
          --border-focus:   rgba(59,130,246,0.6);


          --blue-500: #3B82F6;
          --blue-400: #60A5FA;
          --blue-300: #93C5FD;
          --blue-600: #2563EB;
          --blue-900: rgba(37,99,235,0.12);


          --text-primary:   #F1F5F9;
          --text-secondary: #94A3B8;
          --text-muted:     #475569;
          --text-accent:    #60A5FA;


          --radius-sm:  6px;
          --radius-md:  10px;
          --radius-lg:  16px;
          --radius-xl:  20px;
          --radius-2xl: 28px;


          --shadow-card: 0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3);
          --shadow-panel: 0 2px 8px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.4);


          --font-display: 'Sora', system-ui, sans-serif;
          --font-body: 'DM Sans', system-ui, sans-serif;
          --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
        }


        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');


        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }


        html { scroll-behavior: smooth; }


        body {
          background: var(--bg-base);
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 15px;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
        }


        /* ─────────────────────────────
           LAYOUT
        ───────────────────────────── */
        .tt-main {
          min-height: 100vh;
          background:
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,235,0.12) 0%, transparent 60%),
            var(--bg-base);
        }


        .tt-container {
          max-width: 860px;
          margin: 0 auto;
          padding: 0 24px 80px;
        }


        /* ─────────────────────────────
           HEADER
        ───────────────────────────── */
        .tt-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(3,11,24,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-subtle);
        }
        .tt-header-inner {
          max-width: 860px;
          margin: 0 auto;
          padding: 0 24px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .tt-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .tt-logo-mark {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tt-logo-text {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }
        .tt-nav {
          display: flex;
          gap: 4px;
        }
        .tt-nav-link {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          transition: color 0.15s, background 0.15s;
        }
        .tt-nav-link:hover {
          color: var(--text-primary);
          background: var(--bg-elevated);
        }


        /* ─────────────────────────────
           DISCLAIMER
        ───────────────────────────── */
        .tt-disclaimer {
          background: rgba(37,99,235,0.06);
          border-bottom: 1px solid rgba(59,130,246,0.12);
        }
        .tt-disclaimer-inner {
          max-width: 860px;
          margin: 0 auto;
          padding: 10px 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .tt-disclaimer-inner strong { color: var(--blue-400); }


        /* ─────────────────────────────
           HERO
        ───────────────────────────── */
        .tt-hero {
          padding: 72px 0 56px;
          text-align: center;
        }
        .tt-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--blue-400);
          background: rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.2);
          padding: 6px 14px;
          border-radius: 100px;
          margin-bottom: 28px;
        }
        .tt-badge-dot {
          width: 6px;
          height: 6px;
          background: var(--blue-400);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--blue-500);
          animation: pulse-dot 2s ease infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .tt-hero-title {
          font-family: var(--font-display);
          font-size: clamp(38px, 6vw, 58px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.04em;
          color: var(--text-primary);
          margin-bottom: 20px;
        }
        .tt-hero-accent {
          background: linear-gradient(135deg, var(--blue-400) 0%, var(--blue-300) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .tt-hero-sub {
          font-size: 16px;
          color: var(--text-secondary);
          max-width: 520px;
          margin: 0 auto 40px;
          line-height: 1.7;
        }
        .tt-hero-stats {
          display: flex;
          justify-content: center;
          gap: 0;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: var(--bg-card);
          max-width: 480px;
          margin: 0 auto;
        }
        .tt-stat {
          flex: 1;
          padding: 20px 16px;
          text-align: center;
          border-right: 1px solid var(--border-default);
        }
        .tt-stat:last-child { border-right: none; }
        .tt-stat-value {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 800;
          color: var(--blue-400);
          letter-spacing: -0.02em;
        }
        .tt-stat-label {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 3px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }


        /* ─────────────────────────────
           FEATURE CARDS
        ───────────────────────────── */
        .tt-features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 40px;
        }
        @media (max-width: 640px) {
          .tt-features { grid-template-columns: 1fr; }
        }
        .tt-feature-card {
          background: var(--bg-card);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: 24px 20px;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
        }
        .tt-feature-card:hover {
          border-color: var(--border-strong);
          background: var(--bg-card-hover);
          transform: translateY(-2px);
        }
        .tt-feature-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          background: rgba(var(--fcolor), 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          background: color-mix(in srgb, var(--fcolor, #3B82F6) 10%, transparent);
        }
        .tt-feature-title {
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
          letter-spacing: -0.01em;
        }
        .tt-feature-desc {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
        }


        /* ─────────────────────────────
           MAIN PANEL
        ───────────────────────────── */
        .tt-panel {
          background: var(--bg-card);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-2xl);
          padding: 32px;
          box-shadow: var(--shadow-panel);
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
        }
        .tt-panel::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent);
        }
        .tt-panel-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .tt-panel-title {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }
        .tt-panel-subtitle {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 3px;
        }
        .tt-sample-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--blue-400);
          background: rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: var(--radius-md);
          padding: 7px 13px;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          white-space: nowrap;
          font-family: var(--font-body);
        }
        .tt-sample-btn:hover {
          background: rgba(59,130,246,0.14);
          border-color: rgba(59,130,246,0.35);
        }
        .tt-sample-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .tt-upload-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 600;
          color: #10B981;
          background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.2);
          border-radius: var(--radius-md);
          padding: 7px 13px;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          white-space: nowrap;
          font-family: var(--font-body);
        }
        .tt-upload-btn:hover { background: rgba(16,185,129,0.14); border-color: rgba(16,185,129,0.35); }
        .tt-upload-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .tt-pdf-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(239,68,68,0.06);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: var(--radius-md);
          padding: 10px 14px;
          font-size: 12.5px;
          color: #FCA5A5;
          margin-bottom: 14px;
        }

        .tt-spinner--sm { width: 11px; height: 11px; }

        .tt-panel-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

        .tt-textarea-overlay {
          position: absolute;
          inset: 0;
          background: rgba(6,15,30,0.75);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 500;
        }


        /* Token bar */
        .tt-token-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(16,185,129,0.06);
          border: 1px solid rgba(16,185,129,0.2);
          border-radius: var(--radius-md);
          padding: 10px 14px;
          font-size: 12.5px;
          color: #10B981;
          font-weight: 500;
          margin-bottom: 16px;
        }
        .tt-token-dot {
          width: 6px; height: 6px;
          background: #10B981;
          border-radius: 50%;
          flex-shrink: 0;
          animation: pulse-dot 2s ease infinite;
        }


        /* Textarea */
        .tt-textarea-wrap {
          position: relative;
          margin-bottom: 12px;
        }
        .tt-textarea {
          width: 100%;
          height: 280px;
          padding: 18px;
          font-family: var(--font-mono);
          font-size: 13px;
          line-height: 1.65;
          color: #CBD5E1;
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          resize: vertical;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .tt-textarea::placeholder { color: var(--text-muted); }
        .tt-textarea:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        .tt-textarea--error {
          border-color: rgba(239,68,68,0.5) !important;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.08) !important;
        }
        .tt-textarea:disabled { opacity: 0.5; cursor: not-allowed; }
        .tt-textarea-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          color: var(--blue-400);
          background: rgba(59,130,246,0.1);
          border: 1px solid rgba(59,130,246,0.2);
          padding: 3px 8px;
          border-radius: 4px;
        }


        /* Char count */
        .tt-char-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .tt-char-status {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: var(--text-muted);
        }
        .tt-char-status--ready { color: #10B981; }
        .tt-char-status--error { color: #EF4444; }
        .tt-char-count {
          font-family: var(--font-mono);
          font-size: 11.5px;
          color: var(--text-muted);
        }
        .tt-char-count--error { color: #EF4444; }
        .tt-char-count--warn  { color: #F59E0B; }


        /* ─────────────────────────────
           BUTTONS
        ───────────────────────────── */
        .tt-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: var(--font-body);
          font-weight: 600;
          border-radius: var(--radius-md);
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          white-space: nowrap;
        }
        .tt-btn--full { width: 100%; }
        .tt-btn--primary {
          padding: 14px 24px;
          font-size: 15px;
          background: var(--blue-600);
          color: #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(37,99,235,0.3);
        }
        .tt-btn--primary:hover:not(:disabled) {
          background: var(--blue-500);
          box-shadow: 0 1px 3px rgba(0,0,0,0.3), 0 6px 20px rgba(37,99,235,0.45);
          transform: translateY(-1px);
        }
        .tt-btn--primary:active:not(:disabled) { transform: translateY(0); }
        .tt-btn--primary:disabled {
          background: var(--bg-elevated);
          color: var(--text-muted);
          box-shadow: none;
          cursor: not-allowed;
        }
        .tt-btn--secondary {
          padding: 11px 20px;
          font-size: 13.5px;
          background: var(--bg-elevated);
          color: var(--text-secondary);
          border: 1px solid var(--border-default);
        }
        .tt-btn--secondary:hover {
          background: var(--bg-card-hover);
          color: var(--text-primary);
          border-color: var(--border-strong);
        }
        .tt-btn--upgrade {
          padding: 13px 24px;
          font-size: 14px;
          background: var(--blue-600);
          color: #fff;
          box-shadow: 0 4px 16px rgba(37,99,235,0.35);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .tt-btn--upgrade:hover:not(:disabled) {
          background: var(--blue-500);
          transform: translateY(-1px);
        }


        /* Pay group */
        .tt-pay-group { display: flex; flex-direction: column; gap: 12px; }
        .tt-pay-meta {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-muted);
        }
        .tt-meta-dot { color: var(--border-strong); }


        /* Spinner */
        .tt-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }


        /* ─────────────────────────────
           LOADING PANEL
        ───────────────────────────── */
        .tt-loading-panel {
          background: var(--bg-card);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-2xl);
          padding: 48px 32px;
          text-align: center;
          margin-bottom: 24px;
        }
        .tt-loading-pulse {
          position: relative;
          width: 56px;
          height: 56px;
          margin: 0 auto 28px;
        }
        .tt-loading-ring {
          position: absolute;
          inset: 0;
          border: 2px solid transparent;
          border-top-color: var(--blue-500);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        .tt-loading-ring--2 {
          inset: 8px;
          border-top-color: var(--blue-300);
          animation-duration: 0.7s;
          animation-direction: reverse;
        }
        .tt-loading-text h3 {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }
        .tt-loading-msg {
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--blue-400);
          margin-bottom: 24px;
        }
        .tt-loading-steps {
          display: flex;
          justify-content: center;
          gap: 6px;
        }
        .tt-loading-step {
          width: 24px; height: 3px;
          background: var(--border-default);
          border-radius: 2px;
          transition: background 0.3s;
        }
        .tt-loading-step.active {
          background: var(--blue-500);
        }


        /* ─────────────────────────────
           ERROR PANEL
        ───────────────────────────── */
        .tt-error-panel {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          background: rgba(239,68,68,0.06);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: var(--radius-lg);
          padding: 18px 20px;
          margin-bottom: 24px;
        }
        .tt-error-icon { flex-shrink: 0; padding-top: 2px; }
        .tt-error-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #EF4444;
          margin-bottom: 3px;
        }
        .tt-error-msg {
          font-size: 13px;
          color: #FCA5A5;
          line-height: 1.5;
        }


        /* ─────────────────────────────
           RESULTS
        ───────────────────────────── */
        .tt-results {
          background: var(--bg-card);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-2xl);
          overflow: hidden;
          margin-bottom: 24px;
          box-shadow: var(--shadow-panel);
        }
        .tt-results-header {
          padding: 28px 32px 24px;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          background: var(--bg-elevated);
        }
        .tt-results-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .tt-results-title {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }
        .tt-sample-badge {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          color: #F59E0B;
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.2);
          padding: 3px 8px;
          border-radius: 4px;
        }
        .tt-risk-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 18px;
          border: 1px solid;
          border-radius: var(--radius-md);
          font-size: 13px;
          font-weight: 700;
        }
        .tt-risk-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .tt-risk-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          opacity: 0.7;
        }
        .tt-risk-level {
          font-family: var(--font-mono);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
        }


        /* Analysis body */
        .tt-analysis-body {
          padding: 32px;
        }
        .tt-analysis-h1 {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.025em;
          margin: 36px 0 14px;
        }
        .tt-analysis-h1:first-child { margin-top: 0; }
        .tt-analysis-h2 {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin: 28px 0 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border-subtle);
        }
        .tt-analysis-h3 {
          font-size: 14px;
          font-weight: 700;
          color: var(--blue-400);
          letter-spacing: -0.01em;
          margin: 20px 0 8px;
          font-family: var(--font-body);
        }
        .tt-analysis-p {
          font-size: 14px;
          color: #94A3B8;
          line-height: 1.75;
          margin-bottom: 10px;
        }
        .tt-bold {
          color: var(--text-primary);
          font-weight: 600;
        }
        .tt-analysis-bullet {
          display: flex;
          gap: 12px;
          margin-bottom: 8px;
          font-size: 14px;
          color: #94A3B8;
          line-height: 1.65;
        }
        .tt-bullet-mark {
          color: var(--blue-500);
          font-weight: 600;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .tt-analysis-numbered {
          display: flex;
          gap: 12px;
          margin-bottom: 8px;
          font-size: 14px;
          color: #94A3B8;
          line-height: 1.65;
        }
        .tt-num-mark {
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 600;
          color: var(--blue-400);
          min-width: 20px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .tt-analysis-spacer { height: 12px; }


        /* Results actions */
        .tt-results-actions {
          padding: 20px 32px;
          border-top: 1px solid var(--border-subtle);
          background: var(--bg-elevated);
          display: flex;
          gap: 12px;
        }


        /* Upgrade CTA */
        .tt-upgrade-cta {
          margin: 0 32px 32px;
          background: linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(59,130,246,0.06) 100%);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: var(--radius-xl);
          padding: 28px 28px;
        }
        .tt-upgrade-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }
        .tt-upgrade-title {
          font-family: var(--font-display);
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }
        .tt-upgrade-desc {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.55;
        }


        /* ─────────────────────────────
           ACTIONS
        ───────────────────────────── */
        .tt-actions { display: flex; flex-direction: column; gap: 0; }


        /* ─────────────────────────────
           FAQ
        ───────────────────────────── */
        .tt-faq {
          margin: 64px 0 48px;
        }
        .tt-section-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .tt-section-title {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.03em;
          margin-bottom: 8px;
        }
        .tt-section-sub {
          font-size: 14px;
          color: var(--text-muted);
        }
        .tt-faq-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 640px) {
          .tt-faq-grid { grid-template-columns: 1fr; }
        }
        .tt-faq-card {
          background: var(--bg-card);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: 22px 22px;
          transition: border-color 0.2s, background 0.2s;
        }
        .tt-faq-card:hover {
          border-color: var(--border-strong);
          background: var(--bg-card-hover);
        }
        .tt-faq-q {
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 10px;
          letter-spacing: -0.01em;
        }
        .tt-faq-a {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.65;
        }


        /* ─────────────────────────────
           FOOTER
        ───────────────────────────── */
        .tt-footer {
          padding: 40px 0 0;
          border-top: 1px solid var(--border-subtle);
          text-align: center;
        }
        .tt-footer-trust {
          display: flex;
          justify-content: center;
          gap: 32px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .tt-trust-item {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12.5px;
          color: var(--text-muted);
        }
        .tt-footer-links {
          display: flex;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .tt-footer-links a {
          font-size: 13px;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.15s;
        }
        .tt-footer-links a:hover { color: var(--text-primary); }
        .tt-footer-copy {
          font-size: 12px;
          color: var(--text-muted);
          padding-bottom: 32px;
        }


        /* ─────────────────────────────
           RESPONSIVE
        ───────────────────────────── */
        @media (max-width: 640px) {
          .tt-panel { padding: 20px; }
          .tt-panel-header { flex-direction: column; gap: 12px; }
          .tt-results-header { padding: 20px 20px 16px; }
          .tt-analysis-body { padding: 20px; }
          .tt-results-actions { padding: 16px 20px; }
          .tt-upgrade-cta { margin: 0 16px 20px; }
          .tt-upgrade-content { flex-direction: column; }
          .tt-hero { padding: 48px 0 40px; }
          .tt-footer-trust { gap: 16px; }
        }
      `}</style>
    </>
  );
}

