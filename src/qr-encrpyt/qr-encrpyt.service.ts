import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";

@Injectable()
export class CryptoService {
  encrypt(text: string, base64Key: string, base64Iv: string): string {
    const key = Buffer.from(base64Key, "base64");
    const iv = Buffer.from(base64Iv, "base64");

    if (key.length !== 32) throw new Error("Key must be 32 bytes");
    if (iv.length !== 16) throw new Error("IV must be 16 bytes");

    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(text, "utf8");
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString("base64");
  }

  decrypt(encryptedText: string, key: string, iv: string): string {
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(key),
      Buffer.from(iv)
    );
    let decrypted = decipher.update(Buffer.from(encryptedText, "base64"));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}
