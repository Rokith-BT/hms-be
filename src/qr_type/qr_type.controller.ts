import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { QrTypeService } from './qr_type.service';
import { CreateQrTypeDto } from './qr_type.dto';

@Controller('qr-type')
export class QrTypeController {
  constructor(private readonly qrTypeService: QrTypeService) {}

  @Post()
  create(@Body() createQrTypeDto: CreateQrTypeDto) {
    return this.qrTypeService.create(createQrTypeDto);
  }

  @Get()
  findAll() {
    return this.qrTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.qrTypeService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateQrTypeDto: UpdateQrTypeDto) {
  //   return this.qrTypeService.update(+id, updateQrTypeDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.qrTypeService.remove(+id);
  }
}
