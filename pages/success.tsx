import { useEffect } from "react";

export default function Success() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) return;

    fetch(`/api/verify-payment?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.accessToken) {
          window.location.href = `/?token=${data.accessToken}`;
        }
      });
  }, []);

  return <p style={{ padding: 40 }}>Verifying payment…</p>;
}
