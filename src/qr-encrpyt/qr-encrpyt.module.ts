import { Module } from "@nestjs/common";
import { CryptoService } from "./qr-encrpyt.service";
import { CryptoController } from "./qr-encrpyt.controller";

@Module({
  controllers: [CryptoController],
  providers: [CryptoService],
})
export class QrEncrpytModule {}
