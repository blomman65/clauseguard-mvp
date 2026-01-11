// pages/api/analyze.ts
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { contractText } = req.body;

  if (!contractText || contractText.length < 20) {
    return res.status(400).json({ error: "No contract text provided" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `
You are a legal AI assistant specialized in SaaS contracts for small startups (5-50 employees). 
Your task is to analyze the contract text provided by the user and produce a structured, easy-to-read report.

Follow these rules:

1. Identify risky clauses, unusual terms, or potential obligations that could be disadvantageous for a startup.
2. Highlight termination, payment, liability, IP, data, confidentiality, and renewal terms specifically.
3. Provide plain-English explanations for each risky clause (avoid legal jargon where possible).
4. Give a risk rating for each section: Low, Medium, High.
5. Keep the report concise but actionable. Prefer bullet points or numbered lists.
6. Do not give formal legal advice; instead, give guidance the user can understand quickly.

Format the response like this:

- Section: [Clause Name]
  - Risk: [Low/Medium/High]
  - Explanation: [Plain-English summary]
          `,
        },
        {
          role: "user",
          content: contractText,
        },
      ],
    });

    res.status(200).json({ analysis: completion.choices[0].message.content });
  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ error: "Failed to analyze contract." });
  }
}
