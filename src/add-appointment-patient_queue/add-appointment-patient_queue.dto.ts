import { ApiProperty } from '@nestjs/swagger';

export class appointment_patient_queue1 {

    @ApiProperty({ example: '3' })
    appointment_status_id: any;

    @ApiProperty({ example: '36' })
    patient_id: number;

    @ApiProperty({ example: '335' })
    doctor: number;

    @ApiProperty({ example: '1'})
    charge_id: number;

    @ApiProperty({ example: '1.1' })
    amount: string;

    @ApiProperty({example: '2' })
    global_shift_id:number;

    @ApiProperty({example:'2025-01-02' })
    date:any;

    @ApiProperty({example:'5'})
    shift_id: number;

    @ApiProperty({example: '4'})
    priority: number;

    @ApiProperty({example:'offline'})
    payment_mode: string;

    @ApiProperty({example: '2025-04-02 10:52:32'})
    payment_date: string;

    @ApiProperty({example:''})
    cheque_no :any;

    @ApiProperty({example:''})
    cheque_date:any;

    @ApiProperty({example:''})
    document:any;

    @ApiProperty({example:''})
    message:any;

    @ApiProperty({example:'cheque'})
    source:string;

    @ApiProperty({example:'11:11:11'})
    time:string;

    @ApiProperty({example:"razorpay"})
    payment_gateway:any;

    @ApiProperty({example:'rzp_liveZsdSe'})
    payment_id:any;

    @ApiProperty({example:'24456552'})
    payment_reference_number:any;
   
    @ApiProperty({ example: 1 })
    Hospital_id: number;
   
    @ApiProperty({example:'darun'})
    patient_name: string;

    @ApiProperty({example:'9999999999'})
    phone:string;

    @ApiProperty({example:'darun22@gmail.com'})
    email:any;

}


  export class CountDto {
      @ApiProperty({ example: '10' })
      details: appointment_patient_queue1[];
   
      @ApiProperty({ example: '10' })
      total: number;
   
  }