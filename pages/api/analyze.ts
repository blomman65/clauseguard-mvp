import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { consumeAccessToken } from "../../lib/accessTokens";
import { rateLimit, getClientIp } from "../../lib/rateLimit";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Max contract length (ungefär 15 sidor text)
const MAX_CONTRACT_LENGTH = 50000;

// Cached sample analysis för att spara OpenAI-kostnader
const SAMPLE_CONTRACT_TEXT = `This Agreement shall automatically renew for successive 12-month terms unless either party provides written notice at least 90 days prior to the end of the current term. The Vendor may modify pricing and terms upon renewal with 30 days notice. Liability is capped at fees paid in the last three (3) months. The Vendor may terminate this Agreement for convenience upon 30 days written notice.`;

let cachedSampleAnalysis: string | null = null;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { contractText, accessToken, isSample } = req.body;

  // ===== VALIDATION =====
  
  if (!contractText || typeof contractText !== 'string') {
    return res.status(400).json({ error: "Contract text is required" });
  }

  if (contractText.length < 50) {
    return res.status(400).json({ error: "Contract text too short (minimum 50 characters)" });
  }

  if (contractText.length > MAX_CONTRACT_LENGTH) {
    return res.status(400).json({ 
      error: `Contract too long (maximum ${MAX_CONTRACT_LENGTH} characters)` 
    });
  }

  // ===== RATE LIMITING =====
  
  const clientIp = getClientIp(req);
  console.log('🔍 Client IP:', clientIp);
  
  // Olika rate limits för sample vs betald analys
  const rateLimitConfig = isSample 
    ? { limit: 3, window: 3600 }  // 3 sample per timme
    : { limit: 10, window: 3600 }; // 10 betalda per timme
  
  const rateLimitResult = await rateLimit(
    `analyze:${clientIp}`,
    rateLimitConfig.limit,
    rateLimitConfig.window
  );

  console.log('🔒 Rate limit result:', rateLimitResult);

  if (!rateLimitResult.success) {
    const resetDate = new Date(rateLimitResult.reset);
    return res.status(429).json({ 
      error: "Too many requests. Please try again later.",
      reset: resetDate.toISOString(),
      remaining: 0
    });
  }

  // ===== AUTHORIZATION =====
  
  // Kräv giltig token för icke-sample analyser
  if (!isSample) {
    if (!accessToken || typeof accessToken !== 'string') {
      return res.status(403).json({ 
        error: "Access token required for paid analysis" 
      });
    }

    const isValidToken = await consumeAccessToken(accessToken);
    
    if (!isValidToken) {
      return res.status(403).json({ 
        error: "Invalid or already used access token" 
      });
    }
  }

  // ===== SAMPLE ANALYSIS OPTIMIZATION =====
  
  // Om det är exakt samma sample contract, returnera cached version
  if (isSample && contractText.trim() === SAMPLE_CONTRACT_TEXT.trim()) {
    if (cachedSampleAnalysis) {
      console.log('✅ Returning cached sample analysis');
      return res.status(200).json({
        analysis: cachedSampleAnalysis,
        cached: true
      });
    }
  }

  // ===== OPENAI ANALYSIS =====

  try {
    console.log('🤖 Calling OpenAI API...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 800,
      temperature: 0.3, // Lägre temperatur för mer konsistenta resultat
      messages: [
        {
          role: "system",
          content: `
You are a senior commercial SaaS lawyer advising a CFO at a 10–50 person startup.

CRITICAL:
Start your response with exactly one line in this format:
Overall risk level: LOW | MEDIUM | HIGH

Then leave one blank line and continue.

Focus especially on:
- Financial exposure
- Termination and auto-renewal
- Liability caps
- Unilateral changes
- Vendor lock-in

Be conservative. If something is unclear, flag it as a risk.

Return strictly in this format:

Overall risk level: <LOW | MEDIUM | HIGH>

1. Overall assessment (1 short paragraph)
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
        {
          role: "user",
          content: contractText,
        },
      ],
    });

    const analysis = completion.choices[0].message.content || "Analysis failed";

    console.log('✅ OpenAI analysis complete');

    // Cacha sample analysis
    if (isSample && contractText.trim() === SAMPLE_CONTRACT_TEXT.trim()) {
      cachedSampleAnalysis = analysis;
    }

    // Lägg till rate limit headers
    res.setHeader('X-RateLimit-Limit', rateLimitConfig.limit.toString());
    res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    res.setHeader('X-RateLimit-Reset', new Date(rateLimitResult.reset).toISOString());

    return res.status(200).json({
      analysis,
      cached: false
    });

  } catch (err: any) {
    console.error("❌ OpenAI analysis error:", err);
    
    // Specifika felmeddelanden baserat på OpenAI error
    if (err.status === 429) {
      return res.status(503).json({ 
        error: "Service temporarily unavailable. Please try again in a moment." 
      });
    }
    
    if (err.status === 401) {
      return res.status(500).json({ 
        error: "Configuration error. Please contact support." 
      });
    }

    return res.status(500).json({ 
      error: "Analysis failed. Please try again." 
    });
  }
}