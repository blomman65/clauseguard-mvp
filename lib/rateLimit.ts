import { kv } from '@vercel/kv';

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Rate limiter som använder sliding window algorithm
 * 
 * @param identifier - Unik identifierare (t.ex. IP-adress)
 * @param limit - Max antal requests
 * @param windowSeconds - Tidsfönster i sekunder
 * @returns RateLimitResult med success status och metadata
 */
export async function rateLimit(
  identifier: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`;
  
  try {
    console.log('🔒 Rate limit check for:', identifier);
    console.log('🔒 Limit:', limit, 'Window:', windowSeconds + 's');
    
    // Hämta nuvarande count
    const current = await kv.get<number>(key);
    
    console.log('🔒 Current count:', current);
    
    if (current === null) {
      // Första requesten i detta window
      await kv.set(key, 1, { ex: windowSeconds });
      
      console.log('✅ First request in window - allowed');
      
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: Date.now() + (windowSeconds * 1000)
      };
    }
    
    if (current >= limit) {
      // Rate limit överskriden
      const ttl = await kv.ttl(key);
      
      console.log('❌ Rate limit exceeded!');
      
      return {
        success: false,
        limit,
        remaining: 0,
        reset: Date.now() + (ttl * 1000)
      };
    }
    
    // Öka counter
    await kv.incr(key);
    
    const ttl = await kv.ttl(key);
    
    console.log('✅ Request allowed -', (limit - current - 1), 'remaining');
    
    return {
      success: true,
      limit,
      remaining: limit - current - 1,
      reset: Date.now() + (ttl * 1000)
    };
    
  } catch (error) {
    console.error('❌ Rate limit error:', error);
    
    // Fail open - tillåt request vid fel
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + (windowSeconds * 1000)
    };
  }
}

/**
 * Helper för att extrahera IP-adress från request
 */
export function getClientIp(req: any): string {
  // Försök hämta IP från olika headers (Vercel sätter x-forwarded-for)
  const forwarded = req.headers['x-forwarded-for'];
  
  if (forwarded) {
    // x-forwarded-for kan vara en lista, ta första IP
    return typeof forwarded === 'string' 
      ? forwarded.split(',')[0].trim()
      : forwarded[0];
  }
  
  return req.headers['x-real-ip'] || 
         req.socket?.remoteAddress || 
         'unknown';
}