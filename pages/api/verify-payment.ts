import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { randomUUID } from "crypto";
import { createAccessToken } from "../../lib/accessTokens";
import { rateLimit, getClientIp } from "../../lib/rateLimit";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-12-15.clover",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Rate limit payment verification (förhindra spam)
  const clientIp = getClientIp(req);
  const rateLimitResult = await rateLimit(
    `verify-payment:${clientIp}`,
    20, // 20 verifieringar per timme
    3600
  );

  if (!rateLimitResult.success) {
    return res.status(429).json({ 
      error: "Too many verification attempts. Please try again later." 
    });
  }

  // Validering
  const { session_id } = req.query;

  if (!session_id || typeof session_id !== "string") {
    return res.status(400).json({ error: "Missing or invalid session_id" });
  }

  // Stripe session ID validation (ska börja med cs_)
  if (!session_id.startsWith('cs_')) {
    return res.status(400).json({ error: "Invalid session_id format" });
  }

  try {
    console.log('💳 Verifying payment for session:', session_id);
    
    // Hämta Stripe session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Kontrollera att betalningen är genomförd
    if (session.payment_status !== "paid") {
      return res.status(403).json({ 
        error: "Payment not completed",
        status: session.payment_status 
      });
    }

    // Kontrollera att sessionen inte är för gammal (24 timmar)
    const sessionCreated = session.created * 1000; // Convert to milliseconds
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    if (sessionCreated < twentyFourHoursAgo) {
      return res.status(403).json({ 
        error: "Session expired. Please make a new purchase." 
      });
    }

    // Skapa access token
    const token = randomUUID();
    await createAccessToken(token);

    console.log(`✅ Access token created for session ${session_id}`);

    return res.status(200).json({ 
      accessToken: token,
      expiresIn: 86400 // 24 timmar i sekunder
    });

  } catch (err: any) {
    console.error("❌ Payment verification error:", err);
    
    // Stripe-specifika fel
    if (err.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ 
        error: "Invalid session ID" 
      });
    }

    return res.status(500).json({ 
      error: "Verification failed. Please contact support." 
    });
  }
}