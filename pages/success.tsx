import { useEffect } from "react";


export default function Success() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) return;


    // ⚡ Använd sessionId som "token" direkt
    const token = sessionId;
    window.location.href = `/?token=${token}`;
  }, []);


  return <p style={{ padding: 40 }}>Verifying payment…</p>;
}
