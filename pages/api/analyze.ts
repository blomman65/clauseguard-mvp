import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import * as Sentry from "@sentry/nextjs";
import { consumeAccessToken } from "../../lib/accessTokens";
import { rateLimit, getClientIp } from "../../lib/rateLimit";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_CONTRACT_LENGTH = 50000;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 sekund

const SAMPLE_CONTRACT_TEXT = `This Agreement shall automatically renew for successive 12-month terms unless either party provides written notice at least 90 days prior to the end of the current term. The Vendor may modify pricing and terms upon renewal with 30 days notice. Liability is capped at fees paid in the last three (3) months. The Vendor may terminate this Agreement for convenience upon 30 days written notice.`;

let cachedSampleAnalysis: string | null = null;

// Input sanitization för att förhindra prompt injection
function sanitizeInput(text: string): string {
  return text
    .replace(/<script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/[<>]/g, '') // Extra skydd mot HTML injection
    .slice(0, MAX_CONTRACT_LENGTH);
}

// Verifiera att requesten kommer från rätt origin
function verifyOrigin(req: NextApiRequest): boolean {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'https://trustterms.vercel.app',
    'http://localhost:3000' // För development
  ];
 
  const origin = req.headers.origin || req.headers.referer;
 
  if (process.env.NODE_ENV === 'production') {
    return allowedOrigins.some(allowed => origin?.startsWith(allowed || ''));
  }
 
  return true;
}

// Retry logic med exponential backoff för OpenAI API
async function analyzeWithRetry(
  sanitizedContract: string,
  maxRetries = MAX_RETRIES
): Promise<string> {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`🤖 OpenAI API attempt ${attempt + 1}/${maxRetries}`);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 1200,
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: `You are a senior commercial SaaS lawyer with 15+ years of experience advising venture-backed startups (10–50 employees) on customer-side contract risk. You think like a CFO first, a lawyer second.

Your goal is to identify where this contract creates asymmetric financial or operational downside for the Customer.

CRITICAL OUTPUT FORMAT:
Line 1: "Overall risk level: LOW | MEDIUM | HIGH"
Line 2: Empty line
DO NOT add any headings, labels, or text before Line 1.
DO NOT restate the overall risk level anywhere else in the output.
If the format is violated, the response is invalid.

Then follow this exact structure:

## Executive Summary
[2–3 sentences answering:
1) What is the single biggest financial or operational risk?
2) Would you recommend signing as-is, yes or no, and why?]

## Top 5 Risks

### 1. [Risk Name] — Risk Level: HIGH / MEDIUM / LOW
**What it means:** Explain the business impact in plain English.
**Why it matters:** Quantify downside ONLY if it can be directly inferred from THIS contract.
If you use estimates or scenarios, label them clearly as "illustrative" and explain the assumption in one sentence.
Never invent pricing tiers or enterprise fees unless explicitly stated.
**Negotiate this:** Cite the relevant clause(s) and propose a concrete change or fallback position (not just “negotiate”).

[Repeat for risks 2–5]

## Financial Red Flags
Call out issues that could directly impact cash flow or budget certainty, including:
- Liability cap vs. realistic downside
- Auto-renewal or auto-conversion mechanics
- Pricing changes, missing pricing terms, or unclear payment timing
- Lack of refunds, credits, or termination protections

## Non-Standard Clauses
List clauses that materially deviate from market-standard SaaS terms for:
- VC-backed SaaS vendors
- US / UK / EU commercial customers (not enterprise-only norms)

For each, briefly state:
- What market standard typically is
- How this contract differs
- Why that difference matters financially or operationally

## Recommended Negotiation Strategy
Prioritize up to 5 items, ranked by downside risk to the Customer:
1. [Highest-impact ask, with a concrete target and fallback]
2. [Second priority]
3. [Third priority]

Focus on what the Customer must fix vs. what is “nice to have.”

RISK ASSESSMENT RULES (DO NOT IGNORE):
- If any single clause could realistically expose the Customer to >$50k in loss, data breach liability, or loss of core functionality with no recourse, the overall risk should be HIGH.
- If multiple MEDIUM risks compound (e.g. AI disclaimers + liability cap + no indemnity), explicitly call this out and consider escalating the overall risk.
- Missing protections (e.g. no liability cap, no termination right, no data protection language) are HIGH risk by default.
- Do not average risk levels mechanically — use judgment.

RISK LEVEL GUIDELINES:
- HIGH: Could cost >$50k, create regulatory exposure, or materially disrupt operations
- MEDIUM: Could cost $10k–$50k or create ongoing commercial friction
- LOW: <$10k exposure or clearly market-standard terms

STYLE RULES:
- Be blunt and commercially realistic
- Avoid legal jargon
- Write for a CFO or founder who will not read the contract itself
- Do not soften conclusions to be polite
- FORMATTING RULES:
  - Use Markdown only
  - Do NOT use bullet symbols (•)
  - Use bold labels exactly as shown (**What it means:** etc.)
  - Do not nest lists inside the Top 5 Risks section`,
          },
          {
            role: "user",
            content: sanitizedContract,
          },
        ],
      });

      const analysis = completion.choices[0].message.content || "Analysis failed";
      console.log(`✅ OpenAI API success on attempt ${attempt + 1}`);
      
      return analysis;
      
    } catch (err: any) {
      lastError = err;
      console.error(`❌ OpenAI API attempt ${attempt + 1} failed:`, err.message);
      
      if (attempt === maxRetries - 1) {
        break;
      }
      
      if (err.status === 401 || err.status === 403 || err.status === 400) {
        console.error("🔴 Non-retryable error, stopping retries");
        break;
      }
      
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!verifyOrigin(req)) {
    console.warn('⚠️ Request from unauthorized origin:', req.headers.origin);
    return res.status(403).json({ error: "Unauthorized origin" });
  }

  const { contractText, accessToken, isSample } = req.body;

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

  const sanitizedContract = sanitizeInput(contractText);

  const clientIp = getClientIp(req);
 
  const rateLimitConfig = isSample
    ? { limit: 3, window: 3600 }
    : { limit: 10, window: 3600 };
 
  const rateLimitResult = await rateLimit(
    `analyze:${clientIp}`,
    rateLimitConfig.limit,
    rateLimitConfig.window
  );

  if (!rateLimitResult.success) {
    const minutesUntilReset = Math.ceil((rateLimitResult.reset - Date.now()) / 60000);
   
    return res.status(429).json({
      error: `Too many requests. Please try again in ${minutesUntilReset} minute${minutesUntilReset > 1 ? 's' : ''}.`,
      reset: new Date(rateLimitResult.reset).toISOString(),
      remaining: 0
    });
  }

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

  if (isSample && sanitizedContract.trim() === SAMPLE_CONTRACT_TEXT.trim()) {
    if (cachedSampleAnalysis) {
      console.log('📦 Returning cached sample analysis');
      
      res.setHeader('X-RateLimit-Limit', rateLimitConfig.limit.toString());
      res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      res.setHeader('X-RateLimit-Reset', new Date(rateLimitResult.reset).toISOString());
     
      return res.status(200).json({
        analysis: cachedSampleAnalysis,
        cached: true
      });
    }
  }

  try {
    const analysis = await analyzeWithRetry(sanitizedContract);

    if (isSample && sanitizedContract.trim() === SAMPLE_CONTRACT_TEXT.trim()) {
      cachedSampleAnalysis = analysis;
      console.log('💾 Cached sample analysis for future requests');
    }

    res.setHeader('X-RateLimit-Limit', rateLimitConfig.limit.toString());
    res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    res.setHeader('X-RateLimit-Reset', new Date(rateLimitResult.reset).toISOString());

    return res.status(200).json({
      analysis,
      cached: false
    });

  } catch (err: any) {
    console.error("❌ OpenAI analysis error (after all retries):", err);
   
    Sentry.captureException(err, {
      tags: {
        api_route: "analyze",
        is_sample: isSample,
        error_type: err.status ? "openai_api_error" : "unknown_error",
      },
      extra: {
        contract_length: sanitizedContract.length,
        error_status: err.status,
        error_code: err.code,
        attempts: MAX_RETRIES,
      },
    });
   
    if (err.status === 429) {
      return res.status(503).json({
        error: "Our AI service is experiencing high demand. Please try again in 30 seconds."
      });
    }
   
    if (err.status === 401 || err.status === 403) {
      console.error("🔴 CRITICAL: OpenAI API key issue!");
      Sentry.captureMessage("OpenAI API authentication failed", {
        level: "fatal",
        tags: { critical: true }
      });
      
      return res.status(500).json({
        error: "Service temporarily unavailable. Please try again later."
      });
    }

    if (err.code === 'context_length_exceeded') {
      return res.status(400).json({
        error: "Contract is too complex for analysis. Please try a shorter version."
      });
    }

    if (err.message?.includes('timeout') || err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
      return res.status(504).json({
        error: "Analysis took too long. Please try again."
      });
    }

    return res.status(500).json({
      error: "Analysis failed. Please try again in a moment."
    });
  }
}
