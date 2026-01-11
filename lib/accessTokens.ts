const validTokens = new Set<string>();

export function createAccessToken(token: string) {
  validTokens.add(token);
}

export function consumeAccessToken(token: string): boolean {
  if (!validTokens.has(token)) return false;
  validTokens.delete(token); // one-time use
  return true;
}
