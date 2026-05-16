import { createHash, randomBytes } from "crypto";

export function generateTokenHex(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}
