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
import { SetupFindingsFindingService } from './setup-findings-finding.service';
import { SetupFindingsFinding } from './entities/setup-findings-finding.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-findings-finding')
export class SetupFindingsFindingController {
  constructor(
    private readonly setupFindingsFindingService: SetupFindingsFindingService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() findingEntity: SetupFindingsFinding) {
    return this.setupFindingsFindingService.create(findingEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupFindingsFindingService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupFindingsFindingService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() findingEntity: SetupFindingsFinding) {
    return this.setupFindingsFindingService.update(id, findingEntity);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id: number) {
    return this.setupFindingsFindingService.remove(id, Hospital_id);
  }
  @UseGuards(AuthGuard)
  @Get('/Setupfinding/:search')
  setupFinding(@Param('search') search: string) {
    return this.setupFindingsFindingService.setupFinding(search);
  }

  @UseGuards(AuthGuard)
  @Get('/v2/getAllfinding')
  async findAllDesig(@Query('limit') limit: number, @Query('page') page: number,@Query('search') search:string) {

    try {
      let final_output = await this.setupFindingsFindingService.find_findings(
        limit || 10,
        page || 1,
        search || ''
      );

      if (final_output.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output.details,
          total: final_output.total,
          limit:final_output.limit,
          totalpages: Math.ceil(final_output.total / final_output.limit)
        }
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE
      }
    }

    return this.setupFindingsFindingService.find_findings(limit, page, search);
  }





}
