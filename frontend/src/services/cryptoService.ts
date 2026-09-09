// src/services/cryptoService.ts

/**
 * Utility service to handle Web Crypto API operations for End-to-End Encryption (E2EE).
 */

const ECDH_ALGO = { name: 'ECDH', namedCurve: 'P-256' };
const AES_GCM_ALGO = { name: 'AES-GCM', length: 256 };
const PBKDF2_ALGO = { name: 'PBKDF2' };
const ITERATIONS = 100000;
const HASH = 'SHA-256';

export const cryptoService = {
  // 1. Generate ECDH Key Pair
  async generateKeyPair(): Promise<CryptoKeyPair> {
    return await window.crypto.subtle.generateKey(
      ECDH_ALGO,
      true,
      ['deriveKey', 'deriveBits']
    );
  },

  // 2. Export Keys to Base64 Strings
  async exportPublicKey(publicKey: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('spki', publicKey);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  },

  async exportPrivateKey(privateKey: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('pkcs8', privateKey);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  },

  // 3. Import Keys from Base64 Strings
  async importPublicKey(base64Key: string): Promise<CryptoKey> {
    const binaryDerString = atob(base64Key);
    const binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
      binaryDer[i] = binaryDerString.charCodeAt(i);
    }
    return await window.crypto.subtle.importKey(
      'spki',
      binaryDer.buffer,
      ECDH_ALGO,
      true,
      []
    );
  },

  async importPrivateKey(base64Key: string): Promise<CryptoKey> {
    const binaryDerString = atob(base64Key);
    const binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
      binaryDer[i] = binaryDerString.charCodeAt(i);
    }
    return await window.crypto.subtle.importKey(
      'pkcs8',
      binaryDer.buffer,
      ECDH_ALGO,
      true,
      ['deriveKey', 'deriveBits']
    );
  },

  // 4. Derive Wrapping Key from Password
  async deriveWrappingKey(password: string, saltUsername: string): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      PBKDF2_ALGO,
      false,
      ['deriveBits', 'deriveKey']
    );

    return await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: enc.encode(saltUsername),
        iterations: ITERATIONS,
        hash: HASH,
      },
      keyMaterial,
      AES_GCM_ALGO,
      true,
      ['encrypt', 'decrypt']
    );
  },

  // 5. Wrap (Encrypt) Private Key
  async wrapPrivateKey(privateKey: CryptoKey, wrappingKey: CryptoKey): Promise<string> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const privateKeyBase64 = await this.exportPrivateKey(privateKey);
    const enc = new TextEncoder();
    const ciphertext = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      wrappingKey,
      enc.encode(privateKeyBase64)
    );

    const ciphertextArray = new Uint8Array(ciphertext);
    const combined = new Uint8Array(iv.length + ciphertextArray.length);
    combined.set(iv);
    combined.set(ciphertextArray, iv.length);
    return btoa(String.fromCharCode(...combined));
  },

  // 6. Unwrap (Decrypt) Private Key
  async unwrapPrivateKey(wrappedKeyBase64: string, wrappingKey: CryptoKey): Promise<CryptoKey> {
    const combinedString = atob(wrappedKeyBase64);
    const combined = new Uint8Array(combinedString.length);
    for (let i = 0; i < combinedString.length; i++) {
      combined[i] = combinedString.charCodeAt(i);
    }

    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      wrappingKey,
      ciphertext
    );
    const dec = new TextDecoder();
    const privateKeyBase64 = dec.decode(decrypted);
    return await this.importPrivateKey(privateKeyBase64);
  },

  // 7. Derive Shared Secret (ECDH)
  async deriveSharedSecret(privateKey: CryptoKey, publicKey: CryptoKey): Promise<CryptoKey> {
    return await window.crypto.subtle.deriveKey(
      {
        name: 'ECDH',
        public: publicKey,
      },
      privateKey,
      AES_GCM_ALGO,
      true,
      ['encrypt', 'decrypt']
    );
  },

  // 8. Encrypt Message Content
  async encryptMessage(text: string, sharedSecret: CryptoKey): Promise<string> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const ciphertext = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      sharedSecret,
      enc.encode(text)
    );

    const ciphertextArray = new Uint8Array(ciphertext);
    const combined = new Uint8Array(iv.length + ciphertextArray.length);
    combined.set(iv);
    combined.set(ciphertextArray, iv.length);
    return 'E2EE:' + btoa(String.fromCharCode(...combined));
  },

  // 9. Decrypt Message Content
  async decryptMessage(encryptedString: string, sharedSecret: CryptoKey): Promise<string> {
    if (!encryptedString.startsWith('E2EE:')) {
      return encryptedString; // Not encrypted or format error
    }
    const base64Str = encryptedString.substring(5);
    const combinedString = atob(base64Str);
    const combined = new Uint8Array(combinedString.length);
    for (let i = 0; i < combinedString.length; i++) {
      combined[i] = combinedString.charCodeAt(i);
    }

    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      sharedSecret,
      ciphertext
    );
    const dec = new TextDecoder();
    return dec.decode(decrypted);
  },

  // 10. Encrypt File
  async encryptFile(file: File, sharedSecret: CryptoKey): Promise<File> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const arrayBuffer = await file.arrayBuffer();
    
    const ciphertext = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      sharedSecret,
      arrayBuffer
    );
    
    const ciphertextArray = new Uint8Array(ciphertext);
    const combined = new Uint8Array(iv.length + ciphertextArray.length);
    combined.set(iv);
    combined.set(ciphertextArray, iv.length);
    
    return new File([combined], file.name, { type: file.type });
  },

  // 11. Decrypt File
  async decryptFile(encryptedBlob: Blob, sharedSecret: CryptoKey, fileType: string): Promise<Blob> {
    const arrayBuffer = await encryptedBlob.arrayBuffer();
    const combined = new Uint8Array(arrayBuffer);
    
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      sharedSecret,
      ciphertext
    );
    
    return new Blob([decrypted], { type: fileType });
  }
};
