import { useEffect, useState } from "react";

export default function Home() {
  const [contractText, setContractText] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "true") {
      setPaid(true);
    }
  }, []);

  const pay = async () => {
    try {
      const res = await fetch("/api/create-checkout-session", { method: "POST" });
      const data = await res.json();
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert("Something went wrong with payment. Please try again.");
    }
  };

  const analyze = async () => {
    if (!contractText || contractText.length < 20) {
      alert("Please paste a valid contract to analyze.");
      return;
    }

    setLoading(true);
    setAnalysis("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractText }),
      });
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (err) {
      console.error(err);
      setAnalysis("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex justify-center items-center p-4">
      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl p-8 shadow-lg">
        {/* Header */}
        <h1 className="text-4xl font-extrabold mb-2 text-indigo-400">ClauseGuard</h1>
        <p className="text-gray-300 mb-6">
          Instantly analyze contracts and uncover hidden risks before you sign.
        </p>

        {/* Benefits */}
        <ul className="mb-6 space-y-1 text-gray-200">
          <li>✔ Finds unfair clauses</li>
          <li>✔ Plain-English explanations</li>
          <li>✔ Takes less than 30 seconds</li>
        </ul>

        {/* Contract textarea */}
        <textarea
          placeholder="Paste your agreement here..."
          value={contractText}
          onChange={(e) => setContractText(e.target.value)}
          className="w-full h-56 p-4 rounded-xl text-gray-900 focus:outline-none mb-4 resize-none"
        />

        {/* CTA button */}
        {!paid ? (
          <button
            onClick={pay}
            className="w-full py-4 text-lg font-bold rounded-xl bg-indigo-500 hover:bg-indigo-600 transition-colors"
          >
            Pay 99 kr to analyze
          </button>
        ) : (
          <button
            onClick={analyze}
            disabled={loading}
            className={`w-full py-4 text-lg font-bold rounded-xl ${
              loading ? "bg-gray-600 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
            } transition-colors`}
          >
            {loading ? "Analyzing..." : "Analyze agreement"}
          </button>
        )}

        {!paid && (
          <p className="text-center mt-3 text-gray-400 text-sm">
            Secure payment · No subscription · One-time analysis
          </p>
        )}

        {/* Analysis result */}
        {analysis && (
          <div className="mt-6 bg-gray-900 p-6 rounded-xl whitespace-pre-wrap leading-relaxed text-gray-200">
            {analysis}
          </div>
        )}
      </div>
    </main>
  );
}
