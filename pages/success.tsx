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

  const isSpinning = status === 'verifying' || status === 'processing';
  const spinColor = status === 'processing' ? '#f59e0b' : '#3B82F6';
  const spinColor2 = status === 'processing' ? '#fcd34d' : '#60A5FA';

  const accentColor =
    status === 'verifying'   ? '#3B82F6' :
    status === 'processing'  ? '#f59e0b' :
    status === 'success'     ? '#10B981' : '#ef4444';

  return (
    <>
      <div className="bg">
        <div className="grid-texture" />

        <div className="card">
          {/* Top accent bar */}
          <div className="accent-bar" style={{ background: accentColor }} />

          <div className="card-body">

            {/* Logo */}
            <div className="logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L22 7V17L12 22L2 17V7L12 2Z" stroke="#3B82F6" strokeWidth="1.6" fill="none"/>
                <path d="M12 7L17 9.5V14.5L12 17L7 14.5V9.5L12 7Z" fill="#3B82F6" fillOpacity="0.3"/>
              </svg>
              <span>TrustTerms</span>
            </div>

            {/* Icon area */}
            <div className="icon-wrap">
              {isSpinning && (
                <div className="rings">
                  <div className="ring ring-1" style={{ borderTopColor: spinColor }} />
                  <div className="ring ring-2" style={{ borderTopColor: spinColor2 }} />
                </div>
              )}

              {status === 'success' && (
                <div className="status-icon status-icon--green">
                  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                    <path d="M5 13l5.5 5.5L21 8" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}

              {status === 'error' && (
                <div className="status-icon status-icon--red">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 8v6M12 15.5v.5" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Text */}
            <h1 className="title">
              {status === 'verifying'  && 'Verifying payment'}
              {status === 'processing' && 'Setting up access'}
              {status === 'success'    && 'Payment verified'}
              {status === 'error'      && 'Verification issue'}
            </h1>

            <p className="desc">
              {status === 'verifying'  && 'Please wait while we confirm your purchase…'}
              {status === 'processing' && 'Payment confirmed. Preparing your analysis token…'}
              {status === 'success'    && 'Redirecting you to analyze your contract…'}
              {status === 'error'      && (errorMessage || 'We couldn\'t verify your payment.')}
            </p>

            {status === 'processing' && (
              <p className="attempt-label">Attempt {retryCount + 1} of {MAX_RETRIES}</p>
            )}

            {/* Progress bar */}
            {isSpinning && (
              <div className="progress-wrap">
                <div className="progress-bar" style={{ background: `linear-gradient(90deg, ${spinColor}, ${spinColor2})` }} />
              </div>
            )}

            {/* Error actions */}
            {status === 'error' && (
              <div className="error-actions">
                <button onClick={() => window.location.reload()} className="btn-primary">
                  Try Again
                </button>
                <a href="/" className="btn-ghost">
                  Back to Home
                </a>
                <p className="support-note">
                  Contact{' '}
                  <a href="mailto:trustterms.help@outlook.com">
                    trustterms.help@outlook.com
                  </a>
                  {' '}with your payment confirmation
                </p>
              </div>
            )}

          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .bg {
          min-height: 100vh;
          background:
            radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.11) 0%, transparent 65%),
            #030B18;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
          font-family: 'DM Sans', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .grid-texture {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 52px 52px;
          mask-image: radial-gradient(ellipse 65% 65% at 50% 50%, black 0%, transparent 100%);
          pointer-events: none;
        }

        .card {
          position: relative;
          background: #0A1628;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 22px;
          width: 100%;
          max-width: 420px;
          overflow: hidden;
          box-shadow:
            0 4px 24px rgba(0,0,0,0.5),
            0 32px 80px rgba(0,0,0,0.35);
        }

        .accent-bar {
          height: 3px;
          width: 100%;
          opacity: 0.8;
          transition: background 0.5s ease;
        }

        .card-body {
          padding: 38px 32px 34px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .logo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          color: #64748b;
          letter-spacing: -0.01em;
          margin-bottom: 36px;
          font-family: 'Sora', system-ui, sans-serif;
        }

        .icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          margin-bottom: 26px;
        }

        /* Spinner rings */
        .rings {
          position: relative;
          width: 64px;
          height: 64px;
        }
        .ring {
          position: absolute;
          inset: 0;
          border: 2px solid transparent;
          border-radius: 50%;
        }
        .ring-1 {
          animation: spin 1s linear infinite;
        }
        .ring-2 {
          inset: 11px;
          animation: spin 0.65s linear infinite reverse;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Status icons */
        .status-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pop-in 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
        @keyframes pop-in {
          from { transform: scale(0.6); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        .status-icon--green {
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.25);
          box-shadow: 0 0 30px rgba(16,185,129,0.12);
        }
        .status-icon--red {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          box-shadow: 0 0 30px rgba(239,68,68,0.1);
        }

        .title {
          font-family: 'Sora', system-ui, sans-serif;
          font-size: 21px;
          font-weight: 700;
          color: #F1F5F9;
          letter-spacing: -0.025em;
          margin-bottom: 10px;
        }

        .desc {
          font-size: 14px;
          color: #64748b;
          line-height: 1.65;
          max-width: 300px;
          margin-bottom: 8px;
        }

        .attempt-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11.5px;
          color: #475569;
          margin-bottom: 22px;
        }

        /* Progress bar */
        .progress-wrap {
          width: 100%;
          height: 2px;
          background: rgba(255,255,255,0.05);
          border-radius: 1px;
          overflow: hidden;
          margin-top: 26px;
        }
        .progress-bar {
          height: 100%;
          width: 55%;
          border-radius: 1px;
          animation: slide 1.6s ease-in-out infinite;
        }
        @keyframes slide {
          0%   { transform: translateX(-120%); }
          100% { transform: translateX(260%); }
        }

        /* Error actions */
        .error-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 26px;
          width: 100%;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 11px;
          cursor: pointer;
          border: none;
          background: #2563EB;
          color: #fff;
          font-family: 'DM Sans', system-ui, sans-serif;
          transition: background 0.15s, transform 0.15s;
          box-shadow: 0 4px 16px rgba(37,99,235,0.3);
        }
        .btn-primary:hover {
          background: #3B82F6;
          transform: translateY(-1px);
        }

        .btn-ghost {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 11px 20px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 11px;
          cursor: pointer;
          background: rgba(255,255,255,0.04);
          color: #94A3B8;
          border: 1px solid rgba(255,255,255,0.08);
          text-decoration: none;
          font-family: 'DM Sans', system-ui, sans-serif;
          transition: background 0.15s, color 0.15s;
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.08);
          color: #F1F5F9;
        }

        .support-note {
          font-size: 12px;
          color: #475569;
          line-height: 1.6;
          margin-top: 6px;
        }
        .support-note a {
          color: #60A5FA;
          text-decoration: none;
        }
        .support-note a:hover { text-decoration: underline; }

        @media(max-width: 480px) {
          .card { border-radius: 18px; }
          .card-body { padding: 30px 22px 26px; }
        }
      `}</style>
    </>
  );
}