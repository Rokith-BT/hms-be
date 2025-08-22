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
import { PathologyTestService } from './pathology_test.service';
import { PathologyTest } from './entities/pathology_test.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('pathology-test')
export class PathologyTestController {
  constructor(private readonly pathologyTestService: PathologyTestService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createPathologyTest: PathologyTest) {
    return this.pathologyTestService.create(createPathologyTest);
  }
  @UseGuards(AuthGuard)
  @Post('/pathologyParameterDetails')
  createpathologyParameterDetails(
    @Body() createPathologyTest: PathologyTest[],
  ) {
    return this.pathologyTestService.createpathologyParameterDetails(
      createPathologyTest,
    );
  }
  @UseGuards(AuthGuard)
  @Delete('/:id')
  async removePathology(
    @Param('id') id: number,
    @Query('hospital_id') hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.pathologyTestService.removePathology(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
  @UseGuards(AuthGuard)
  @Patch('/:id')
  updatePathology(
    @Param('id') id: number,
    @Body() createPathologyTest: PathologyTest,
  ) {
    return this.pathologyTestService.updatePathology(id, createPathologyTest);
  }
  @UseGuards(AuthGuard)
  @Delete('/removePathologyparameterdetails/:id')
  async removePathologyparameterdetails(
    @Param('id') id: number,
    @Query('hospital_id') hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.pathologyTestService.removePathologyparameterdetails(
      id,
      hospital_id,
    );
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
  @UseGuards(AuthGuard)
  @Patch('/editpathoparameterdetail/parameter')
  updatePathologyParameterDetails(
    @Body() createPathologyTest: PathologyTest[],
  ) {
    return this.pathologyTestService.updatePathologyParameterDetails(
      createPathologyTest,
    );
  }
}
