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
import { RadiologyGenerateBillService } from './radiology_generate_bill.service';
import { RadiologyGenerateBill } from './entities/radiology_generate_bill.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('radiology-generate-bill')
export class RadiologyGenerateBillController {
  constructor(
    private readonly radiologyGenerateBillService: RadiologyGenerateBillService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createRadiologyGenerateBill: RadiologyGenerateBill) {
    return this.radiologyGenerateBillService.create(
      createRadiologyGenerateBill,
    );
  }
  @UseGuards(AuthGuard)
  @Post('/radiologyReport')
  createRadiologyReport(
    @Body() createRadiologyGenerateBill: RadiologyGenerateBill[],
  ) {
    return this.radiologyGenerateBillService.createRadiologyReport(
      createRadiologyGenerateBill,
    );
  }
  @UseGuards(AuthGuard)
  @Post('/AddRadiologyPayment')
  AddRadiologyPayment(
    @Body() createRadiologyGenerateBill: RadiologyGenerateBill,
  ) {
    return this.radiologyGenerateBillService.AddRadiologyPayment(
      createRadiologyGenerateBill,
    );
  }
  @UseGuards(AuthGuard)
  @Delete('/:id')
  async removeRadiologyBill(
    @Param('id') id: number,
    @Query('hospital_id') hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.radiologyGenerateBillService.removeRadiologyBill(
      id,
      hospital_id,
    );
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
  @UseGuards(AuthGuard)
  @Delete('/deleteRadioPayment/:id')
  async deleteRadioPayment(
    @Param('id') id: number,
    @Query('Hospital_id') Hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.radiologyGenerateBillService.deleteRadioPayment(id, Hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
  @UseGuards(AuthGuard)
  @Delete('/removeRadioreport/:id')
  async removeRadioreport(
    @Param('id') id: number,
    @Query('hospital_id') hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.radiologyGenerateBillService.removeRadioreport(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
  @UseGuards(AuthGuard)
  @Patch('/:id')
  updateRadiologyBilling(
    @Param('id') id: number,
    @Body() createRadiologyGenerateBill: RadiologyGenerateBill,
  ) {
    return this.radiologyGenerateBillService.updateRadiologyBilling(
      id,
      createRadiologyGenerateBill,
    );
  }
  @UseGuards(AuthGuard)
  @Patch('/radioReport/reportUpdate/editradiologyReports')
  updateRadiologyReport(
    @Body() createRadiologyGenerateBill: RadiologyGenerateBill[],
  ) {
    return this.radiologyGenerateBillService.updateRadiologyReport(
      createRadiologyGenerateBill,
    );
  }
  @UseGuards(AuthGuard)
  @Patch('/updateCollectedPerson/:id')
  updateCollectedPerson(
    @Param('id') id: number,
    @Body() createRadiologyGenerateBill: RadiologyGenerateBill,
  ) {
    return this.radiologyGenerateBillService.updateCollectedPerson(
      id,
      createRadiologyGenerateBill,
    );
  }
  @UseGuards(AuthGuard)
  @Patch('/updateApprovalByPerson/:id')
  updateApprovalByPerson(
    @Param('id') id: number,
    @Body() createRadiologyGenerateBill: RadiologyGenerateBill,
  ) {
    return this.radiologyGenerateBillService.updateApprovalByPerson(
      id,
      createRadiologyGenerateBill,
    );
  }
}
