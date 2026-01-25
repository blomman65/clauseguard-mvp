import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from '@vercel/kv';

interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  services: {
    api: boolean;
    redis: boolean;
    openai_key: boolean;
    stripe_key: boolean;
  };
  version: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthStatus>
) {
  const services = {
    api: true,
    redis: false,
    openai_key: false,
    stripe_key: false,
  };

  // Check Redis/KV
  try {
    await kv.set('health:ping', Date.now(), { ex: 10 });
    const pong = await kv.get('health:ping');
    services.redis = pong !== null;
  } catch (err) {
    console.error('Health check - Redis failed:', err);
  }

  // Check OpenAI API key exists and format
  services.openai_key = !!(
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY.startsWith('sk-')
  );

  // Check Stripe key exists and format
  services.stripe_key = !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_SECRET_KEY.startsWith('sk_')
  );

  // Determine overall status
  const allHealthy = Object.values(services).every(s => s === true);
  const someHealthy = Object.values(services).some(s => s === true);

  const status: 'ok' | 'degraded' | 'down' = allHealthy
    ? 'ok'
    : someHealthy
    ? 'degraded'
    : 'down';

  const healthStatus: HealthStatus = {
    status,
    timestamp: new Date().toISOString(),
    services,
    version: process.env.npm_package_version || '1.0.0',
  };

  const statusCode = status === 'ok' ? 200 : status === 'degraded' ? 503 : 503;

  res.status(statusCode).json(healthStatus);
}