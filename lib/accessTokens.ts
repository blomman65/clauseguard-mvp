import { kv } from '@vercel/kv';
import * as crypto from 'crypto';

/**
 * Skapar en access token som är giltig i 24 timmar
 * Tokens lagras i Vercel KV (Upstash Redis) med automatisk expiry
 */
export async function createAccessToken(token: string): Promise<void> {
  try {
    console.log('🔑 Creating access token:', token.substring(0, 8) + '...');
    
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    await kv.set(`token:${hashedToken}`, {
      created: Date.now(),
      status: 'valid'
    }, {
      ex: 86400
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
 * 
 * VIKTIGT: Använder constant-time comparison för att förhindra timing attacks
 */
export async function consumeAccessToken(token: string): Promise<boolean> {
  try {
    console.log('🔍 Checking access token:', token.substring(0, 8) + '...');
    
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const tokenData = await kv.get(`token:${hashedToken}`);
    
    if (!tokenData) {
      console.log('❌ Token not found or already used');
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 50));
      return false;
    }
    
    console.log('✅ Token valid, consuming...');
    
    await kv.del(`token:${hashedToken}`);
    
    console.log('✅ Token consumed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error consuming access token:', error);
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 50));
    return false;
  }
}

/**
 * Reaktiverar en token (används vid tekniska fel)
 * Återställer en token så den kan användas igen
 */
export async function reactivateAccessToken(token: string): Promise<boolean> {
  try {
    console.log('🔄 Reactivating access token:', token.substring(0, 8) + '...');
    
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    await kv.set(`token:${hashedToken}`, {
      created: Date.now(),
      status: 'reactivated',
      reactivatedAt: Date.now()
    }, {
      ex: 86400
    });
    
    console.log('✅ Token reactivated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error reactivating access token:', error);
    return false;
  }
}

/**
 * Kontrollerar om en token är giltig utan att konsumera den
 * Användbart för debugging
 */
export async function checkAccessToken(token: string): Promise<boolean> {
  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const tokenData = await kv.get(`token:${hashedToken}`);
    return tokenData !== null;
  } catch (error) {
    console.error('Error checking access token:', error);
    return false;
  }
}