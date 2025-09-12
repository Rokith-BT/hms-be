import { PartialType } from '@nestjs/swagger';
import { CreateQrEncrpytDto } from './create-qr-encrpyt.dto';

export class UpdateQrEncrpytDto extends PartialType(CreateQrEncrpytDto) {}
