import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SmsNewsletterService } from './sms-newsletter.service';

@Controller('sms-newsletter')
export class SmsNewsletterController {
  constructor(private readonly smsNewsletterService: SmsNewsletterService) {}

//   @Post()
//  async sendsms(@Body('mobilenumber') mobilenumber:String,
// @Body('name')name:string,
// @Body('message')message:string) {
//   const result = await this.smsNewsletterService.sendsms(mobilenumber,name,message);
//  return result 
//  }


@Post()
async sendsms(@Body('mobilenumber') mobilenumber:String,
// @Body('name')name:string,
@Body('message')message:string) {
 const result = await this.smsNewsletterService.sendsms(mobilenumber,message);
return result 
}
 
}
