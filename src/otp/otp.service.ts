import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class Msg91Service {
  async sendOTP(): Promise<any> {
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authkey: '403400AyN459sBBG652cdb9bP1',
      },
      data: { Param1: 'var' },
    };

    try {
      const response = await axios.post(
        'https://control.msg91.com/api/v5/otp?template_id=65648d86d6fc0502dd1ab8e2&mobile=?&otp_length=4',
        options.data,
        { headers: options.headers },
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
