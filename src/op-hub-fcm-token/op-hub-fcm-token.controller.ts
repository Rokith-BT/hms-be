import { Controller, Post, Body } from '@nestjs/common';
import { OpHubFcmTokenService } from './op-hub-fcm-token.service';
import { CreateOpHubFcmTokenDto } from './dto/create-op-hub-fcm-token.dto';

@Controller('op-hub-fcm-token')
export class OpHubFcmTokenController {
  constructor(private readonly opHubFcmTokenService: OpHubFcmTokenService) { }

  @Post()
  create(@Body() createOpHubFcmTokenDto: CreateOpHubFcmTokenDto) {
    return this.opHubFcmTokenService.create(createOpHubFcmTokenDto);
  }

}
