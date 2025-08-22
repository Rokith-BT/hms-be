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
import { OperationIpd } from './entities/operation_ipd.entity';
import { OperationIpdService } from './operation_ipd.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('operation-ipd')
export class OperationIpdController {
  constructor(private readonly operationIpdService: OperationIpdService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createOperationIpd: OperationIpd) {
    return this.operationIpdService.create(createOperationIpd);
  }
  @UseGuards(AuthGuard)
  @Patch('/:id')
  update(@Param('id') id: number, @Body() createOperationIpd: OperationIpd) {
    return this.operationIpdService.update(id, createOperationIpd);
  }
  @UseGuards(AuthGuard)
  @Delete('/deleteOperation/:id')
  async removeNurseNoteComment(
    @Param('id') id: number,
    @Query('Hospital_id') Hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.operationIpdService.remove(id, Hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
  @UseGuards(AuthGuard)
  @Get('/OperationByIPDid/:id')
  findIPDOperSearch(@Param('id') id: number, @Query('search') search: string) {
    return this.operationIpdService.findIPDOperSearch(id, search);
  }
  @UseGuards(AuthGuard)
  @Get('/internal/operationName/:id')
  findopernamebycategory(@Param('id') id: number) {
    return this.operationIpdService.findopernamebycategory(id);
  }
}
