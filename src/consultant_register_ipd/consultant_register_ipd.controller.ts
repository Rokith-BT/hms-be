import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ConsultantRegisterIpdService } from './consultant_register_ipd.service';
import { ConsultantRegisterIpd } from './entities/consultant_register_ipd.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('consultant-register-ipd')
export class ConsultantRegisterIpdController {
  constructor(
    private readonly consultantRegisterIpdService: ConsultantRegisterIpdService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createConsultantRegisterIpd: ConsultantRegisterIpd) {
    return this.consultantRegisterIpdService.create(
      createConsultantRegisterIpd,
    );
  }
  @UseGuards(AuthGuard)
  @Patch('/:id')
  update(
    @Param('id') id: number,
    @Body() createConsultantRegisterIpd: ConsultantRegisterIpd,
  ) {
    return this.consultantRegisterIpdService.update(
      id,
      createConsultantRegisterIpd,
    );
  }
  @UseGuards(AuthGuard)
  @Get('/ConsultantReg/:id')
  findConsRegSearch(@Param('id') id: number, @Query('search') search: string) {
    return this.consultantRegisterIpdService.findConsRegSearch(id, search);
  }
  @UseGuards(AuthGuard)
  @Delete('/:id')
  async removeConsultantRegister(
    @Param('id') id: number,
    @Query('Hospital_id') Hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.consultantRegisterIpdService.remove(id, Hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }

  @UseGuards(AuthGuard)
  @Get('/v2/get_consultant_register_ipd_details')
  async findConusltantRegisterIpdDetails(
    @Query('ipd_id') ipd_id: number,
    @Query('search') search?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
  ) {
    try {
      if (!ipd_id) {
        return {
          status_code: process.env.BAD_REQUEST_CODE,
          status: process.env.BAD_REQUEST_STATUS,
          message: 'IPD ID is required',
        };
      }

      const final_out = await this.consultantRegisterIpdService.findConusltantRegisterIpdDetails(
        ipd_id,
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
          data: [],
          total: 0,
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


  @UseGuards(AuthGuard)
  @Get('/v3/get_consultant_register_ipd_details')
  async findConusltantRegisterIpdDetail(
    @Query('ipd_id') ipd_id: number,
    @Query('search') search?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
  ) {
    try {
      if (!ipd_id) {
        return {
          status_code: process.env.BAD_REQUEST_CODE,
          status: process.env.BAD_REQUEST_STATUS,
          message: 'IPD ID is required',
        };
      }

      const final_out = await this.consultantRegisterIpdService.findConusltantRegisterIpdDetail(
        ipd_id,
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
          data: [],
          total: 0,
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


}
