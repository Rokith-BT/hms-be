import { Body, Controller, Post } from "@nestjs/common";
import { CryptoService } from "./qr-encrpyt.service";

@Controller("crypto")
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Post("encrypt")
  encrypt(@Body() body: any) {
    try {
      console.log(body, "log");

      const encrypted = this.cryptoService.encrypt(
        JSON.stringify(body),
        process.env.encryption_key,
        process.env.encryption_iv
      );
      return { encrypted };
    } catch (err) {
      return { error: "Encryption failed", details: err.message };
    }
  }

  @Post("decrypt")
  decrypt(@Body() body: any) {
    try {
      const decrypted = this.cryptoService.decrypt(
        body,
        process.env.encryption_key,
        process.env.encryption_iv
      );
      return { decrypted };
    } catch (err) {
      return { error: "Decryption failed", details: err.message };
    }
  }
}
