import type { NextApiRequest, NextApiResponse } from "next";
import * as Sentry from "@sentry/nextjs";
import { kv } from '@vercel/kv';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const failedCount = await kv.get<number>('monitoring:failed-payments-24h') || 0;
    
    if (failedCount > 10) {
      Sentry.captureMessage('High number of failed payments', {
        level: 'warning',
        tags: { monitoring: 'payments' },
        extra: { failed_count: failedCount }
      });
    }
    
    res.status(200).json({
      failed_payments_24h: failedCount,
      status: failedCount > 10 ? 'warning' : 'ok'
    });
  } catch (err) {
    console.error('Error fetching payment stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}