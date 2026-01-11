const tokens = new Map<string, { used: boolean }>();

export function createAccessToken(token: string) {
  tokens.set(token, { used: false });
}

export function consumeAccessToken(token: string): boolean {
  const entry = tokens.get(token);
  if (!entry || entry.used) return false;
  entry.used = true;
  return true;
}
