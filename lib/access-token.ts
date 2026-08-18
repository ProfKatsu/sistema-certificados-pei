import crypto from "crypto";

const secret = () => process.env.ADMIN_PASSWORD || "change-this-secret";

export function createParticipantToken(codigo: string, ttlSeconds = 600) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${codigo}.${exp}`;
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyParticipantToken(codigo: string, token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [tokenCodigo, expRaw, sig] = parts;
  if (tokenCodigo !== codigo) return false;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = crypto.createHmac("sha256", secret()).update(`${tokenCodigo}.${exp}`).digest("hex");
  try { return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)); } catch { return false; }
}
