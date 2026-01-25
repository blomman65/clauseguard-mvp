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
const INITIAL_RETRY_DELAY = 1000;

const SAMPLE_CONTRACT_TEXT = `SAAS SERVICE AGREEMENT

This Software as a Service Agreement ("Agreement") is entered into between CloudTech Solutions Inc. ("Vendor") and the subscribing customer ("Customer").

1. TERM AND RENEWAL
This Agreement shall commence on the date of Customer's first payment and continue for an initial term of twelve (12) months. This Agreement shall automatically renew for successive twelve (12) month terms unless either party provides written notice of non-renewal at least ninety (90) days prior to the end of the current term. Vendor may modify pricing and terms upon renewal with thirty (30) days written notice.

2. FEES AND PAYMENT
Customer agrees to pay the subscription fees as set forth in the applicable order form. All fees are non-refundable except as expressly set forth herein. Vendor reserves the right to modify pricing upon renewal or with sixty (60) days notice during the subscription term. Late payments will accrue interest at 1.5% per month or the maximum rate permitted by law, whichever is less.

3. LIABILITY AND INDEMNIFICATION
Vendor's total liability under this Agreement is limited to the amount of fees paid by Customer in the three (3) months immediately preceding the claim. Vendor shall not be liable for any indirect, incidental, consequential, or punitive damages. Customer agrees to indemnify Vendor against any third-party claims arising from Customer's use of the Service.

4. TERMINATION
Either party may terminate this Agreement for convenience upon thirty (30) days written notice. Vendor may terminate immediately upon Customer's breach of payment obligations or violation of acceptable use policies. Upon termination, Customer shall immediately cease use of the Service and all fees paid are non-refundable.

5. DATA AND PRIVACY
Customer data will be stored on Vendor's servers in the United States. Vendor may use Customer data to improve the Service and for marketing purposes. Upon termination, Vendor will retain Customer data for ninety (90) days, after which it may be permanently deleted at Vendor's discretion.

6. WARRANTIES AND DISCLAIMERS
THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. Vendor does not warrant that the Service will be uninterrupted or error-free. Vendor disclaims all warranties, express or implied, including merchantability and fitness for a particular purpose.

7. CHANGES TO SERVICE
Vendor reserves the right to modify or discontinue any feature of the Service at any time without notice or liability to Customer.

By clicking "I Accept" or using the Service, Customer agrees to be bound by these terms.`;

let cachedSampleAnalysis: string | null = null;

function sanitizeInput(text: string): string {
  return text
    .replace(/<script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/[<>]/g, '')
    .slice(0, MAX_CONTRACT_LENGTH);
}

function verifyOrigin(req: NextApiRequest): boolean {
  // I produktion: strikt verifiering
  if (process.env.NODE_ENV === 'production') {
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      'https://trustterms.vercel.app',
    ].filter(Boolean);
    
    const origin = req.headers.origin;
    
    // Kräv exact match av origin
    if (!origin || !allowedOrigins.includes(origin)) {
      console.warn('⚠️ Request blocked - invalid origin:', origin);
      return false;
    }
    
    return true;
  }
  
  // I development: tillåt localhost
  const origin = req.headers.origin;
  if (origin && (
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:')
  )) {
    return true;
  }
  
  console.warn('⚠️ Development mode - invalid origin:', origin);
  return false;
}

function verifyContentType(req: NextApiRequest): boolean {
  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.includes('application/json')) {
    console.warn('⚠️ Invalid Content-Type:', contentType);
    return false;
  }
  return true;
}

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
**Negotiate this:** Cite the relevant clause(s) and propose a concrete change or fallback position (not just "negotiate").

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

Focus on what the Customer must fix vs. what is "nice to have."

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

  // Content-Type check
  if (!verifyContentType(req)) {
    return res.status(400).json({ error: "Invalid Content-Type. Must be application/json" });
  }

  // Origin check
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
    
    const isTechnicalError =
      err.status === 429 ||
      err.status === 500 ||
      err.status === 503 ||
      err.status === 504 ||
      err.message?.includes('timeout') ||
      err.code === 'ETIMEDOUT' ||
      err.code === 'ECONNABORTED' ||
      err.code === 'ECONNRESET';
    
    if (!isSample && accessToken && isTechnicalError) {
      console.log('🔄 Technical error detected - reactivating token for user');
      try {
        const { reactivateAccessToken } = await import("../../lib/accessTokens");
        const reactivated = await reactivateAccessToken(accessToken);
        
        if (reactivated) {
          console.log('✅ Token successfully reactivated - user can retry');
        } else {
          console.error('❌ Failed to reactivate token');
        }
      } catch (reactivateErr) {
        console.error('❌ Error during token reactivation:', reactivateErr);
      }
    }
    
    Sentry.captureException(err, {
      tags: {
        api_route: "analyze",
        is_sample: isSample,
        error_type: err.status ? "openai_api_error" : "unknown_error",
        technical_error: isTechnicalError,
        token_reactivated: !isSample && accessToken && isTechnicalError
      },
      extra: {
        contract_length: sanitizedContract.length,
        error_status: err.status,
        error_code: err.code,
        attempts: MAX_RETRIES,
        access_token_prefix: accessToken ? accessToken.substring(0, 8) : 'none'
      },
    });
    
    if (err.status === 429) {
      return res.status(503).json({
        error: !isSample
          ? "Our AI service is experiencing high demand. Your access has been restored - please try again in 30 seconds."
          : "Our AI service is experiencing high demand. Please try again in 30 seconds."
      });
    }
    
    if (err.status === 401 || err.status === 403) {
      console.error("🔴 CRITICAL: OpenAI API key issue!");
      Sentry.captureMessage("OpenAI API authentication failed", {
        level: "fatal",
        tags: { critical: true }
      });
      
      return res.status(500).json({
        error: !isSample
          ? "Service temporarily unavailable. Your access has been restored. Please contact support at trustterms.help@outlook.com"
          : "Service temporarily unavailable. Please try again later or contact support."
      });
    }

    if (err.code === 'context_length_exceeded') {
      return res.status(400).json({
        error: "Contract is too complex for analysis. Please try a shorter version."
      });
    }

    if (err.message?.includes('timeout') || err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
      return res.status(504).json({
        error: !isSample
          ? "Analysis took too long. Your access has been restored - please try again."
          : "Analysis took too long. Please try again."
      });
    }

    if (err.status === 500 || err.status === 503) {
      return res.status(503).json({
        error: !isSample
          ? "Our AI service is temporarily down. Your access has been restored - please try again in a few minutes."
          : "Our AI service is temporarily down. Please try again in a few minutes."
      });
    }

    return res.status(500).json({
      error: !isSample
        ? "Analysis failed due to a technical issue. Your access has been restored - please try again or contact support at trustterms.help@outlook.com"
        : "Analysis failed. Please try again or contact support."
    });
  }
}