import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { randomUUID } from "crypto";
import { createAccessToken } from "../../lib/accessTokens";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-12-15.clover",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { session_id } = req.query;

  if (!session_id || typeof session_id !== "string") {
    return res.status(400).json({ error: "Missing session_id" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(403).json({ error: "Payment not completed" });
    }

    const token = randomUUID();
    createAccessToken(token);

    res.status(200).json({ accessToken: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verification failed" });
  }
}
