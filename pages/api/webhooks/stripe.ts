import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { randomUUID } from "crypto";
import { createAccessToken } from "../../../lib/accessTokens";
import { kv } from '@vercel/kv';
import * as Sentry from "@sentry/nextjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-12-15.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

// VIKTIGT: Disable body parsing, behöver raw body för webhook verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper för att läsa raw body
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

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
      console.error("❌ Missing stripe-signature header");
      return res.status(400).json({ error: "Missing signature" });
    }

    // Verifiera att requesten verkligen kommer från Stripe
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );

    console.log(`✅ Webhook verified: ${event.type} (${event.id})`);

  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    
    Sentry.captureException(err, {
      tags: { 
        webhook: "stripe_verification_failed",
        api_route: "webhooks/stripe"
      },
    });
    
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Hantera olika event types
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "charge.refunded":
        await handleRefund(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    // Returnera 200 för att bekräfta att vi tagit emot eventet
    res.status(200).json({ received: true });

  } catch (err: any) {
    console.error("❌ Error handling webhook event:", err);
    
    Sentry.captureException(err, {
      tags: { 
        webhook: "event_handling_failed",
        event_type: event.type
      },
      extra: {
        event_id: event.id
      }
    });
    
    // Returnera 500 så Stripe försöker igen
    res.status(500).json({ error: "Webhook handler failed" });
  }
}

// Hantera genomförd betalning
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("💳 Checkout completed:", session.id);

  // Kontrollera att betalningen är genomförd
  if (session.payment_status !== "paid") {
    console.warn("⚠️ Payment not completed:", session.payment_status);
    return;
  }

  try {
    // Skapa access token
    const token = randomUUID();
    await createAccessToken(token);
    
    console.log(`✅ Access token created: ${token.substring(0, 8)}...`);
    
    // Lagra mapping mellan session_id och token
    // Detta gör att vi kan hämta token från /api/verify-payment
    await kv.set(
      `session:${session.id}`, 
      token, 
      { ex: 86400 } // 24 timmar
    );
    
    console.log(`✅ Session mapping stored: ${session.id} -> token`);

    // Optional: Skicka email med token (om du har email från Stripe)
    // const customerEmail = session.customer_details?.email;
    // if (customerEmail) {
    //   await sendAccessTokenEmail(customerEmail, token);
    // }

  } catch (err: any) {
    console.error("❌ Failed to create access token:", err);
    
    Sentry.captureException(err, {
      tags: { 
        webhook: "token_creation_failed",
        critical: true 
      },
      extra: { 
        session_id: session.id,
        payment_status: session.payment_status
      },
    });
    
    throw err; // Re-throw så Stripe försöker igen
  }
}

// Hantera refunds
async function handleRefund(charge: Stripe.Charge) {
  console.log("💰 Refund processed:", charge.id);
  
  // Hitta session ID från charge metadata (om vi lagrat det)
  // För nu loggar vi bara - du kan lägga till logik för att invalidera tokens
  
  // TODO: Om du vill kan du invalidera access token här
  // const sessionId = charge.metadata?.session_id;
  // if (sessionId) {
  //   await kv.del(`session:${sessionId}`);
  //   await kv.del(`token:${token}`);
  // }
}