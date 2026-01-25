import { useEffect, useState } from "react";

export default function Success() {
  const [status, setStatus] = useState<'verifying' | 'processing' | 'error'>('verifying');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 10; // Max 10 försök (10 sekunder)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    
    if (!sessionId) {
      setStatus('error');
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/verify-payment?session_id=${sessionId}`);
        const data = await res.json();

        if (res.status === 200 && data.accessToken) {
          // Success! Redirect till main page med token
          window.location.href = `/?token=${data.accessToken}`;
        } else if (res.status === 202) {
          // Webhook inte körts än, försök igen
          console.log('⏳ Webhook processing, retrying...', retryCount + 1);
          setStatus('processing');
          
          if (retryCount < MAX_RETRIES) {
            setRetryCount(prev => prev + 1);
            // Retry efter 1 sekund
            setTimeout(verifyPayment, 1000);
          } else {
            // Ge upp efter max retries
            setStatus('error');
          }
        } else {
          // Annat fel
          console.error('Verification failed:', data);
          setStatus('error');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setStatus('error');
      }
    };

    verifyPayment();
  }, [retryCount]);

  return (
    <div style={{
      background: "#0f172a",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      padding: "20px"
    }}>
      <div style={{
        maxWidth: 500,
        textAlign: "center",
        background: "rgba(30, 41, 59, 0.8)",
        padding: 48,
        borderRadius: 24,
        border: "1px solid rgba(148, 163, 184, 0.3)"
      }}>
        {status === 'verifying' && (
          <>
            <div style={{
              width: 64,
              height: 64,
              border: "4px solid rgba(99, 102, 241, 0.2)",
              borderTopColor: "#6366f1",
              borderRadius: "50%",
              margin: "0 auto 24px",
              animation: "spin 1s linear infinite"
            }} />
            <h1 style={{ fontSize: 24, marginBottom: 12, fontWeight: 700 }}>
              Verifying payment...
            </h1>
            <p style={{ fontSize: 15, color: "#cbd5e1", margin: 0 }}>
              Please wait while we confirm your purchase
            </p>
          </>
        )}

        {status === 'processing' && (
          <>
            <div style={{
              width: 64,
              height: 64,
              border: "4px solid rgba(245, 158, 11, 0.2)",
              borderTopColor: "#f59e0b",
              borderRadius: "50%",
              margin: "0 auto 24px",
              animation: "spin 1s linear infinite"
            }} />
            <h1 style={{ fontSize: 24, marginBottom: 12, fontWeight: 700 }}>
              Processing payment...
            </h1>
            <p style={{ fontSize: 15, color: "#cbd5e1", marginBottom: 8 }}>
              Your payment was successful! We're setting up your access.
            </p>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
              Attempt {retryCount + 1} of {MAX_RETRIES}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{
              width: 64,
              height: 64,
              background: "rgba(239, 68, 68, 0.2)",
              borderRadius: "50%",
              margin: "0 auto 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32
            }}>
              ❌
            </div>
            <h1 style={{ fontSize: 24, marginBottom: 12, fontWeight: 700, color: "#fca5a5" }}>
              Verification Failed
            </h1>
            <p style={{ fontSize: 15, color: "#cbd5e1", marginBottom: 24 }}>
              We couldn't verify your payment. This might be temporary.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: "12px 24px",
                  fontSize: 15,
                  fontWeight: 700,
                  borderRadius: 12,
                  background: "#6366f1",
                  color: "white",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Try Again
              </button>
              <a
                href="/"
                style={{
                  padding: "12px 24px",
                  fontSize: 15,
                  fontWeight: 700,
                  borderRadius: 12,
                  background: "transparent",
                  color: "#cbd5e1",
                  border: "1px solid rgba(148, 163, 184, 0.4)",
                  textDecoration: "none",
                  display: "block"
                }}
              >
                Back to Home
              </a>
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 24, margin: 0 }}>
              If this persists, contact support at trustterms.help@outlook.com with your Stripe session ID
            </p>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}