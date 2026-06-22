import type { AuditHashProvider, AuditHashResult } from "./audit-logger";
import type { AuditRecord } from "./types";

export class Sha256AuditHashProvider implements AuditHashProvider {
  async hash(record: Omit<AuditRecord, "hash" | "hashAlgorithm">): Promise<AuditHashResult> {
    if (!globalThis.crypto?.subtle) {
      throw new Error("SHA-256 audit hashing requires Web Crypto support.");
    }

    const encoded = new TextEncoder().encode(stableStringify(record));
    const digest = await globalThis.crypto.subtle.digest("SHA-256", encoded);

    return {
      hash: toHex(digest),
      algorithm: "SHA-256"
    };
  }
}

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value ?? null);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();

  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(",")}}`;
}

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
