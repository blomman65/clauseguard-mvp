import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import * as Sentry from "@sentry/nextjs";
import { rateLimit, getClientIp } from "../../lib/rateLimit";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface RedlineClause {
  clauseTitle: string;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  original: string;
  redlined: string;
  explanation: string;
}

export interface RedlineResponse {
  clauses: RedlineClause[];
}

function verifyOrigin(req: NextApiRequest): boolean {
  if (process.env.NODE_ENV === "production") {
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      "https://trustterms.vercel.app",
    ].filter(Boolean);
    const origin = req.headers.origin;
    const originString = Array.isArray(origin) ? origin[0] : origin;
    if (!originString || !allowedOrigins.includes(originString)) return false;
    return true;
  }
  const origin = req.headers.origin;
  const originString = Array.isArray(origin) ? origin[0] : origin;
  if (
    originString &&
    (originString.startsWith("http://localhost:") ||
      originString.startsWith("http://127.0.0.1:"))
  )
    return true;
  return false;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const contentType = req.headers["content-type"];
  if (!contentType || !contentType.includes("application/json")) {
    return res.status(400).json({ error: "Invalid Content-Type" });
  }

  if (!verifyOrigin(req)) {
    return res.status(403).json({ error: "Unauthorized origin" });
  }

  const clientIp = getClientIp(req);
  const rateLimitResult = await rateLimit(`redline:${clientIp}`, 10, 3600);
  if (!rateLimitResult.success) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  const { contractText, analysis } = req.body;

  if (!contractText || typeof contractText !== "string") {
    return res.status(400).json({ error: "Contract text is required" });
  }
  if (!analysis || typeof analysis !== "string") {
    return res.status(400).json({ error: "Analysis is required" });
  }
  if (contractText.length > 50000) {
    return res.status(400).json({ error: "Contract too long" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4000,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `You are a senior commercial lawyer specializing in SaaS agreements. You have already analyzed a contract and identified risks. Now your job is to rewrite every risky clause into a customer-friendly version.

CRITICAL: You MUST respond with ONLY valid JSON. No preamble, no explanation, no markdown fences. Raw JSON only.

The JSON must follow this exact structure:
{
  "clauses": [
    {
      "clauseTitle": "string - short name of the clause (e.g. 'Auto-Renewal', 'Liability Cap')",
      "riskLevel": "HIGH" | "MEDIUM" | "LOW",
      "original": "string - the exact problematic text from the contract (keep it concise, max 3 sentences)",
      "redlined": "string - your improved customer-friendly rewrite of that specific text",
      "explanation": "string - one sentence explaining what changed and why it protects the customer"
    }
  ]
}

Rules:
- Include ALL clauses that were identified as risks in the analysis (HIGH, MEDIUM, and LOW)
- Sort by risk level: HIGH first, then MEDIUM, then LOW
- The "original" field must be actual text from the contract, not a paraphrase
- The "redlined" field must be a proper legal rewrite, not a description of what to change
- Be specific and concrete in rewrites — use actual legal language
- Limit to max 12 clauses total
- Do not include any text outside the JSON object`,
        },
        {
          role: "user",
          content: `Here is the contract:\n\n${contractText}\n\n---\n\nHere is the risk analysis that was already performed:\n\n${analysis}\n\n---\n\nNow rewrite all risky clauses. Return ONLY the JSON object.`,
        },
      ],
    });

    const raw = completion.choices[0].message.content || "";

    let parsed: RedlineResponse;
    try {
      const clean = raw
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      parsed = JSON.parse(clean);
    } catch {
      console.error("Failed to parse redline JSON:", raw.substring(0, 200));
      Sentry.captureMessage("Redline JSON parse failed", {
        level: "error",
        extra: { rawPreview: raw.substring(0, 500) },
      });
      return res.status(500).json({ error: "Failed to parse redline output. Please try again." });
    }

    if (!parsed.clauses || !Array.isArray(parsed.clauses)) {
      return res.status(500).json({ error: "Invalid redline response format." });
    }

    return res.status(200).json(parsed);
  } catch (err: any) {
    console.error("Redline API error:", err);
    Sentry.captureException(err, {
      tags: { api_route: "redline" },
    });
    return res.status(500).json({
      error: "Redline generation failed. Please try again.",
    });
  }
}