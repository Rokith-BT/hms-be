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
import { IpdMainModuleService } from './ipd_main_module.service';
import { IpdMainModule } from './entities/ipd_main_module.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('ipd-main-module')
export class IpdMainModuleController {
  constructor(private readonly ipdMainModuleService: IpdMainModuleService) {}
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() ipdMainEntity: IpdMainModule) {
    return this.ipdMainModuleService.create(ipdMainEntity);
  }
  @UseGuards(AuthGuard)
  @Post('/appointmentIPD')
  create_appt_ipd(@Body() ipdMainEntity: IpdMainModule) {
    return this.ipdMainModuleService.create_appt_ipd(ipdMainEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.ipdMainModuleService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.ipdMainModuleService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Get('/symptoms/:id')
  findTitleByType(@Param('id') id: number) {
    return this.ipdMainModuleService.findTitleByType(id);
  }
  @UseGuards(AuthGuard)
  @Get('/symptomDescription/:id')
  findDescriptionbytitle(@Param('id') id: number) {
    return this.ipdMainModuleService.findDescByOne(id);
  }
  @UseGuards(AuthGuard)
  @Get('/internal/bedName/:id')
  findBedByBedgroup(@Param('id') id: number) {
    return this.ipdMainModuleService.findBedByBedgroup(id);
  }
  @UseGuards(AuthGuard)
  @Get('/keyword/:search')
  findByIPDIdByAll(@Param('search') search: string) {
    return this.ipdMainModuleService.findByIPDIdByAll(search);
  }
  @UseGuards(AuthGuard)
  @Patch('/:id')
  update(@Param('id') id: number, @Body() IPDENTITY: IpdMainModule) {
    return this.ipdMainModuleService.update(id, IPDENTITY);
  }
  @UseGuards(AuthGuard)
  @Delete('/:id')
  async removeIpd(
    @Param('id') id: number,
    @Query('hospital_id') hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.ipdMainModuleService.remove(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
  @UseGuards(AuthGuard)
  @Patch('/isIPDMoved/:id')
  updateIsIpdMoved(@Param('id') id: number, @Body() IPDENTITY: IpdMainModule) {
    return this.ipdMainModuleService.updateIsIpdMoved(id, IPDENTITY);
  }

  @UseGuards(AuthGuard)
  @Get('/v2/ipd_details')
  async findIpdDetailsSearch(
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    try {
      let final_out = await this.ipdMainModuleService.findIpdDetailsSearch(
        search,
        limit || 10,
        page || 1,
      );

      if (final_out.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_out.details,
          total: final_out.total,
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.DATA_NOT_FOUND,
        };
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE,
      };
    }
  }

  // @UseGuards(AuthGuard)
  @Get('/v3/ipd_details')
  async findIpdDetailSearch(
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    try {
      let final_out = await this.ipdMainModuleService.findIpdDetailSearch(
        search,
        limit || 10,
        page || 1,
      );

      if (final_out.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_out.details,
          total: final_out.count,
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.DATA_NOT_FOUND,
        };
      }
      return final_out;
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE,
      };
    }
  }
}
