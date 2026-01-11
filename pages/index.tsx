import { useEffect, useState } from "react";


export default function Home() {
  const [contractText, setContractText] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);


  // ⚡ Läs token från URL
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


    if (!accessToken) {
      setError("You need to pay before analyzing a contract.");
      setLoading(false);
      return;
    }


    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractText, accessToken }),
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
        <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 12 }}>ClauseGuard</h1>
        <p style={{ fontSize: 18, color: "#cbd5f5", marginBottom: 32 }}>
          AI-powered contract analysis for founders and CFOs.
        </p>


        <textarea
          placeholder="Paste your agreement here..."
          value={contractText}
          onChange={(e) => setContractText(e.target.value)}
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


        {!accessToken ? (
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
            Pay 99 kr to analyze one contract
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
            {loading ? "Analyzing..." : "Analyze agreement"}
          </button>
        )}


        {error && (
          <p style={{ marginTop: 24, color: "#f87171", fontSize: 14 }}>{error}</p>
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
            {analysis}
          </div>
        )}
      </div>
    </main>
  );
}
