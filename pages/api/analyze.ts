import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { contractText, accessToken, isSample } = req.body;

  if (!isSample && !accessToken) {
    return res.status(403).json({ error: "No valid token provided" });
  }

  if (!contractText || contractText.length < 20)
    return res.status(400).json({ error: "Contract text too short" });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 700,
      messages: [
        {
          role: "system",
          content: `
You are a senior commercial lawyer advising a CFO.
Return the analysis in this structure:
1. Executive summary (max 6 bullets)
2. Key risks (High / Medium / Low)
3. Financial implications
4. Non-standard clauses
5. Recommended next steps
Use clear, non-legal language. This is not legal advice.
          `,
        },
        { role: "user", content: contractText },
      ],
    });

    res.status(200).json({ analysis: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analysis failed" });
  }
}
