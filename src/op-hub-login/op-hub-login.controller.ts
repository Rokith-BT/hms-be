import { Controller, Post, Body, Query, Res } from '@nestjs/common';
import { OpHubLoginService } from './op-hub-login.service';
import { ApiOperation, ApiProperty, ApiResponse } from '@nestjs/swagger';
import { Login } from './entities/op-hub-login.entity';
import { Response } from 'express';

export class SuccessResponse {
  @ApiProperty({ example: 'success', description: 'The status of the response' })
  status: string;

  @ApiProperty({ example: 'Password verified successfully', description: 'Message providing additional context' })
  message: string;

  @ApiProperty({
    type: Object,
    description: 'Details about the authenticated staff member',
  })
  details: {
    Hospital_id: number;
    Hospital_name: string;
    Hospital_address: string;
    Staff_id: number;
    staffImage: string;
    username: string;
    password: string;
    role_id: number;
    staffName: string;
    role_name: string;
    resetStatus: number;
  };
}


export class ErrorResponse {
  @ApiProperty({ example: 'failed', description: 'The status of the response' })
  status: string;

  @ApiProperty({ example: 'Enter Correct username and password', description: 'Error message' })
  message: string;
}


@Controller('op-hub-login')
export class OpHubLoginController {
  constructor(private readonly loginService: OpHubLoginService) { }

  @Post()
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 201, type: SuccessResponse, description: 'Login successful' })
  @ApiResponse({ status: 401, type: ErrorResponse, description: 'Unauthorized' })

  async create(@Body() Entity: Login, @Res() res: Response) {
    const result = await this.loginService.create(Entity);


    if (result.status == "success") {


      return res.status(201).json(result);
    } else {


      return res.status(401).json(result)
    }
  }




  @Post('/forgotPassword')
  async ForgotPassword(@Body() Entity: Login, @Res() res: Response) {
    const result = await this.loginService.ForgetPassword(Entity);
    if (result.status == "success") {
      return res.status(201).json(result);
    } else {
      return res.status(401).json(result)
    }
  }
  @Post('/resetPassword')
  async resetPassword(@Body() Entity: Login, @Res() res: Response) {
    const result = await this.loginService.ResetPassword(Entity);
    if (result.status == "success") {
      return res.status(201).json(result);
    } else {
      return res.status(401).json(result)
    }
  }

  @Post('/getHosDetails')
  async getHosDetails(@Query('hospital_id') hospital_id: number) {
    if (!hospital_id) {
      return {
        "status": "failed",
        "message": "enter hospital_id to get hospital details"
      }
    }
    return await this.loginService.getHosDetails(hospital_id);

  }
}
