import { Controller, Get} from '@nestjs/common';
import { OpHubTokenInitiateService } from './op-hub-token-initiate.service';

@Controller('op-hub-token-initiate')
export class OpHubTokenInitiateController {
  constructor(private readonly tokenInitiateService: OpHubTokenInitiateService) {}
  @Get()
  findAll() {
    return this.tokenInitiateService.findAll();
  }
}
