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
import { SetupBedFloorService } from './setup-bed-floor.service';
import { SetupBedFloor } from './entities/setup-bed-floor.entity';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('setup-bed-floor')
export class SetupBedFloorController {
  constructor(private readonly setupBedFloorService: SetupBedFloorService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() floorEntity: SetupBedFloor) {
    return this.setupBedFloorService.create(floorEntity);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupBedFloorService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupBedFloorService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() floorEntity: SetupBedFloor) {
    return this.setupBedFloorService.update(id, floorEntity);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id: number) {
    return this.setupBedFloorService.remove(id, Hospital_id);
  }
  @UseGuards(AuthGuard)
  @Get('/keyword/setupFloor/:search')
  setupFloor(@Param('search') search: string) {
    return this.setupBedFloorService.setupFloor(search);
  }

  @UseGuards(AuthGuard)
  @Get("/v2/getAllBedFloor")
  async findAllBedFloor(
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupBedFloorService.findAllBedFloor(
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
  @Get("/v2/Setup_Bed_Floor")
  async findBedFloorSearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupBedFloorService.findBedFloorSearch(
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
