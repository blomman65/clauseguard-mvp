import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import * as Sentry from "@sentry/nextjs";
import { consumeAccessToken } from "../../lib/accessTokens";
import { rateLimit, getClientIp } from "../../lib/rateLimit";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_CONTRACT_LENGTH = 50000;

const SAMPLE_CONTRACT_TEXT = `This Agreement shall automatically renew for successive 12-month terms unless either party provides written notice at least 90 days prior to the end of the current term. The Vendor may modify pricing and terms upon renewal with 30 days notice. Liability is capped at fees paid in the last three (3) months. The Vendor may terminate this Agreement for convenience upon 30 days written notice.`;

let cachedSampleAnalysis: string | null = null;

// Input sanitization för att förhindra prompt injection
function sanitizeInput(text: string): string {
  return text
    .replace(/<script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .slice(0, MAX_CONTRACT_LENGTH);
}

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

  // Sanitize input
  const sanitizedContract = sanitizeInput(contractText);

  // ===== RATE LIMITING =====
  
  const clientIp = getClientIp(req);
  console.log('🔍 Client IP:', clientIp);
  
  const rateLimitConfig = isSample
    ? { limit: 3, window: 3600 }
    : { limit: 10, window: 3600 };
  
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
  
  if (isSample && sanitizedContract.trim() === SAMPLE_CONTRACT_TEXT.trim()) {
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
      max_tokens: 1200,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `You are a senior commercial SaaS lawyer with 15+ years experience advising venture-backed startups (10-50 employees) on contract risk.

CRITICAL OUTPUT FORMAT:
Line 1: "Overall risk level: LOW | MEDIUM | HIGH"
Line 2: Empty line

Then follow this exact structure:

## Executive Summary
[2-3 sentences: What's the biggest risk? Should they sign as-is?]

## Top 5 Risks

### 1. [Risk Name] — Risk Level: HIGH/MEDIUM/LOW
**What it means:** [Business impact in plain language]
**Why it matters:** [Financial/operational exposure with specific $ amounts if possible]
**Negotiate this:** [Specific clause to change + suggested alternative language]

[Repeat for risks 2-5]

## Financial Red Flags
- [Specific $ exposure or pricing concerns]
- [Auto-renewal financial implications]
- [Liability cap vs. realistic potential damages]
- [Payment terms and penalties]

## Non-Standard Clauses
[List clauses that are unusually vendor-favorable compared to market-standard SaaS agreements. Be specific about what's unusual and what's standard.]

## Recommended Negotiation Strategy
1. [Highest priority item with specific ask]
2. [Second priority with fallback position]
3. [Third priority]
[Max 5 items total, prioritized by financial impact]

CRITICAL RULES:
- Be brutally honest about risk levels - don't sugarcoat
- Focus on financial exposure over legal theory
- Use specific examples and numbers from THIS contract
- Compare explicitly to market-standard SaaS terms (e.g., "Market standard is 12 months liability cap, this contract only caps at 3 months")
- If a critical clause is MISSING (e.g., no liability cap stated at all), flag as HIGH risk
- Avoid legal jargon - write for a CFO, not a lawyer
- For each risk, answer: "What could this cost us in real money?"
- If you see red flags like unilateral pricing changes, unlimited liability, or auto-renewal >12 months, explicitly call them out

RISK LEVEL GUIDELINES:
- HIGH: Could cost >$50k or create existential operational risk
- MEDIUM: Could cost $10-50k or create significant hassle
- LOW: Minor financial exposure (<$10k) or standard market terms`,
        },
        {
          role: "user",
          content: sanitizedContract,
        },
      ],
    });

    const analysis = completion.choices[0].message.content || "Analysis failed";

    console.log('✅ OpenAI analysis complete');

    // Cache sample analysis
    if (isSample && sanitizedContract.trim() === SAMPLE_CONTRACT_TEXT.trim()) {
      cachedSampleAnalysis = analysis;
    }

    // Rate limit headers
    res.setHeader('X-RateLimit-Limit', rateLimitConfig.limit.toString());
    res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    res.setHeader('X-RateLimit-Reset', new Date(rateLimitResult.reset).toISOString());

    return res.status(200).json({
      analysis,
      cached: false
    });

  } catch (err: any) {
    console.error("❌ OpenAI analysis error:", err);
    
    // Log to Sentry
    Sentry.captureException(err, {
      tags: {
        api_route: "analyze",
        is_sample: isSample,
        error_type: err.status ? "openai_api_error" : "unknown_error",
      },
      extra: {
        contract_length: sanitizedContract.length,
        error_message: err.message,
        error_status: err.status,
        client_ip: clientIp,
      },
      user: {
        ip_address: clientIp,
      },
    });
    
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