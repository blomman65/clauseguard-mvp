import { useEffect, useState } from "react";

export default function Success() {
  const [status, setStatus] = useState<'verifying' | 'processing' | 'success' | 'error'>('verifying');
  const [retryCount, setRetryCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const MAX_RETRIES = 5;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setStatus('error');
      setErrorMessage('Missing session ID. Please contact support.');
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/verify-payment?session_id=${sessionId}`);
        const data = await res.json();

        if (res.status === 200 && data.accessToken) {
          setStatus('success');
          setTimeout(() => {
            window.location.href = `/?token=${data.accessToken}`;
          }, 500);
        } else if (res.status === 202) {
          setStatus('processing');
          if (retryCount < MAX_RETRIES) {
            setRetryCount(prev => prev + 1);
            setTimeout(verifyPayment, 1000);
          } else {
            setStatus('error');
            setErrorMessage('Payment verification timed out. Please refresh or contact support.');
          }
        } else {
          setStatus('error');
          setErrorMessage(data.error || 'Payment verification failed. Please contact support.');
        }
      } catch (err) {
        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          setTimeout(verifyPayment, 1000);
        } else {
          setStatus('error');
          setErrorMessage('Network error. Please check your connection and try again.');
        }
      }
    };

    verifyPayment();
  }, [retryCount]);

  const states = {
    verifying: {
      icon: (
        <div className="sc-spinner-wrap">
          <div className="sc-ring" />
          <div className="sc-ring sc-ring--2" />
        </div>
      ),
      title: "Verifying payment",
      desc: "Please wait while we confirm your purchase…",
      sub: null,
      color: "#3B82F6",
    },
    processing: {
      icon: (
        <div className="sc-spinner-wrap">
          <div className="sc-ring sc-ring--amber" />
          <div className="sc-ring sc-ring--amber sc-ring--2" />
        </div>
      ),
      title: "Setting up access",
      desc: "Payment confirmed. Preparing your analysis token…",
      sub: `Attempt ${retryCount + 1} of ${MAX_RETRIES}`,
      color: "#F59E0B",
    },
    success: {
      icon: (
        <div className="sc-icon sc-icon--green">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      ),
      title: "Payment verified",
      desc: "Redirecting you to analyze your contract…",
      sub: null,
      color: "#10B981",
    },
    error: {
      icon: (
        <div className="sc-icon sc-icon--red">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 8v5M11 14.5v.5" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
      ),
      title: "Verification issue",
      desc: errorMessage || "We couldn't verify your payment.",
      sub: null,
      color: "#EF4444",
    },
  };

  const current = states[status];

  return (
    <>
      <div className="sc-bg">
        {/* Grid pattern */}
        <div className="sc-grid" />

        <div className="sc-card">
          {/* Top accent bar */}
          <div className="sc-accent" style={{ background: current.color }} />

          <div className="sc-body">
            {/* Logo */}
            <div className="sc-logo">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L18 6V14L10 18L2 14V6L10 2Z" stroke="#3B82F6" strokeWidth="1.5" fill="none"/>
                <path d="M10 6L14 8V12L10 14L6 12V8L10 6Z" fill="#3B82F6" opacity="0.4"/>
              </svg>
              <span>TrustTerms</span>
            </div>

            {/* Icon */}
            <div className="sc-icon-wrap">
              {current.icon}
            </div>

            {/* Text */}
            <h1 className="sc-title">{current.title}</h1>
            <p className="sc-desc">{current.desc}</p>
            {current.sub && <p className="sc-sub">{current.sub}</p>}

            {/* Progress bar for verifying/processing */}
            {(status === 'verifying' || status === 'processing') && (
              <div className="sc-progress">
                <div className="sc-progress-bar" />
              </div>
            )}

            {/* Error actions */}
            {status === 'error' && (
              <div className="sc-error-actions">
                <button
                  onClick={() => window.location.reload()}
                  className="sc-btn sc-btn--primary"
                >
                  Try Again
                </button>
                <a href="/" className="sc-btn sc-btn--ghost">
                  Back to Home
                </a>
                <p className="sc-support">
                  Contact <a href="mailto:trustterms.help@outlook.com">trustterms.help@outlook.com</a> with your payment confirmation
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .sc-bg {
          min-height: 100vh;
          background:
            radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.1) 0%, transparent 60%),
            #030B18;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }
        .sc-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 60% 60% at 50% 50%, black 0%, transparent 100%);
          pointer-events: none;
        }
        .sc-card {
          position: relative;
          background: #0A1628;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          width: 100%;
          max-width: 420px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 32px 64px rgba(0,0,0,0.3);
        }
        .sc-accent {
          height: 3px;
          width: 100%;
          opacity: 0.7;
          transition: background 0.4s;
        }
        .sc-body {
          padding: 36px 32px 32px;
          text-align: center;
        }
        .sc-logo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          color: #94A3B8;
          letter-spacing: -0.01em;
          margin-bottom: 32px;
        }
        .sc-icon-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }
        .sc-spinner-wrap {
          position: relative;
          width: 52px;
          height: 52px;
        }
        .sc-ring {
          position: absolute;
          inset: 0;
          border: 2px solid transparent;
          border-top-color: #3B82F6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        .sc-ring--amber { border-top-color: #F59E0B; }
        .sc-ring--2 {
          inset: 10px;
          border-top-color: #60A5FA;
          animation-duration: 0.7s;
          animation-direction: reverse;
        }
        .sc-ring--amber.sc-ring--2 { border-top-color: #FCD34D; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .sc-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sc-icon--green {
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.2);
        }
        .sc-icon--red {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
        }
        .sc-title {
          font-size: 20px;
          font-weight: 700;
          color: #F1F5F9;
          letter-spacing: -0.025em;
          margin-bottom: 10px;
        }
        .sc-desc {
          font-size: 14px;
          color: #64748B;
          line-height: 1.6;
          margin-bottom: 6px;
        }
        .sc-sub {
          font-size: 12px;
          color: #475569;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 20px;
        }
        .sc-progress {
          height: 2px;
          background: rgba(255,255,255,0.05);
          border-radius: 1px;
          overflow: hidden;
          margin-top: 24px;
        }
        .sc-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #2563EB, #60A5FA);
          animation: progress-slide 1.5s ease-in-out infinite;
          border-radius: 1px;
        }
        @keyframes progress-slide {
          0%   { transform: translateX(-100%); width: 60%; }
          100% { transform: translateX(200%); width: 60%; }
        }
        .sc-error-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 24px;
        }
        .sc-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 11px 20px;
          font-size: 13.5px;
          font-weight: 600;
          border-radius: 9px;
          cursor: pointer;
          border: none;
          transition: all 0.15s;
          text-decoration: none;
          font-family: inherit;
        }
        .sc-btn--primary {
          background: #2563EB;
          color: #fff;
        }
        .sc-btn--primary:hover { background: #3B82F6; }
        .sc-btn--ghost {
          background: rgba(255,255,255,0.04);
          color: #94A3B8;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .sc-btn--ghost:hover { background: rgba(255,255,255,0.08); color: #E2E8F0; }
        .sc-support {
          font-size: 11.5px;
          color: #475569;
          line-height: 1.6;
          margin-top: 4px;
        }
        .sc-support a {
          color: #60A5FA;
          text-decoration: none;
        }
        .sc-support a:hover { text-decoration: underline; }
      `}</style>
    </>
  );
}