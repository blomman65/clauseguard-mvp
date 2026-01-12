import { kv } from '@vercel/kv';

/**
 * Skapar en access token som är giltig i 24 timmar
 * Tokens lagras i Vercel KV (Upstash Redis) med automatisk expiry
 */
export async function createAccessToken(token: string): Promise<void> {
  try {
    console.log('🔑 Creating access token:', token.substring(0, 8) + '...');
    
    // Lagra token med 24 timmars TTL (time to live)
    await kv.set(`token:${token}`, {
      created: Date.now(),
      status: 'valid'
    }, {
      ex: 86400 // 24 timmar i sekunder
    });
    
    console.log('✅ Access token created successfully');
  } catch (error) {
    console.error('❌ Error creating access token:', error);
    throw new Error('Failed to create access token');
  }
}

/**
 * Konsumerar en access token (one-time use)
 * Returnerar true om token är giltig, false annars
 */
export async function consumeAccessToken(token: string): Promise<boolean> {
  try {
    console.log('🔍 Checking access token:', token.substring(0, 8) + '...');
    
    // Kontrollera om token finns
    const tokenData = await kv.get(`token:${token}`);
    
    if (!tokenData) {
      console.log('❌ Token not found or already used');
      return false;
    }
    
    console.log('✅ Token valid, consuming...');
    
    // Ta bort token (one-time use)
    await kv.del(`token:${token}`);
    
    console.log('✅ Token consumed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error consuming access token:', error);
    return false;
  }
}

/**
 * Kontrollerar om en token är giltig utan att konsumera den
 * Användbart för debugging
 */
export async function checkAccessToken(token: string): Promise<boolean> {
  try {
    const tokenData = await kv.get(`token:${token}`);
    return tokenData !== null;
  } catch (error) {
    console.error('Error checking access token:', error);
    return false;
  }
}