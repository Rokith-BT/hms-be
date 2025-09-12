import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PhpRecordsService } from './php-records.service';
import { PhpBirthRecord, PhpDeathRecord } from './entities/php-record.entity';

@Controller('php-records')
export class PhpRecordsController {
  constructor(private readonly phpRecordsService: PhpRecordsService) {}

  @Post('/death')
  create(@Body() createPhpRecordDto: PhpDeathRecord) {
    return this.phpRecordsService.createDeath(createPhpRecordDto);
  }
  @Post('/birth')
  createBirth(@Body() createPhpRecordDto: PhpBirthRecord) {
    return this.phpRecordsService.createBirth(createPhpRecordDto);
  }
  @Get()
  findAll() {
    return this.phpRecordsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.phpRecordsService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePhpRecordDto: PhpDeathRecord) {
  //   return this.phpRecordsService.update(+id, updatePhpRecordDto);
  // }
  @Patch('/death/:id')
  updateDeath(@Param('id') id: string, @Body() updatePhpRecordDto: PhpDeathRecord) {
    return this.phpRecordsService.updateDeath(+id, updatePhpRecordDto);
  }

  @Patch('/birth/:id')
  update(@Param('id') id: string, @Body() updatePhpRecordDto: PhpBirthRecord) {
    return this.phpRecordsService.updateBirth(+id, updatePhpRecordDto);
  }


  @Delete('/death/:id')
  remove(@Param('id') id: string, @Body('hospital_id')hospital_id:any) {
    if(!hospital_id){
return {
  "status":"failed",
  "message":"enter hospital_id to delete"
}
    }
    return this.phpRecordsService.removeDeath(+id,hospital_id);
  }
  @Delete('/birth/:id')
  removeBirth(@Param('id') id: string, @Body('hospital_id')hospital_id:any) {
    if(!hospital_id){
return {
  "status":"failed",
  "message":"enter hospital_id to delete"
}
    }
    return this.phpRecordsService.removeBirth(+id,hospital_id);
  }
}
