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
import { SetupFrontOfficeComplainTypeService } from './setup_front_office_complain_type.service';
import { SetupFrontOfficeComplainType } from './entities/setup_front_office_complain_type.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-front-office-complain-type')
export class SetupFrontOfficeComplainTypeController {
  constructor(
    private readonly setupFrontOfficeComplainTypeService: SetupFrontOfficeComplainTypeService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() complaintypeEntity: SetupFrontOfficeComplainType) {
    return this.setupFrontOfficeComplainTypeService.create(complaintypeEntity);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupFrontOfficeComplainTypeService.findAll();
  }
  @UseGuards(AuthGuard)

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupFrontOfficeComplainTypeService.findOne(id);
  }
  @UseGuards(AuthGuard)

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() complaintypeEntity: SetupFrontOfficeComplainType,
  ) {
    return this.setupFrontOfficeComplainTypeService.update(
      id,
      complaintypeEntity,
    );
  }
  @UseGuards(AuthGuard)

  @Delete(':id')
  remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id: number) {
    return this.setupFrontOfficeComplainTypeService.remove(id, Hospital_id);
  }
  @UseGuards(AuthGuard)

  @Get('/SetupFrontofficeComplaintType/:search')
  SetupFrontofficeComplainType(@Param('search') search: string) {
    return this.setupFrontOfficeComplainTypeService.SetupFrontofficeComplainType(
      search,
    );
  }
  @UseGuards(AuthGuard)

  @Get('/v2/getAllpage')
  findAllDesig(@Query('limit') limit: number, @Query('pagenumber') pagenumber: number) {
    return this.setupFrontOfficeComplainTypeService.find_complaintype(limit, pagenumber);
  }

}
