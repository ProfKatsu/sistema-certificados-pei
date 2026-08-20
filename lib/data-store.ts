import crypto from "crypto";
import encryptedData from "@/data/participants.data.json";

export type Participant = {
  codigo: string;
  nome: string;
  nomeBusca: string;
  cpf: string;
  email: string | null;
  cargo: string | null;
  ure: string | null;
  evento: string;
  data_evento: string;
  local: string;
  hora: string;
  status: string;
};

type EncryptedPayload = {
  version: number;
  algorithm: string;
  iv: string;
  authTag: string;
  ciphertext: string;
};

function getKey() {
  const raw = process.env.CERTIFICATE_DATA_KEY || "";
  if (!/^[0-9a-fA-F]{64}$/.test(raw)) {
    throw new Error("CERTIFICATE_DATA_KEY não configurada ou inválida. Use uma chave hexadecimal de 64 caracteres.");
  }
  return Buffer.from(raw, "hex");
}

export function getParticipants(): Participant[] {
  const key = getKey();
  const iv = Buffer.from(encryptedData.iv, "base64");
  const authTag = Buffer.from(encryptedData.authTag, "base64");
  const ciphertext = Buffer.from(encryptedData.ciphertext, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(plaintext.toString("utf8")) as Participant[];
}

export function encryptParticipants(participants: Participant[]): EncryptedPayload {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(participants), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    version: 1,
    algorithm: "aes-256-gcm",
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    ciphertext: ciphertext.toString("base64")
  };
}

export function normalizeCpf(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeName(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export function findByCode(codigo: string) {
  const code = codigo.trim().toUpperCase();
  return getParticipants().find((p) => p.codigo.toUpperCase() === code && p.status === "VALIDO") || null;
}
