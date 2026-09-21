import { createHash, createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes } from 'crypto';
import * as bip39 from 'bip39';

const PBKDF2_ITERATIONS = 100_000;
const KEY_LEN = 32;
const IV_LEN = 12;

export function generateMnemonic(): string {
  return bip39.generateMnemonic(128);
}

export function validateMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic.trim().toLowerCase().replace(/\s+/g, ' '));
}

export function normalizeMnemonic(mnemonic: string): string {
  return mnemonic.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function derivePasswordVerifier(password: string, salt: Buffer): Buffer {
  return pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LEN, 'sha512');
}

export function derivePasswordKey(password: string, salt: Buffer): Buffer {
  return pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LEN, 'sha256');
}

export function vaultKeyFromMnemonic(mnemonic: string): Buffer {
  const seed = bip39.mnemonicToSeedSync(normalizeMnemonic(mnemonic));
  return createHash('sha256').update(seed).digest();
}

export function encryptAesGcm(plaintext: Buffer, key: Buffer): { ciphertext: Buffer; iv: Buffer; tag: Buffer } {
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { ciphertext: encrypted, iv, tag };
}

export function decryptAesGcm(ciphertext: Buffer, key: Buffer, iv: Buffer, tag: Buffer): Buffer {
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

export function encryptUtf8(text: string, key: Buffer): string {
  const { ciphertext, iv, tag } = encryptAesGcm(Buffer.from(text, 'utf8'), key);
  return Buffer.concat([iv, tag, ciphertext]).toString('base64');
}

export function decryptUtf8(payload: string, key: Buffer): string {
  const buf = Buffer.from(payload, 'base64');
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + 16);
  const ciphertext = buf.subarray(IV_LEN + 16);
  return decryptAesGcm(ciphertext, key, iv, tag).toString('utf8');
}

export function randomSalt(bytes = 16): Buffer {
  return randomBytes(bytes);
}

export function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a[i] ^ b[i];
  }
  return mismatch === 0;
}
