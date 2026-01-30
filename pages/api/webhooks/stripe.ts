import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { randomUUID } from "crypto";
import { createAccessToken } from "../../../lib/accessTokens";
import { kv } from '@vercel/kv';
import * as Sentry from "@sentry/nextjs";
import { rateLimit, getClientIp } from "../../../lib/rateLimit";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-12-15.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const clientIp = getClientIp(req);
  const rateLimitResult = await rateLimit(
    `webhook:stripe:${clientIp}`,
    30,
    60
  );

  if (!rateLimitResult.success) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ Webhook rate limit exceeded from IP:', clientIp);
    }
    
    Sentry.captureMessage('Webhook rate limit exceeded', {
      level: 'warning',
      tags: { webhook: 'rate_limit_exceeded' },
      extra: { ip: clientIp }
    });
    
    return res.status(429).json({
      error: "Too many webhook requests"
    });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("❌ Missing stripe-signature header");
      }
      return res.status(400).json({ error: "Missing signature" });
    }

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
      300
    );

    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ Webhook verified: ${event.type} (${event.id})`);
    }

  } catch (err: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("❌ Webhook signature verification failed:", err.message);
    }
    
    Sentry.captureException(err, {
      tags: {
        webhook: "stripe_verification_failed",
        api_route: "webhooks/stripe"
      },
    });
    
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "charge.refunded":
        await handleRefund(event.data.object as Stripe.Charge);
        break;

      default:
        if (process.env.NODE_ENV !== 'production') {
          console.log(`ℹ️ Unhandled event type: ${event.type}`);
        }
    }

    res.status(200).json({ received: true });

  } catch (err: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("❌ Error handling webhook event:", err);
    }
    
    Sentry.captureException(err, {
      tags: {
        webhook: "event_handling_failed",
        event_type: event.type
      },
      extra: {
        event_id: event.id
      }
    });
    
    res.status(500).json({ error: "Webhook handler failed" });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (process.env.NODE_ENV !== 'production') {
    console.log("💳 Checkout completed:", session.id.substring(0, 8) + '...');
  }

  if (session.payment_status !== "paid") {
    if (process.env.NODE_ENV !== 'production') {
      console.warn("⚠️ Payment not completed:", session.payment_status);
    }
    return;
  }

  try {
    const token = randomUUID();
    await createAccessToken(token);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ Access token created: ${token.substring(0, 8)}...`);
    }
    
    await kv.set(
      `session:${session.id}`,
      token,
      { ex: 86400 }
    );
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ Session mapping stored: ${session.id.substring(0, 8)}... -> token`);
    }

  } catch (err: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("❌ Failed to create access token:", err);
    }
    
    Sentry.captureException(err, {
      tags: {
        webhook: "token_creation_failed",
        critical: true
      },
      extra: {
        session_id: session.id.substring(0, 8) + '...',
        payment_status: session.payment_status
      },
    });
    
    throw err;
  }
}

async function handleRefund(charge: Stripe.Charge) {
  if (process.env.NODE_ENV !== 'production') {
    console.log("💰 Refund processed:", charge.id);
  }
  
  Sentry.captureMessage('Refund processed', {
    level: 'info',
    tags: { webhook: 'refund' },
    extra: { charge_id: charge.id }
  });
}