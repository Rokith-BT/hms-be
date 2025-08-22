import { Injectable } from '@nestjs/common';
import { CreateQrTypeDto } from './qr_type.dto';

@Injectable()
export class QrTypeService {
  create(createQrTypeDto: CreateQrTypeDto) {
    const crypto = require('crypto');

    const key = '12345678901234567890123456789012';
    const iv = '1234567890123456';

    function encrypt(text, key, iv) {
      const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        Buffer.from(key),
        Buffer.from(iv),
      );
      let encrypted = cipher.update(text, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      return encrypted;
    }

    function decrypt(encryptedText, key, iv) {
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(key),
        Buffer.from(iv),
      );
      console.log(encryptedText, 'encryptedText');

      let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }

    // const codeString = `console.log("This is secret JavaScript code!");`;

    const codeString = createQrTypeDto.text;

    const encryptedCode = encrypt(codeString, key, iv);
    console.log('Encrypted Code:\n', encryptedCode);

    const decryptedCode = decrypt(encryptedCode, key, iv);
    console.log('\nDecrypted Code:\n', decryptedCode);

    return {
      encrypted: encryptedCode,
      decrypted: decryptedCode,
    };
  }

  findAll() {
    return `This action returns all qrType`;
  }

  findOne(id: number) {
    return `This action returns a #${id} qrType`;
  }

  // update(id: number, updateQrTypeDto: UpdateQrTypeDto) {
  //   return `This action updates a #${id} qrType`;
  // }

  remove(id: number) {
    return `This action removes a #${id} qrType`;
  }
}
