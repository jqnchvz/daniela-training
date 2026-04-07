import { describe, it, expect } from "vitest";
import { hashPin } from "@/lib/pin-hash";

describe("hashPin", () => {
  it("produces a consistent hex string for the same input", async () => {
    const hash1 = await hashPin("1234");
    const hash2 = await hashPin("1234");
    expect(hash1).toBe(hash2);
  });

  it("produces different outputs for different inputs", async () => {
    const hash1 = await hashPin("1234");
    const hash2 = await hashPin("5678");
    expect(hash1).not.toBe(hash2);
  });

  it("returns a 64-character hex string (SHA-256)", async () => {
    const hash = await hashPin("1234");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("does NOT return the original plaintext", async () => {
    const pin = "1234";
    const hash = await hashPin(pin);
    expect(hash).not.toBe(pin);
  });
});
