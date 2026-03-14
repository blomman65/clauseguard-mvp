import RedlinePanel from "../components/RedlinePanel";
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
    if (file.type !== "application/pdf") { setPdfError("Only PDF files are accepted."); return; }
    if (file.size > 10 * 1024 * 1024) { setPdfError("File too large. Maximum size is 10 MB."); return; }
    setPdfLoading(true); setPdfError(null); setError(null);
    const formData = new FormData();
    formData.append("pdf", file);
    try {
      const res = await fetch("/api/parse-pdf", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to parse PDF.");
      setContractText(data.text);
      setIsSample(false); setAnalysis(""); setRiskLevel(null);
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

  const riskConfig: Record<string, { bg: string; border: string; text: string; dot: string; glow: string }> = {
    HIGH:   { bg: "rgba(239,68,68,0.07)",    border: "rgba(239,68,68,0.25)",    text: "#f87171", dot: "#ef4444", glow: "rgba(239,68,68,0.15)" },
    MEDIUM: { bg: "rgba(245,158,11,0.07)",   border: "rgba(245,158,11,0.25)",   text: "#fbbf24", dot: "#f59e0b", glow: "rgba(245,158,11,0.15)" },
    LOW:    { bg: "rgba(16,185,129,0.07)",   border: "rgba(16,185,129,0.25)",   text: "#34d399", dot: "#10b981", glow: "rgba(16,185,129,0.15)" },
  };

  const parseBold = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const rx = /\*\*(.+?)\*\*/g;
    let last = 0, m;
    while ((m = rx.exec(text)) !== null) {
      if (m.index > last) parts.push(text.substring(last, m.index));
      parts.push(<strong key={m.index} style={{ color: "#f1f5f9", fontWeight: 600 }}>{m[1]}</strong>);
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push(text.substring(last));
    return parts.length > 0 ? parts : [text];
  };

  const renderLine = (line: string, index: number): React.ReactNode => {
    const t = line.trim();
    if (index === 0 && t.toUpperCase().startsWith("OVERALL RISK LEVEL:")) return null;
    if (index === 1 && t === "") return null;
    if (t.startsWith("### ")) return <h4 key={index} className="r-h3">{t.replace(/^###\s*/, "")}</h4>;
    if (t.startsWith("## "))  return <h3 key={index} className="r-h2">{t.replace(/^##\s*/, "")}</h3>;
    if (t.startsWith("# "))   return <h2 key={index} className="r-h1">{t.replace(/^#\s*/, "")}</h2>;
    const norm = t.replace(/^[•*]\s*/, "- ");
    if (norm.startsWith("- ")) return (
      <div key={index} className="r-bullet">
        <span className="r-dash">—</span>
        <span>{parseBold(norm.replace(/^-\s*/, ""))}</span>
      </div>
    );
    if (/^\d+\./.test(t)) {
      const match = t.match(/^(\d+)\./);
      return (
        <div key={index} className="r-num">
          <span className="r-num-label">{match?.[1]}</span>
          <span>{parseBold(t.replace(/^\d+\.\s*/, ""))}</span>
        </div>
      );
    }
    if (t === "") return <div key={index} style={{ height: 14 }} />;
    return <p key={index} className="r-p">{parseBold(line)}</p>;
  };

  return (
    <>
      <Meta />

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="nav-inner">
          <a href="/" className="logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L22 7V17L12 22L2 17V7L12 2Z" stroke="#3B82F6" strokeWidth="1.6" fill="none"/>
              <path d="M12 7L17 9.5V14.5L12 17L7 14.5V9.5L12 7Z" fill="#3B82F6" fillOpacity="0.3"/>
            </svg>
            <span className="logo-text">TrustTerms</span>
          </a>
          <div className="nav-right">
            <a href="/about" className="nav-link">About</a>
            <a href="/contact" className="nav-link">Support</a>
          </div>
        </div>
      </nav>

      {/* ── DISCLAIMER ── */}
      <div className="disclaimer">
        <div className="disclaimer-inner">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{flexShrink:0}}>
            <circle cx="6.5" cy="6.5" r="5.5" stroke="#60A5FA" strokeWidth="1.1"/>
            <path d="M6.5 5.5v3.5M6.5 4v.3" stroke="#60A5FA" strokeWidth="1.1" strokeLinecap="round"/>
          </svg>
          <span><strong>Not legal advice.</strong> This tool provides general information only. Always consult a qualified lawyer before signing contracts.</span>
        </div>
      </div>

      <main className="main">

        {/* ── HERO ── */}
        <section className="hero">
          <div className="hero-badge">
            <span className="pulse-dot" />
            AI-Powered Contract Intelligence
          </div>
          <h1 className="hero-h1">
            Spot hidden risks<br />
            <span className="hero-gradient">before you sign</span>
          </h1>
          <p className="hero-sub">
            Enterprise-grade SaaS contract analysis in under 60 seconds.<br />
            Built for founders and CFOs who can't afford costly surprises.
          </p>
          <div className="stats-row">
            {[
              { val: "60s",  lbl: "Average analysis time" },
              { val: "5+",   lbl: "Risk categories checked" },
              { val: "100%", lbl: "Privacy-first processing" },
            ].map((s, i) => (
              <div key={i} className="stat">
                <div className="stat-val">{s.val}</div>
                <div className="stat-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURE CARDS ── */}
        <div className="features">
          {[
            {
              color: "#ef4444",
              icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="9" cy="9" r="5.5" stroke="#f87171" strokeWidth="1.4"/>
                  <path d="M13.5 13.5L17 17" stroke="#f87171" strokeWidth="1.4" strokeLinecap="round"/>
                  <path d="M9 6.5V9.5l1.5 1.5" stroke="#f87171" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              ),
              title: "Hidden Risk Detection",
              desc: "Auto-renewals, liability caps, and termination traps — flagged before they cost you.",
            },
            {
              color: "#3B82F6",
              icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 10h14M3 6h9M3 14h6" stroke="#60A5FA" strokeWidth="1.4" strokeLinecap="round"/>
                  <rect x="13" y="11" width="5" height="6" rx="1" stroke="#60A5FA" strokeWidth="1.3"/>
                  <path d="M14 11V9a1.5 1.5 0 013 0v2" stroke="#60A5FA" strokeWidth="1.3"/>
                </svg>
              ),
              title: "Financial Impact Analysis",
              desc: "Quantified dollar exposure — business consequences, not legal jargon.",
            },
            {
              color: "#10B981",
              icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 3l2.5 5h5.5L14 11.5l1.5 5.5L10 14l-5.5 3 1.5-5.5L2 8h5.5z" stroke="#34d399" strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
                </svg>
              ),
              title: "Negotiation Playbook",
              desc: "Ranked priorities with exact language to push back — not just 'negotiate this'.",
            },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon" style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}>
                {f.icon}
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* ── ANALYSIS PANEL ── */}
        <div className="panel">
          <div className="panel-glow-line" />

          <div className="panel-head">
            <div>
              <h2 className="panel-title">Contract Analysis</h2>
              <p className="panel-sub">Paste your SaaS agreement or upload a PDF below.</p>
            </div>
            <div className="panel-actions">
              <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handlePdfUpload} style={{ display: "none" }} />
              <button onClick={() => fileInputRef.current?.click()} disabled={loading || pdfLoading} className="btn-outline btn-outline--green">
                {pdfLoading ? (
                  <><span className="spinner spinner--sm" /> Reading…</>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M6.5 8.5V2M4 4.5l2.5-2.5L9 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M1.5 10v.5a1 1 0 001 1h9a1 1 0 001-1V10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    Upload PDF
                  </>
                )}
              </button>
              <button onClick={handleSampleClick} disabled={loading || pdfLoading} className="btn-outline btn-outline--blue">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <rect x="1.5" y="1.5" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M4 4.5h5M4 6.5h5M4 8.5h3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                </svg>
                Try sample (free)
              </button>
            </div>
          </div>

          {pdfError && (
            <div className="inline-alert inline-alert--red">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.1"/><path d="M6 4v3M6 8.2v.1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>
              {pdfError}
            </div>
          )}

          {accessToken && (
            <div className="token-active">
              <span className="token-dot" />
              Access token active — ready to analyze your contract
            </div>
          )}

          <div className="textarea-wrap">
            <textarea
              className={`contract-input${isOverLimit ? " contract-input--over" : ""}`}
              placeholder={"Paste your SaaS agreement here…\n\nOr click \"Try sample\" above to see a free demo analysis."}
              value={contractText}
              onChange={(e) => {
                setContractText(e.target.value);
                setIsSample(false);
                if (error) setError(null);
                if (pdfError) setPdfError(null);
              }}
              disabled={loading || pdfLoading}
            />
            {isSample && <div className="sample-tag">SAMPLE</div>}
            {pdfLoading && (
              <div className="textarea-overlay">
                <span className="spinner" />
                <span>Extracting text from PDF…</span>
              </div>
            )}
          </div>

          <div className="char-row">
            <div className={`char-status${canAnalyze ? " char-status--ok" : isOverLimit ? " char-status--err" : ""}`}>
              {canAnalyze && (
                <><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>Ready to analyze</>
              )}
              {contractText.length > 0 && contractText.length < 50 && "Minimum 50 characters required"}
              {!contractText.length && "Paste your contract to get started"}
              {isOverLimit && "Contract too long — please shorten it"}
            </div>
            <div className={`char-count${isOverLimit ? " char-count--err" : charCount > MAX_CONTRACT_LENGTH * 0.9 ? " char-count--warn" : ""}`}>
              {charCount.toLocaleString()} / {MAX_CONTRACT_LENGTH.toLocaleString()}
            </div>
          </div>

          {/* CTA */}
          {(accessToken || isSample) ? (
            <button onClick={analyze} disabled={loading || !canAnalyze} className="btn-primary">
              {loading ? (
                <><span className="spinner" />Analyzing contract…</>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  Analyze Contract
                </>
              )}
            </button>
          ) : (
            <div className="pay-wrap">
              <button onClick={pay} disabled={checkoutLoading} className="btn-primary">
                {checkoutLoading ? (
                  <><span className="spinner" />Loading checkout…</>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="2" y="5" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 5V4a2.5 2.5 0 015 0v1" stroke="currentColor" strokeWidth="1.4"/><path d="M2 8.5h11" stroke="currentColor" strokeWidth="1.2"/></svg>
                    Pay 149 kr — Analyze My Contract
                  </>
                )}
              </button>
              <p className="pay-meta">One-time payment · No subscription · Instant access</p>
            </div>
          )}
        </div>

        {/* ── LOADING ── */}
        {loading && (
          <div className="loading-panel">
            <div className="loading-rings">
              <div className="ring ring-1" />
              <div className="ring ring-2" />
            </div>
            <h3 className="loading-title">Analyzing {isSample ? "sample" : "your"} contract</h3>
            <p className="loading-msg">{loadingMessage}</p>
            <div className="loading-dots">
              {loadingMessages.map((m, i) => (
                <span key={i} className={`dot${loadingMessage === m ? " dot--active" : ""}`} />
              ))}
            </div>
          </div>
        )}

        {/* ── ERROR ── */}
        {error && (
          <div className="error-panel">
            <div className="error-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7.5" stroke="#f87171" strokeWidth="1.5"/>
                <path d="M9 6v4M9 11.5v.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="error-title">Analysis Error</div>
              <div className="error-msg">{error}</div>
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {analysis && (
          <div className="results">
            <div className="results-head">
              <div className="results-head-left">
                <h2 className="results-title">Analysis Report</h2>
                {isSample && <span className="badge-sample">SAMPLE</span>}
              </div>
              {riskLevel && (
                <div
                  className="risk-badge"
                  style={{
                    background: riskConfig[riskLevel].bg,
                    border: `1px solid ${riskConfig[riskLevel].border}`,
                    color: riskConfig[riskLevel].text,
                    boxShadow: `0 0 20px ${riskConfig[riskLevel].glow}`,
                  }}
                >
                  <span className="risk-dot" style={{ background: riskConfig[riskLevel].dot }} />
                  <span className="risk-label-txt">Overall Risk</span>
                  <span className="risk-level-txt">{riskLevel}</span>
                </div>
              )}
            </div>

            <div className="results-body">
              {analysis.split("\n").map((line, i) => renderLine(line, i))}
            </div>

            <div className="results-foot">
              <button onClick={downloadPdf} className="btn-secondary">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 9.5V2M4.5 7L7 9.5 9.5 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1.5 11v.5a1 1 0 001 1h9a1 1 0 001-1V11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Download PDF Report
              </button>
            </div>

            <div style={{ padding: "0 32px 24px" }}>
  <RedlinePanel
    contractText={contractText}
    analysis={analysis}
    isSample={isSample}
  />
</div>
            {isSample && (
              <div className="upgrade-cta">
                <div className="upgrade-left">
                  <h3 className="upgrade-title">Ready to analyze your real contract?</h3>
                  <p className="upgrade-desc">Get the same depth of analysis on your actual agreements — one-time payment, instant access.</p>
                </div>
                <button onClick={pay} disabled={checkoutLoading} className="btn-primary btn-primary--auto">
                  {checkoutLoading ? "Loading…" : "Analyze My Contract — 149 kr"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── FAQ ── */}
        <section className="faq">
          <div className="section-head">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-sub">Everything you need to know</p>
          </div>
          <div className="faq-grid">
            {[
              {
                q: "Are my contracts safe?",
                a: "We do not store your contracts or use them to train AI models. Your contract is processed via OpenAI's API, which retains data for up to 30 days for abuse monitoring before permanent deletion.",
              },
              {
                q: "Is this legal advice?",
                a: "No. The analysis provides general information and risk indicators only — not legal advice. Always consult a qualified lawyer before making legally binding decisions.",
              },
              {
                q: "How accurate is the AI analysis?",
                a: "Our AI benchmarks clauses against common market standards for SaaS agreements. It is designed as a first-pass review to identify potential risks before a full legal review.",
              },
              {
                q: "What happens after I pay?",
                a: "You get instant access. Paste your contract above and click Analyze. Results are typically delivered in under 60 seconds.",
              },
            ].map((item, i) => (
              <div key={i} className="faq-card">
                <h3 className="faq-q">{item.q}</h3>
                <p className="faq-a">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="footer">
          <div className="footer-trust">
            {[
              { icon: "🔒", text: "Processed securely via HTTPS" },
              { icon: "🗑", text: "Never stored on our servers" },
              { icon: "🇪🇺", text: "GDPR compliant" },
            ].map((t, i) => (
              <div key={i} className="trust-item">
                <span>{t.icon}</span>
                <span>{t.text}</span>
              </div>
            ))}
          </div>
          <div className="footer-links">
            <a href="/about">About</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/contact">Contact</a>
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} TrustTerms. All rights reserved.</p>
        </footer>

      </main>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:       #030B18;
          --surface:  #060F1E;
          --card:     #0A1628;
          --card-2:   #0D1B30;
          --b-subtle: rgba(255,255,255,0.05);
          --b-def:    rgba(255,255,255,0.08);
          --b-strong: rgba(255,255,255,0.14);
          --blue:     #3B82F6;
          --blue-lt:  #60A5FA;
          --blue-dk:  #2563EB;
          --green:    #10B981;
          --text-1:   #F1F5F9;
          --text-2:   #94A3B8;
          --text-3:   #475569;
          --font-h: 'Sora', system-ui, sans-serif;
          --font-b: 'DM Sans', system-ui, sans-serif;
          --font-m: 'JetBrains Mono', monospace;
        }

        html { scroll-behavior: smooth; }

        body {
          background: var(--bg);
          color: var(--text-1);
          font-family: var(--font-b);
          font-size: 15px;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          background-image:
            radial-gradient(ellipse 80% 40% at 50% -5%, rgba(37,99,235,0.13) 0%, transparent 65%);
        }

        /* ── NAV ── */
        .nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(3,11,24,0.88);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--b-subtle);
        }
        .nav-inner {
          max-width: 880px; margin: 0 auto; padding: 0 24px;
          height: 58px; display: flex; align-items: center; justify-content: space-between;
        }
        .logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none;
        }
        .logo-text {
          font-family: var(--font-h); font-size: 16px; font-weight: 700;
          color: var(--text-1); letter-spacing: -0.02em;
        }
        .nav-right { display: flex; gap: 2px; }
        .nav-link {
          font-size: 13.5px; font-weight: 500; color: var(--text-2);
          text-decoration: none; padding: 6px 13px; border-radius: 8px;
          transition: color 0.15s, background 0.15s;
        }
        .nav-link:hover { color: var(--text-1); background: var(--card); }

        /* ── DISCLAIMER ── */
        .disclaimer {
          background: rgba(37,99,235,0.055);
          border-bottom: 1px solid rgba(59,130,246,0.12);
        }
        .disclaimer-inner {
          max-width: 880px; margin: 0 auto; padding: 9px 24px;
          display: flex; align-items: center; gap: 8px;
          font-size: 12.5px; color: var(--text-2);
        }
        .disclaimer-inner strong { color: var(--blue-lt); }

        /* ── MAIN ── */
        .main { max-width: 880px; margin: 0 auto; padding: 0 24px 80px; }

        /* ── HERO ── */
        .hero {
          padding: 72px 0 56px;
          text-align: center;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: var(--font-m); font-size: 11px; font-weight: 500;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--blue-lt);
          background: rgba(59,130,246,0.09);
          border: 1px solid rgba(59,130,246,0.2);
          padding: 6px 15px; border-radius: 100px; margin-bottom: 28px;
        }
        .pulse-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--blue-lt);
          box-shadow: 0 0 10px var(--blue);
          animation: pulse 2.2s ease infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.45;transform:scale(0.85)} }

        .hero-h1 {
          font-family: var(--font-h);
          font-size: clamp(38px, 5.5vw, 58px);
          font-weight: 800; line-height: 1.08;
          letter-spacing: -0.04em; color: var(--text-1);
          margin-bottom: 20px;
        }
        .hero-gradient {
          background: linear-gradient(130deg, #60A5FA 0%, #93C5FD 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          font-size: 16px; color: var(--text-2); max-width: 500px;
          margin: 0 auto 44px; line-height: 1.7;
        }

        .stats-row {
          display: inline-flex;
          border: 1px solid var(--b-def);
          border-radius: 16px; overflow: hidden;
          background: var(--card-2);
        }
        .stat {
          padding: 20px 28px; text-align: center;
          border-right: 1px solid var(--b-def);
        }
        .stat:last-child { border-right: none; }
        .stat-val {
          font-family: var(--font-h); font-size: 24px; font-weight: 800;
          color: var(--blue-lt); letter-spacing: -0.03em;
        }
        .stat-lbl {
          font-size: 11px; color: var(--text-3); margin-top: 4px;
          text-transform: uppercase; letter-spacing: 0.05em;
        }

        /* ── FEATURES ── */
        .features {
          display: grid; grid-template-columns: repeat(3,1fr);
          gap: 12px; margin-bottom: 36px;
        }
        @media(max-width:640px){ .features { grid-template-columns: 1fr; } }

        .feature-card {
          background: var(--card-2); border: 1px solid var(--b-def);
          border-radius: 16px; padding: 24px 22px;
          transition: border-color 0.2s, transform 0.2s;
        }
        .feature-card:hover { border-color: var(--b-strong); transform: translateY(-2px); }
        .feature-icon {
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px;
        }
        .feature-title {
          font-family: var(--font-h); font-size: 14px; font-weight: 700;
          color: var(--text-1); margin-bottom: 8px; letter-spacing: -0.01em;
        }
        .feature-desc { font-size: 13px; color: var(--text-2); line-height: 1.6; }

        /* ── PANEL ── */
        .panel {
          background: var(--card-2); border: 1px solid var(--b-def);
          border-radius: 24px; padding: 32px;
          position: relative; overflow: hidden;
          box-shadow: 0 4px 32px rgba(0,0,0,0.35);
          margin-bottom: 20px;
        }
        .panel-glow-line {
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.5) 50%, transparent 100%);
        }
        .panel-head {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 16px;
          margin-bottom: 22px; flex-wrap: wrap;
        }
        .panel-title {
          font-family: var(--font-h); font-size: 18px; font-weight: 700;
          color: var(--text-1); letter-spacing: -0.02em;
        }
        .panel-sub { font-size: 13px; color: var(--text-3); margin-top: 3px; }
        .panel-actions { display: flex; gap: 8px; flex-wrap: wrap; }

        .btn-outline {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: var(--font-b); font-size: 12.5px; font-weight: 600;
          padding: 7px 13px; border-radius: 9px; cursor: pointer;
          border: 1px solid; transition: all 0.15s; white-space: nowrap;
        }
        .btn-outline:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-outline--green {
          color: #34d399; background: rgba(16,185,129,0.07);
          border-color: rgba(16,185,129,0.22);
        }
        .btn-outline--green:hover:not(:disabled) { background: rgba(16,185,129,0.13); }
        .btn-outline--blue {
          color: var(--blue-lt); background: rgba(59,130,246,0.07);
          border-color: rgba(59,130,246,0.22);
        }
        .btn-outline--blue:hover:not(:disabled) { background: rgba(59,130,246,0.13); }

        .inline-alert {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; border-radius: 9px;
          font-size: 12.5px; margin-bottom: 14px; border: 1px solid;
        }
        .inline-alert--red {
          color: #fca5a5; background: rgba(239,68,68,0.07);
          border-color: rgba(239,68,68,0.2);
        }

        .token-active {
          display: flex; align-items: center; gap: 8px;
          background: rgba(16,185,129,0.07); border: 1px solid rgba(16,185,129,0.22);
          border-radius: 9px; padding: 10px 14px;
          font-size: 12.5px; color: #34d399; font-weight: 500;
          margin-bottom: 16px;
        }
        .token-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #10b981; flex-shrink: 0;
          animation: pulse 2s ease infinite;
        }

        .textarea-wrap { position: relative; margin-bottom: 12px; }
        .contract-input {
          width: 100%; height: 280px;
          padding: 18px 20px;
          font-family: var(--font-m); font-size: 13px; line-height: 1.65;
          color: #CBD5E1; background: var(--surface);
          border: 1px solid var(--b-def); border-radius: 14px;
          resize: vertical; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .contract-input::placeholder { color: var(--text-3); }
        .contract-input:focus {
          border-color: rgba(59,130,246,0.55);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        .contract-input--over {
          border-color: rgba(239,68,68,0.5) !important;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.08) !important;
        }
        .contract-input:disabled { opacity: 0.5; cursor: not-allowed; }

        .sample-tag {
          position: absolute; top: 12px; right: 12px;
          font-family: var(--font-m); font-size: 10px; font-weight: 500;
          letter-spacing: 0.1em; color: var(--blue-lt);
          background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.22);
          padding: 3px 8px; border-radius: 5px;
        }
        .textarea-overlay {
          position: absolute; inset: 0;
          background: rgba(6,15,30,0.75); border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          gap: 12px; font-size: 14px; color: var(--text-2);
        }

        .char-row {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 20px;
        }
        .char-status {
          display: flex; align-items: center; gap: 5px;
          font-size: 12px; color: var(--text-3);
        }
        .char-status--ok { color: #34d399; }
        .char-status--err { color: #f87171; }
        .char-count { font-family: var(--font-m); font-size: 11.5px; color: var(--text-3); }
        .char-count--err { color: #f87171; }
        .char-count--warn { color: #fbbf24; }

        /* ── BUTTONS ── */
        .btn-primary {
          width: 100%; display: inline-flex; align-items: center;
          justify-content: center; gap: 8px;
          font-family: var(--font-b); font-size: 15px; font-weight: 600;
          padding: 14px 24px; border-radius: 12px; border: none;
          background: var(--blue-dk); color: #fff; cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3), 0 6px 20px rgba(37,99,235,0.32);
          transition: all 0.18s;
        }
        .btn-primary:hover:not(:disabled) {
          background: var(--blue); transform: translateY(-1px);
          box-shadow: 0 1px 3px rgba(0,0,0,0.3), 0 8px 28px rgba(37,99,235,0.45);
        }
        .btn-primary:active:not(:disabled) { transform: translateY(0); }
        .btn-primary:disabled {
          background: var(--card); color: var(--text-3);
          box-shadow: none; cursor: not-allowed;
        }
        .btn-primary--auto { width: auto; flex-shrink: 0; font-size: 14px; }

        .btn-secondary {
          display: inline-flex; align-items: center; gap: 7px;
          font-family: var(--font-b); font-size: 13.5px; font-weight: 600;
          padding: 10px 18px; border-radius: 10px; cursor: pointer;
          background: var(--card); color: var(--text-2);
          border: 1px solid var(--b-def); transition: all 0.15s;
        }
        .btn-secondary:hover { background: var(--card-2); color: var(--text-1); border-color: var(--b-strong); }

        .pay-wrap { display: flex; flex-direction: column; gap: 12px; }
        .pay-meta { text-align: center; font-size: 12px; color: var(--text-3); }

        /* ── SPINNER ── */
        .spinner {
          width: 15px; height: 15px; border-radius: 50;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite; flex-shrink: 0;
        }
        .spinner--sm { width: 11px; height: 11px; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── LOADING ── */
        .loading-panel {
          background: var(--card-2); border: 1px solid var(--b-def);
          border-radius: 24px; padding: 52px 32px;
          text-align: center; margin-bottom: 20px;
        }
        .loading-rings {
          position: relative; width: 56px; height: 56px;
          margin: 0 auto 28px;
        }
        .ring {
          position: absolute; inset: 0; border-radius: 50%;
          border: 2px solid transparent;
        }
        .ring-1 {
          border-top-color: var(--blue);
          animation: spin 1s linear infinite;
        }
        .ring-2 {
          inset: 9px; border-top-color: var(--blue-lt);
          animation: spin 0.65s linear infinite reverse;
        }
        .loading-title {
          font-family: var(--font-h); font-size: 18px; font-weight: 700;
          color: var(--text-1); margin-bottom: 10px; letter-spacing: -0.02em;
        }
        .loading-msg {
          font-family: var(--font-m); font-size: 13px;
          color: var(--blue-lt); margin-bottom: 26px;
        }
        .loading-dots { display: flex; justify-content: center; gap: 6px; }
        .dot {
          width: 26px; height: 3px; border-radius: 2px;
          background: var(--b-def); transition: background 0.3s;
        }
        .dot--active { background: var(--blue); }

        /* ── ERROR ── */
        .error-panel {
          display: flex; align-items: flex-start; gap: 14px;
          background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 14px; padding: 18px 20px; margin-bottom: 20px;
        }
        .error-icon { flex-shrink: 0; padding-top: 1px; }
        .error-title { font-size: 13.5px; font-weight: 700; color: #f87171; margin-bottom: 3px; }
        .error-msg { font-size: 13px; color: #fca5a5; line-height: 1.5; }

        /* ── RESULTS ── */
        .results {
          background: var(--card-2); border: 1px solid var(--b-def);
          border-radius: 24px; overflow: hidden;
          box-shadow: 0 4px 32px rgba(0,0,0,0.3);
          margin-bottom: 20px;
        }
        .results-head {
          padding: 26px 32px 22px;
          background: var(--card);
          border-bottom: 1px solid var(--b-subtle);
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 16px; flex-wrap: wrap;
        }
        .results-head-left { display: flex; align-items: center; gap: 12px; }
        .results-title {
          font-family: var(--font-h); font-size: 18px; font-weight: 700;
          color: var(--text-1); letter-spacing: -0.02em;
        }
        .badge-sample {
          font-family: var(--font-m); font-size: 10px; letter-spacing: 0.1em;
          color: #fbbf24; background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.22);
          padding: 3px 8px; border-radius: 5px;
        }
        .risk-badge {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 10px 18px; border-radius: 10px;
          font-size: 13px; font-weight: 700;
          transition: box-shadow 0.3s;
        }
        .risk-dot {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
          animation: pulse 2s ease infinite;
        }
        .risk-label-txt {
          font-family: var(--font-m); font-size: 10px;
          letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.7;
        }
        .risk-level-txt {
          font-family: var(--font-m); font-size: 13px; font-weight: 700;
          letter-spacing: 0.06em;
        }

        .results-body { padding: 30px 32px; }

        /* Analysis typography */
        .r-h1 {
          font-family: var(--font-h); font-size: 20px; font-weight: 800;
          color: var(--text-1); margin: 36px 0 14px; letter-spacing: -0.025em;
        }
        .r-h2 {
          font-family: var(--font-h); font-size: 16px; font-weight: 700;
          color: var(--text-1); margin: 32px 0 12px; padding-bottom: 10px;
          border-bottom: 1px solid var(--b-subtle); letter-spacing: -0.02em;
        }
        .r-h3 {
          font-family: var(--font-b); font-size: 14px; font-weight: 700;
          color: var(--blue-lt); margin: 22px 0 8px;
        }
        .r-p { font-size: 14px; color: var(--text-2); line-height: 1.75; margin-bottom: 10px; }
        .r-bullet {
          display: flex; gap: 12px; margin-bottom: 8px;
          font-size: 14px; color: var(--text-2); line-height: 1.65;
        }
        .r-dash { color: var(--blue); font-weight: 700; flex-shrink: 0; }
        .r-num {
          display: flex; gap: 12px; margin-bottom: 8px;
          font-size: 14px; color: var(--text-2); line-height: 1.65;
        }
        .r-num-label {
          font-family: var(--font-m); font-size: 12px; font-weight: 600;
          color: var(--blue-lt); min-width: 20px; flex-shrink: 0; margin-top: 2px;
        }

        .results-foot {
          padding: 18px 32px;
          background: var(--card); border-top: 1px solid var(--b-subtle);
        }

        .upgrade-cta {
          margin: 0 32px 32px;
          background: linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(59,130,246,0.05) 100%);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: 18px; padding: 26px 28px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 24px; flex-wrap: wrap;
        }
        .upgrade-title {
          font-family: var(--font-h); font-size: 17px; font-weight: 700;
          color: var(--text-1); margin-bottom: 6px; letter-spacing: -0.02em;
        }
        .upgrade-desc { font-size: 13.5px; color: var(--text-2); line-height: 1.55; }

        /* ── FAQ ── */
        .faq { margin: 64px 0 48px; }
        .section-head { text-align: center; margin-bottom: 40px; }
        .section-title {
          font-family: var(--font-h); font-size: 28px; font-weight: 800;
          color: var(--text-1); letter-spacing: -0.03em; margin-bottom: 8px;
        }
        .section-sub { font-size: 14px; color: var(--text-3); }
        .faq-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
        }
        @media(max-width:640px){ .faq-grid { grid-template-columns: 1fr; } }
        .faq-card {
          background: var(--card-2); border: 1px solid var(--b-def);
          border-radius: 16px; padding: 24px;
          transition: border-color 0.2s, background 0.2s;
        }
        .faq-card:hover { border-color: var(--b-strong); background: #0f1e35; }
        .faq-q {
          font-family: var(--font-h); font-size: 14px; font-weight: 700;
          color: var(--text-1); margin-bottom: 10px; letter-spacing: -0.01em;
        }
        .faq-a { font-size: 13.5px; color: var(--text-2); line-height: 1.65; }

        /* ── FOOTER ── */
        .footer {
          padding: 40px 0 0; border-top: 1px solid var(--b-subtle);
          text-align: center;
        }
        .footer-trust {
          display: flex; justify-content: center; gap: 32px;
          flex-wrap: wrap; margin-bottom: 24px;
        }
        .trust-item {
          display: flex; align-items: center; gap: 7px;
          font-size: 12.5px; color: var(--text-3);
        }
        .footer-links {
          display: flex; justify-content: center; gap: 24px;
          flex-wrap: wrap; margin-bottom: 20px;
        }
        .footer-links a {
          font-size: 13px; color: var(--text-2);
          text-decoration: none; transition: color 0.15s;
        }
        .footer-links a:hover { color: var(--text-1); }
        .footer-copy { font-size: 12px; color: var(--text-3); padding-bottom: 32px; }

        /* ── RESPONSIVE ── */
        @media(max-width:640px){
          .hero { padding: 48px 0 36px; }
          .panel { padding: 20px; }
          .panel-head { flex-direction: column; }
          .results-head { padding: 20px; }
          .results-body { padding: 20px; }
          .results-foot { padding: 16px 20px; }
          .upgrade-cta { margin: 0 16px 20px; flex-direction: column; }
          .footer-trust { gap: 14px; }
          .stats-row { flex-direction: column; }
          .stat { border-right: none; border-bottom: 1px solid var(--b-def); }
          .stat:last-child { border-bottom: none; }
        }
      `}</style>
    </>
  );
}