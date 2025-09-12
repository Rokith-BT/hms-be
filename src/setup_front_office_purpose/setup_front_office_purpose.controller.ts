import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SetupFrontOfficePurposeService } from './setup_front_office_purpose.service';
import { SetupFrontOfficePurpose } from './entities/setup_front_office_purpose.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-front-office-purpose')
export class SetupFrontOfficePurposeController {
  constructor(
    private readonly setupFrontOfficePurposeService: SetupFrontOfficePurposeService,
  ) { }
  @UseGuards(AuthGuard)

  @Post()
  create(@Body() purposeEntity: SetupFrontOfficePurpose) {
    return this.setupFrontOfficePurposeService.create(purposeEntity);
  }
  @UseGuards(AuthGuard)

  @Get()
  findAll() {
    return this.setupFrontOfficePurposeService.findAll();
  }
  @UseGuards(AuthGuard)

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupFrontOfficePurposeService.findOne(id);
  }
  @UseGuards(AuthGuard)

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() purposeEntity: SetupFrontOfficePurpose,
  ) {
    return this.setupFrontOfficePurposeService.update(id, purposeEntity);
  }
  @UseGuards(AuthGuard)

  @Delete(':id')
  remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id: number) {
    return this.setupFrontOfficePurposeService.remove(id, Hospital_id);
  }
  @UseGuards(AuthGuard)
  @Get('/SetupFrontofficePurpose/:search')
  SetupFrontOfficePurpose(@Param('search') search: string) {
    return this.setupFrontOfficePurposeService.SetupFrontOfficePurpose(search);
  }
  @UseGuards(AuthGuard)
  @Get('/v2/getAllpurpose')
  findAllDesig(@Query('limit') limit: number, @Query('pagenumber') pagenumber: number) {
    return this.setupFrontOfficePurposeService.findALLPURPOSE(limit, pagenumber);
  }
}
