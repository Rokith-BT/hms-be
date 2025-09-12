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
import { InternalIpdChargesService } from './internal-ipd-charges.service';
import { InternalIpdCharge } from './entities/internal-ipd-charge.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('internal-ipd-charges')
export class InternalIpdChargesController {
  constructor(
    private readonly internalIpdChargesService: InternalIpdChargesService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() InternalOpdChargeentity: InternalIpdCharge[]) {
    return this.internalIpdChargesService.create(InternalOpdChargeentity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll(
    @Query('ipd_id') ipd_id: number,
    @Query('patient_id') patient_id: number,
  ) {
    return this.internalIpdChargesService.findAll(ipd_id, patient_id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() InternalIpdChargeentity: InternalIpdCharge,
  ) {
    return this.internalIpdChargesService.update(id, InternalIpdChargeentity);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @Query('Hospital_id') Hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    const deleteipdCharges = await this.internalIpdChargesService.remove(
      id,
      Hospital_id,
    );
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
  @UseGuards(AuthGuard)
  @Get('/charges/:id')
  findcharges(@Param('id') id: string) {
    return this.internalIpdChargesService.findcharges(id);
  }
  @UseGuards(AuthGuard)
  @Get('/amount/:id')
  findAmount(@Param('id') id: number) {
    return this.internalIpdChargesService.findAmount(id);
  }
  @UseGuards(AuthGuard)
  @Get('/keyword/Search')
  async findOpdChargesDetailsSearch(
    @Query('patientId') patientId: number,
    @Query('ipdDetailsId') ipdDetailsId: number,
    @Query('search') search: string,
  ): Promise<InternalIpdCharge[]> {
    try {
      return await this.internalIpdChargesService.findOpdChargesDetailsSearch(
        patientId,
        ipdDetailsId,
        search,
      );
    } catch (error) {
      throw new Error(`Failed to insert or update data: ${error.message}`);
    }
  }
  @UseGuards(AuthGuard)
  @Get('/v2/get_ipd_charges')
  async findIpdChargeDetails(
    @Query('ipd_id') ipd_id: number,
    @Query('patient_id') patient_id: number,
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

      if (!patient_id) {
        return {
          status_code: process.env.BAD_REQUEST_CODE,
          status: process.env.BAD_REQUEST_STATUS,
          message: 'Patient ID is required',
        };
      }

      const final_out =
        await this.internalIpdChargesService.findIpdChargeDetails(
          ipd_id,
          patient_id,
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
  @Get('/v3/get_ipd_charges')
  async findIpdChargeDetail(
    @Query('ipd_id') ipd_id: number,
    @Query('patient_id') patient_id: number,
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

      if (!patient_id) {
        return {
          status_code: process.env.BAD_REQUEST_CODE,
          status: process.env.BAD_REQUEST_STATUS,
          message: 'Patient ID is required',
        };
      }

      const final_out =
        await this.internalIpdChargesService.findIpdChargeDetail(
          ipd_id,
          patient_id,
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
