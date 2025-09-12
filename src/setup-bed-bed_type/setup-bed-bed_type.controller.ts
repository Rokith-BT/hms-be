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
import { SetupBedBedTypeService } from './setup-bed-bed_type.service';
import { SetupBedBedType } from './entities/setup-bed-bed_type.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-bed-bed-type')
export class SetupBedBedTypeController {
  constructor(
    private readonly setupBedBedTypeService: SetupBedBedTypeService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() bed_typeEntity: SetupBedBedType) {
    return this.setupBedBedTypeService.create(bed_typeEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupBedBedTypeService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupBedBedTypeService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() bed_typeEntity: SetupBedBedType) {
    return this.setupBedBedTypeService.update(id, bed_typeEntity);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id: number) {
    return this.setupBedBedTypeService.remove(id, Hospital_id);
  }
  @UseGuards(AuthGuard)
  @Get('/keyword/setupBedType/:search')
  setupBedType(@Param('search') search: string) {
    return this.setupBedBedTypeService.setupBedType(search);
  }

  @UseGuards(AuthGuard)
  @Get("/v2/getAllBedType")
  async findAllBedType(
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupBedBedTypeService.findAllBedType(
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
  @Get("/v2/Setup_Bed_Type")
  async findBedTypeSearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupBedBedTypeService.findBedTypeSearch(
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
