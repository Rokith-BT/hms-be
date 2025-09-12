// import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
// import { OtpService } from './otp.service';

// @Controller('otp')
// export class OtpController {
//   constructor(private readonly otpService: OtpService) {}

//   @Post()
//   create(@Body() data:any) {
//     return this.otpService.create(data);
//   }

//   // const options = {
//   //   method: 'POST',
//   //   headers: {
//   //     accept: 'application/json',
//   //     'content-type': 'application/json',
//   //     authkey: '403400AyN459sBBG652cdb9bP1'
//   //   },
//   //   body: JSON.stringify({Param1: 'var'})
//   // };
  
//   // fetch('https://control.msg91.com/api/v5/otp?template_id=65648d86d6fc0502dd1ab8e2&mobile= ? &otp_length=4', options)
//   //   .then(response => response.json())
//   //   .then(response => console.log(response))
//   //   .catch(err => console.error(err));

//   // @Get()
//   // findAll() {
//   //   return this.otpService.findAll();
//   // }

//   // @Get(':id')
//   // findOne(@Param('id') id: string) {
//   //   return this.otpService.findOne(+id);
//   // }

//   // @Patch(':id')
//   // update(@Param('id') id: string, @Body() ) {
//   //   return this.otpService.update(+id, );
//   // }

//   // @Delete(':id')
//   // remove(@Param('id') id: string) {
//   //   return this.otpService.remove(+id);
//   // }
// }





import { Controller, Get } from '@nestjs/common';
import { Msg91Service } from './otp.service';
// import { Msg91Service } from './msg91.service';

@Controller('otp')
export class OTPController {
  constructor(private readonly msg91Service: Msg91Service) {}

  @Get('send')
  async sendOTP(): Promise<any> {
    try {
      const response = await this.msg91Service.sendOTP();
      return response;
    } catch (error) {
      throw error;
    }
  }
}
