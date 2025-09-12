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
import { SetupBedBedGroupService } from './setup-bed-bed_group.service';
import { SetupBedBedGroup } from './entities/setup-bed-bed_group.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-bed-bed-group')
export class SetupBedBedGroupController {
  constructor(
    private readonly setupBedBedGroupService: SetupBedBedGroupService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() bed_groupEntity: SetupBedBedGroup) {
    return this.setupBedBedGroupService.create(bed_groupEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupBedBedGroupService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupBedBedGroupService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() bed_groupEntity: SetupBedBedGroup) {
    return this.setupBedBedGroupService.update(id, bed_groupEntity);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id: number) {
    return this.setupBedBedGroupService.remove(id, Hospital_id);
  }
  @UseGuards(AuthGuard)
  @Get('/keyword/setupBedGroup/:search')
  setupBedGroup(@Param('search') search: string) {
    return this.setupBedBedGroupService.setupBedGroup(search);
  }

  @UseGuards(AuthGuard)
  @Get("/v2/getAllBedGroup")
  async findAllBedGroup(
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupBedBedGroupService.findAllBedGroup(
        limit || 10,
        page || 1
      );

      if (final_out.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_out.details,
          total: final_out.total,
        };
      }
      else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.DATA_NOT_FOUND
        }
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE
      }
    }

  }

  @UseGuards(AuthGuard)
  @Get("/v2/Setup_Bed_Group")
  async findBedgroupSearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupBedBedGroupService.findBedgroupSearch(
        search,
        limit || 10,
        page || 1
      );

      if (final_out.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_out.details,
          total: final_out.total,
        };
      }
      else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.DATA_NOT_FOUND
        }
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE
      }
    }

  }

}
