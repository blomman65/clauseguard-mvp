import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { consumeAccessToken } from "../../lib/accessTokens";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const { contractText, accessToken, isSample } = req.body;

  if (!contractText || contractText.length < 50) {
    return res.status(400).json({ error: "Contract text too short" });
  }

  // Require valid token ONLY for non-sample analysis
  if (!isSample) {
    if (!accessToken || !consumeAccessToken(accessToken)) {
      return res.status(403).json({ error: "Invalid or already used token" });
    }
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content: `
You are a senior commercial SaaS lawyer advising a CFO at a 10–50 person startup.

Focus especially on:
- Financial exposure
- Termination and auto-renewal
- Liability caps
- Unilateral changes
- Vendor lock-in

Be conservative. If something is unclear, flag it as a risk.

Return strictly in this format:

1. Overall risk level (Low / Medium / High) with 1-sentence justification
2. Top 5 risks (each with:
   - Risk level
   - Why it matters
   - What to negotiate)
3. Financial red flags
4. Clauses that are non-standard for SaaS agreements
5. Recommended negotiation priorities (max 5 bullets)

Use clear business language. This is not legal advice.
          `,
        },
        { role: "user", content: contractText },
      ],
    });

    res.status(200).json({
      analysis: completion.choices[0].message.content,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analysis failed" });
  }
}
