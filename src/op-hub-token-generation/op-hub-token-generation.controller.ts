import { Controller, Post, Body} from '@nestjs/common';
import { OpHubTokenGenerationService } from './op-hub-token-generation.service';
import { TokenGeneration } from './entities/op-hub-token-generation.entity';

@Controller('op-hub-token-generation')
export class OpHubTokenGenerationController {
  constructor(private readonly tokenGenerationService: OpHubTokenGenerationService) {}
  @Post()
  create(@Body() createTokenGeneration: TokenGeneration) {
    return this.tokenGenerationService.create(createTokenGeneration);
  }
}
