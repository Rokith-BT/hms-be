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
import { ConsultationProcessListService } from './consultation-process-list.service';
import { ConsultationProcessList } from './entities/consultation-process-list.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('consultation-process-list')
export class ConsultationProcessListController {
  constructor(
    private readonly consultationProcessListService: ConsultationProcessListService,
  ) {}
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() Entity: ConsultationProcessList) {
    return this.consultationProcessListService.create(Entity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.consultationProcessListService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.consultationProcessListService.findOne(+id);
  }
  @UseGuards(AuthGuard)
  @Get('/QR/:id')
  findOneQR(@Param('id') id: string) {
    return this.consultationProcessListService.findOneQR(+id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() Entity: ConsultationProcessList) {
    return this.consultationProcessListService.update(+id, Entity);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Query('hospital_id') hospital_id: number,
  ) {
    const deletelist = await this.consultationProcessListService.remove(
      id,
      hospital_id,
    );
    return {
      status: `success`,
      message: `id: ${id} deleted successfully`,
    };
  }

  @UseGuards(AuthGuard)
  @Get('/Encrypt-QR/:id')
  EncryptfindOneQR(
    @Param('id') id: string,
    @Query(`hospital_id`) hospital_id: number,
  ) {
    return this.consultationProcessListService.EncryptedfindOneQR(
      +id,
      hospital_id,
    );
  }
}
