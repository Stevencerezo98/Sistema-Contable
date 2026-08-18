/**
 * Cryptographic security service for Church Communications Accounting System.
 * Implements AES-GCM-256 encryption via Web Crypto API, PBKDF2 key derivation,
 * SHA-256 hashing for checksum verification and E2EE payload protection.
 */

const SALT_BYTES = 16;
const IV_BYTES = 12;
const ITERATIONS = 100000;

export class CryptoService {
  /**
   * Generates a random Uint8Array
   */
  private static getRandomBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    window.crypto.getRandomValues(bytes);
    return bytes;
  }

  /**
   * Converts Uint8Array or ArrayBuffer to base64 string
   */
  private static bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Converts base64 string to Uint8Array
   */
  private static base64ToBuffer(base64: string): Uint8Array {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Derives an AES-GCM CryptoKey from a passphrase and salt using PBKDF2
   */
  private static async deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passphraseKey = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: ITERATIONS,
        hash: 'SHA-256',
      },
      passphraseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypts plaintext string using AES-GCM-256 with a passphrase
   * Returns a self-contained envelope with salt, iv, and ciphertext
   */
  public static async encrypt(plaintext: string, passphrase: string = 'Iglesia_Comms_Secure_Vault_2025'): Promise<string> {
    try {
      const salt = this.getRandomBytes(SALT_BYTES);
      const iv = this.getRandomBytes(IV_BYTES);
      const key = await this.deriveKey(passphrase, salt);

      const encoder = new TextEncoder();
      const encodedData = encoder.encode(plaintext);

      const ciphertext = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        encodedData
      );

      const envelope = {
        v: 1,
        algo: 'AES-GCM-256',
        salt: this.bufferToBase64(salt),
        iv: this.bufferToBase64(iv),
        data: this.bufferToBase64(ciphertext),
        timestamp: new Date().toISOString(),
      };

      return JSON.stringify(envelope);
    } catch (err) {
      console.error('Encryption failed:', err);
      throw new Error('Error al cifrar los datos sensibles.');
    }
  }

  public static async encryptWithCustomKey(plaintext: string, key: string): Promise<string> {
    return this.encrypt(plaintext, key);
  }

  /**
   * Decrypts an encrypted envelope using the passphrase
   */
  public static async decrypt(encryptedEnvelopeJson: string, passphrase: string = 'Iglesia_Comms_Secure_Vault_2025'): Promise<string> {
    try {
      const envelope = JSON.parse(encryptedEnvelopeJson);
      if (!envelope.salt || !envelope.iv || !envelope.data) {
        throw new Error('Formato de sobre cifrado inválido.');
      }

      const salt = this.base64ToBuffer(envelope.salt);
      const iv = this.base64ToBuffer(envelope.iv);
      const ciphertext = this.base64ToBuffer(envelope.data);

      const key = await this.deriveKey(passphrase, salt);

      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        ciphertext
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (err) {
      console.error('Decryption failed:', err);
      throw new Error('Contraseña incorrecta o datos cifrados corruptos.');
    }
  }

  public static async decryptWithCustomKey(encryptedEnvelopeJson: string, key: string): Promise<string> {
    return this.decrypt(encryptedEnvelopeJson, key);
  }

  /**
   * Computes SHA-256 hex string for integrity validation
   */
  public static async computeSha256(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', encoder.encode(data));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  public static async generateSha256(data: string): Promise<string> {
    return this.computeSha256(data);
  }

  /**
   * Simulates WebAuthn biometric hardware registration or fallback
   */
  public static async isBiometricAvailable(): Promise<boolean> {
    if (window.PublicKeyCredential) {
      try {
        if (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          return available;
        }
      } catch {
        return false;
      }
    }
    return false;
  }
}
