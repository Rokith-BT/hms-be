import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UseGuards } from '@nestjs/common';
import { EmrNewLoginService } from './emr_new-login.service';
import { EmrNewLogin } from './entities/emr_new-login.entity';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('emr-new-login')
export class EmrNewLoginController {
  constructor(private readonly emrNewLoginService: EmrNewLoginService) {}

  @Post()
  async create(@Body() Entity: EmrNewLogin, @Res() res: Response) {    
     const result = await this.emrNewLoginService.create(Entity);
 console.log(result,"11223344");
 
     if (result.status == "success") {
       
       
       return res.status(201).json(result);
     } else {
      
       
       return res.status(401).json(result) 
         }  }


        //  @Post('/forgotPassword')
        //  async  ForgotPassword(@Body() Entity: EmrNewLogin,@Res() res: Response) {    
        //      const result = await this.emrNewLoginService.ForgetPassword(Entity);
        //      if (result.status == "success") {
        //        // If it's an error response, set the HTTP status code to 401
        //        console.log("111");
               
        //        return res.status(201).json(result);
        //      } else {
        //        // If it's a success response, return it as is
        //        console.log("222",result);
               
        //        return res.status(401).json(result)    }
        //    }

      @Post('/forgotPassword')
async ForgotPassword(@Body() Entity: EmrNewLogin, @Res() res: Response) {
  const result = await this.emrNewLoginService.ForgetPassword(Entity);

  if (result.status === "success") {
    return res.status(201).json(result); // Always success if password reset
  } else {
    // Only return 401 if username is invalid, etc.
    return res.status(401).json(result);
  }
}


           @Post('/resetPassword')
           async  resetPassword(@Body() Entity: EmrNewLogin,@Res() res: Response) {    
               const result = await  this.emrNewLoginService.ResetPassword(Entity);
               console.log(result.status,"result.status");
               
               if (result.status == "success") {
                 // If it's an error response, set the HTTP status code to 401
                 
                 return res.status(201).json(result);
               } else {
                 // If it's a success response, return it as is
                 
                 return res.status(401).json(result)    }
             }

}
