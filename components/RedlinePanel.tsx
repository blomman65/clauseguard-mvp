import { useState } from "react";
import type { RedlineClause } from "../pages/api/redline";

interface RedlinePanelProps {
  contractText: string;
  analysis: string;
  isSample: boolean;
}

export default function RedlinePanel({ contractText, analysis, isSample }: RedlinePanelProps) {
  const [loading, setLoading] = useState(false);
  const [clauses, setClauses] = useState<RedlineClause[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(0);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setClauses(null);

    try {
      const res = await fetch("/api/redline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractText, analysis }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate redlines");
      setClauses(data.clauses);
      setExpanded(0);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const riskColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    HIGH:   { bg: "rgba(239,68,68,0.07)",   border: "rgba(239,68,68,0.22)",   text: "#f87171", dot: "#ef4444" },
    MEDIUM: { bg: "rgba(245,158,11,0.07)",  border: "rgba(245,158,11,0.22)",  text: "#fbbf24", dot: "#f59e0b" },
    LOW:    { bg: "rgba(16,185,129,0.07)",  border: "rgba(16,185,129,0.22)",  text: "#34d399", dot: "#10b981" },
  };

  return (
    <div className="redline-root">
      {/* Header / trigger */}
      <div className="redline-header">
        <div className="redline-header-left">
          <div className="redline-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8h12M8 2v12" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round"/>
              <rect x="1" y="1" width="14" height="14" rx="3" stroke="#60A5FA" strokeWidth="1.2" strokeDasharray="2 2"/>
            </svg>
          </div>
          <div>
            <h3 className="redline-title">Redline Generator</h3>
            <p className="redline-sub">
              Rewrites every risky clause into customer-friendly language
            </p>
          </div>
        </div>

        {!clauses && !loading && (
          <button onClick={generate} className="btn-redline">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M1.5 11L5 7.5M11.5 1.5l-4 4M8 2l3 3-6 6-3-1 1-3 5-5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Generate Redlines
          </button>
        )}

        {clauses && (
          <div className="redline-done-badge">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="#10b981" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {clauses.length} clauses rewritten
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="redline-loading">
          <div className="redline-loading-inner">
            <div className="rl-spinner">
              <div className="rl-ring rl-ring-1" />
              <div className="rl-ring rl-ring-2" />
            </div>
            <div>
              <div className="rl-loading-title">Rewriting risky clauses…</div>
              <div className="rl-loading-sub">Generating customer-friendly language for all identified risks</div>
            </div>
          </div>
          <div className="rl-progress">
            <div className="rl-progress-bar" />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="redline-error">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flexShrink:0}}>
            <circle cx="7" cy="7" r="6" stroke="#f87171" strokeWidth="1.2"/>
            <path d="M7 4.5v3.5M7 9.5v.3" stroke="#f87171" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <span>{error}</span>
          <button onClick={generate} className="retry-btn">Retry</button>
        </div>
      )}

      {/* Clause list */}
      {clauses && clauses.length > 0 && (
        <div className="clauses-list">
          {clauses.map((clause, i) => {
            const colors = riskColors[clause.riskLevel] || riskColors.LOW;
            const isOpen = expanded === i;

            return (
              <div
                key={i}
                className={`clause-item${isOpen ? " clause-item--open" : ""}`}
                style={{ borderColor: isOpen ? colors.border : "rgba(255,255,255,0.06)" }}
              >
                {/* Clause header */}
                <button
                  className="clause-trigger"
                  onClick={() => setExpanded(isOpen ? null : i)}
                >
                  <div className="clause-trigger-left">
                    <span
                      className="risk-pip"
                      style={{ background: colors.dot }}
                    />
                    <span className="clause-name">{clause.clauseTitle}</span>
                    <span
                      className="risk-tag"
                      style={{
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                        color: colors.text,
                      }}
                    >
                      {clause.riskLevel}
                    </span>
                  </div>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s",
                      flexShrink: 0,
                      color: "#475569",
                    }}
                  >
                    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Diff body */}
                {isOpen && (
                  <div className="clause-body">
                    <div className="diff-grid">
                      {/* Original */}
                      <div className="diff-col diff-col--original">
                        <div className="diff-label diff-label--original">
                          <span className="diff-dot diff-dot--red" />
                          Original
                        </div>
                        <div className="diff-text diff-text--original">
                          {clause.original}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="diff-arrow">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M4 10h12M12 6l4 4-4 4" stroke="#475569" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>

                      {/* Redlined */}
                      <div className="diff-col diff-col--redlined">
                        <div className="diff-label diff-label--redlined">
                          <span className="diff-dot diff-dot--green" />
                          Customer-friendly rewrite
                        </div>
                        <div className="diff-text diff-text--redlined">
                          {clause.redlined}
                        </div>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="clause-explanation">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{flexShrink:0, marginTop:1}}>
                        <circle cx="6" cy="6" r="5" stroke="#60A5FA" strokeWidth="1.1"/>
                        <path d="M6 5v3.5M6 3.5v.3" stroke="#60A5FA" strokeWidth="1.1" strokeLinecap="round"/>
                      </svg>
                      <span>{clause.explanation}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isSample && clauses && (
        <div className="sample-note">
          This is a sample analysis. Your real contract will have its own specific redlines.
        </div>
      )}

      <style jsx>{`
        .redline-root {
          background: #0A1628;
          border: 1px solid rgba(59,130,246,0.16);
          border-radius: 20px;
          overflow: hidden;
          margin-top: 16px;
        }

        /* Header */
        .redline-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 22px 28px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          flex-wrap: wrap;
        }
        .redline-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .redline-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.16);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .redline-title {
          font-family: 'Sora', system-ui, sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #F1F5F9;
          letter-spacing: -0.02em;
          margin-bottom: 2px;
        }
        .redline-sub {
          font-size: 12.5px;
          color: #475569;
          line-height: 1.4;
        }

        /* Trigger button */
        .btn-redline {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 600;
          padding: 9px 18px;
          border-radius: 10px;
          cursor: pointer;
          background: rgba(37,99,235,0.15);
          color: #60A5FA;
          border: 1px solid rgba(59,130,246,0.28);
          transition: all 0.15s;
          white-space: nowrap;
        }
        .btn-redline:hover {
          background: rgba(37,99,235,0.25);
          border-color: rgba(59,130,246,0.45);
          color: #93C5FD;
        }

        .redline-done-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          color: #10B981;
          background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.2);
          padding: 6px 12px;
          border-radius: 7px;
        }

        /* Loading */
        .redline-loading {
          padding: 32px 28px;
        }
        .redline-loading-inner {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-bottom: 20px;
        }
        .rl-spinner {
          position: relative;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
        }
        .rl-ring {
          position: absolute;
          inset: 0;
          border: 2px solid transparent;
          border-radius: 50%;
        }
        .rl-ring-1 {
          border-top-color: #3B82F6;
          animation: spin 1s linear infinite;
        }
        .rl-ring-2 {
          inset: 7px;
          border-top-color: #60A5FA;
          animation: spin 0.65s linear infinite reverse;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .rl-loading-title {
          font-family: 'Sora', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #E2E8F0;
          margin-bottom: 4px;
        }
        .rl-loading-sub {
          font-size: 12.5px;
          color: #475569;
        }
        .rl-progress {
          height: 2px;
          background: rgba(255,255,255,0.05);
          border-radius: 1px;
          overflow: hidden;
        }
        .rl-progress-bar {
          height: 100%;
          width: 45%;
          background: linear-gradient(90deg, #2563EB, #60A5FA);
          border-radius: 1px;
          animation: slide 1.8s ease-in-out infinite;
        }
        @keyframes slide {
          0%   { transform: translateX(-150%); }
          100% { transform: translateX(280%); }
        }

        /* Error */
        .redline-error {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          margin: 16px 28px;
          background: rgba(239,68,68,0.06);
          border: 1px solid rgba(239,68,68,0.18);
          border-radius: 10px;
          font-size: 13px;
          color: #fca5a5;
        }
        .retry-btn {
          margin-left: auto;
          font-size: 12px;
          font-weight: 600;
          color: #60A5FA;
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 4px;
          transition: background 0.15s;
        }
        .retry-btn:hover { background: rgba(59,130,246,0.1); }

        /* Clause list */
        .clauses-list {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .clause-item {
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
          transition: border-color 0.2s;
          background: rgba(6,15,30,0.4);
        }
        .clause-item--open {
          background: rgba(6,15,30,0.7);
        }

        /* Clause trigger */
        .clause-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          background: none;
          border: none;
          cursor: pointer;
          gap: 12px;
          text-align: left;
          transition: background 0.15s;
        }
        .clause-trigger:hover { background: rgba(255,255,255,0.02); }
        .clause-trigger-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }
        .risk-pip {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .clause-name {
          font-size: 13.5px;
          font-weight: 600;
          color: #E2E8F0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .risk-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.06em;
          padding: 3px 8px;
          border-radius: 5px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* Diff body */
        .clause-body {
          padding: 0 18px 18px;
        }

        .diff-grid {
          display: grid;
          grid-template-columns: 1fr 28px 1fr;
          gap: 8px;
          align-items: start;
          margin-bottom: 12px;
        }
        @media(max-width: 640px) {
          .diff-grid {
            grid-template-columns: 1fr;
          }
          .diff-arrow { display: none; }
        }

        .diff-col {
          border-radius: 10px;
          overflow: hidden;
        }
        .diff-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 8px 12px;
        }
        .diff-col--original .diff-label {
          background: rgba(239,68,68,0.08);
          color: #f87171;
          border-bottom: 1px solid rgba(239,68,68,0.12);
        }
        .diff-col--redlined .diff-label {
          background: rgba(16,185,129,0.08);
          color: #34d399;
          border-bottom: 1px solid rgba(16,185,129,0.12);
        }
        .diff-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .diff-dot--red { background: #ef4444; }
        .diff-dot--green { background: #10b981; }

        .diff-text {
          font-size: 13px;
          line-height: 1.7;
          padding: 12px;
        }
        .diff-col--original {
          background: rgba(239,68,68,0.04);
          border: 1px solid rgba(239,68,68,0.12);
        }
        .diff-col--original .diff-text {
          color: #fca5a5;
          text-decoration: line-through;
          text-decoration-color: rgba(239,68,68,0.4);
        }
        .diff-col--redlined {
          background: rgba(16,185,129,0.04);
          border: 1px solid rgba(16,185,129,0.12);
        }
        .diff-col--redlined .diff-text {
          color: #a7f3d0;
        }

        .diff-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          padding-top: 36px;
        }

        /* Explanation */
        .clause-explanation {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 14px;
          background: rgba(59,130,246,0.05);
          border: 1px solid rgba(59,130,246,0.12);
          border-radius: 9px;
          font-size: 12.5px;
          color: #94A3B8;
          line-height: 1.55;
        }

        /* Sample note */
        .sample-note {
          margin: 0 20px 16px;
          font-size: 12px;
          color: #475569;
          text-align: center;
          padding: 10px;
          border-top: 1px solid rgba(255,255,255,0.04);
        }
      `}</style>
    </div>
  );
}