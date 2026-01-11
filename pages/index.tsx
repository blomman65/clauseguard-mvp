import { useEffect, useState } from "react";

export default function Home() {
  const [contractText, setContractText] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSample, setIsSample] = useState(false);

  const sampleContract = `This Agreement shall automatically renew for successive 12-month terms unless either party provides written notice at least 90 days prior to the end of the current term. The Vendor may modify pricing and terms upon renewal with 30 days notice. Liability is capped at fees paid in the last three (3) months. The Vendor may terminate this Agreement for convenience upon 30 days written notice.`;

  // Läs token från URL efter Stripe success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      setAccessToken(token);
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  const pay = async () => {
    setError(null);
    const res = await fetch("/api/create-checkout-session", { method: "POST" });
    const data = await res.json();
    window.location.href = data.url;
  };

  const analyze = async () => {
    setLoading(true);
    setError(null);
    setAnalysis("");

    if (!accessToken && !isSample) {
      setError("You need to pay before analyzing your own contract.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractText, accessToken, isSample }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Analysis failed");
        setLoading(false);
        return;
      }

      setAnalysis(data.analysis);
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <main style={{ background: "#0f172a", minHeight: "100vh", color: "white" }}>
      <div style={{ maxWidth: 720, margin: "auto", padding: "60px 20px" }}>
        <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 12 }}>
          ClauseGuard
        </h1>

        <p style={{ fontSize: 18, color: "#cbd5f5", marginBottom: 32 }}>
          Instantly spot risky clauses before your startup signs a contract.
        </p>

        <button
          onClick={() => {
            setContractText(sampleContract);
            setIsSample(true);
          }}
          style={{
            marginBottom: 12,
            fontSize: 14,
            color: "#a5b4fc",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          Try with a sample SaaS agreement (free)
        </button>

        <textarea
          placeholder="Paste your agreement here..."
          value={contractText}
          onChange={(e) => {
            setContractText(e.target.value);
            setIsSample(false);
          }}
          style={{
            width: "100%",
            height: 220,
            padding: 16,
            borderRadius: 12,
            border: "none",
            fontSize: 15,
            color: "#0f172a",
            marginBottom: 20,
          }}
        />

        {!accessToken && !isSample ? (
          <button
            onClick={pay}
            style={{
              width: "100%",
              padding: 16,
              fontSize: 18,
              fontWeight: 700,
              borderRadius: 12,
              background: "#6366f1",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Pay 99 kr to analyze your own contract
          </button>
        ) : (
          <button
            onClick={analyze}
            disabled={loading}
            style={{
              width: "100%",
              padding: 16,
              fontSize: 18,
              fontWeight: 700,
              borderRadius: 12,
              background: "#22c55e",
              color: "white",
              border: "none",
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Analyzing…" : "Analyze agreement"}
          </button>
        )}

        {error && (
          <p style={{ marginTop: 24, color: "#f87171", fontSize: 14 }}>
            {error}
          </p>
        )}

        {analysis && (
          <div
            style={{
              marginTop: 40,
              background: "#020617",
              padding: 24,
              borderRadius: 12,
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
              fontSize: 15,
            }}
          >
            {isSample && (
              <div
                style={{
                  marginBottom: 12,
                  fontSize: 12,
                  color: "#facc15",
                  fontWeight: 700,
                }}
              >
                SAMPLE ANALYSIS – example output
              </div>
            )}
            {analysis}
          </div>
        )}

        <p style={{ marginTop: 40, fontSize: 12, color: "#94a3b8" }}>
          Contracts are processed securely and not stored after analysis. This
          tool provides general information only and does not constitute legal
          advice.
        </p>
      </div>
    </main>
  );
}
