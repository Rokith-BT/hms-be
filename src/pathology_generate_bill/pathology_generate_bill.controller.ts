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
import { PathologyGenerateBillService } from './pathology_generate_bill.service';
import { PathologyGenerateBill } from './entities/pathology_generate_bill.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('pathology-generate-bill')
export class PathologyGenerateBillController {
  constructor(
    private readonly pathologyGenerateBillService: PathologyGenerateBillService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createPathologyGenerateBill: PathologyGenerateBill) {
    return this.pathologyGenerateBillService.create(
      createPathologyGenerateBill,
    );
  }
  @UseGuards(AuthGuard)
  @Post('/pathologyReport')
  createPathologyReport(
    @Body() createPathologyGenerateBill: PathologyGenerateBill[],
  ) {
    return this.pathologyGenerateBillService.createPathologyReport(
      createPathologyGenerateBill,
    );
  }
  @UseGuards(AuthGuard)
  @Post('/AddPathologyPayment')
  AddPathologyPayment(
    @Body() createPathologyGenerateBill: PathologyGenerateBill,
  ) {
    return this.pathologyGenerateBillService.AddPathologyPayment(
      createPathologyGenerateBill,
    );
  }
  @UseGuards(AuthGuard)
  @Delete('/:id')
  async removePathologyBill(
    @Param('id') id: number,
    @Query('hospital_id') hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.pathologyGenerateBillService.removePathologyBill(
      id,
      hospital_id,
    );
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
  @UseGuards(AuthGuard)
  @Delete('/deletePathoPayment/:id')
  async deletePathoPayment(
    @Param('id') id: number,
    @Query('Hospital_id') Hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.pathologyGenerateBillService.deletePathoPayment(id, Hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
  @UseGuards(AuthGuard)
  @Delete('/removepathoreport/:id')
  async removepathoreport(
    @Param('id') id: number,
    @Query('hospital_id') hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.pathologyGenerateBillService.removepathoreport(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
  @UseGuards(AuthGuard)
  @Patch('/:id')
  updatePathologyBilling(
    @Param('id') id: number,
    @Body() createPathologyTest: PathologyGenerateBill,
  ) {
    return this.pathologyGenerateBillService.updatePathologyBilling(
      id,
      createPathologyTest,
    );
  }
  @UseGuards(AuthGuard)
  @Patch('/pathoReport/editpathologyReports')
  updatepathologyReport(@Body() createPathologyTest: PathologyGenerateBill[]) {
    return this.pathologyGenerateBillService.updatepathologyReport(
      createPathologyTest,
    );
  }
  @UseGuards(AuthGuard)
  @Patch('/updateCollectedPerson/:id')
  updateCollectedPerson(
    @Param('id') id: number,
    @Body() createPathologyTest: PathologyGenerateBill,
  ) {
    return this.pathologyGenerateBillService.updateCollectedPerson(
      id,
      createPathologyTest,
    );
  }
  @UseGuards(AuthGuard)
  @Patch('/updateApprovalByPerson/:id')
  updateApprovalByPerson(
    @Param('id') id: number,
    @Body() createPathologyTest: PathologyGenerateBill,
  ) {
    return this.pathologyGenerateBillService.updateApprovalByPerson(
      id,
      createPathologyTest,
    );
  }
}
