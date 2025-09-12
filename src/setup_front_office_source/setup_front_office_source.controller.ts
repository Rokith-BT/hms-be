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
import { SetupFrontOfficeSourceService } from './setup_front_office_source.service';
import { SetupFrontOfficeSource } from './entities/setup_front_office_source.entity';
import { AuthGuard } from 'src/auth/auth.guard';
@Controller('setup-front-office-source')
export class SetupFrontOfficeSourceController {
  constructor(
    private readonly setupFrontOfficeSourceService: SetupFrontOfficeSourceService,
  ) { }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() SetupFrontOfficeSourceEntity: SetupFrontOfficeSource) {
    return this.setupFrontOfficeSourceService.create(
      SetupFrontOfficeSourceEntity,
    );
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupFrontOfficeSourceService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupFrontOfficeSourceService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() SetupFrontOfficeSourceEntity: SetupFrontOfficeSource,
  ) {
    return this.setupFrontOfficeSourceService.update(
      id,
      SetupFrontOfficeSourceEntity,
    );
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id: number) {
    return this.setupFrontOfficeSourceService.remove(id, Hospital_id);
  }
  @UseGuards(AuthGuard)
  @Get('/SetupFrontofficeSource/:search')
  setupFrontofficeSource(@Param('search') search: string) {
    return this.setupFrontOfficeSourceService.setupFrontofficeSource(search);
  }
  @UseGuards(AuthGuard)
  @Get('/v2/getallsource')
  findAllDesig(@Query('limit') limit: number, @Query('pagenumber') pagenumber: number) {
    return this.setupFrontOfficeSourceService.finadallsource(limit, pagenumber);
  }
}
