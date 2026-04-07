/**
 * Hash a PIN string using SHA-256 via the Web Crypto API.
 * Returns the digest as a lowercase hex string.
 */
export async function hashPin(pin: string): Promise<string> {
  const encoded = new TextEncoder().encode(pin);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
