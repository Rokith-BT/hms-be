import { ApiProperty } from "@nestjs/swagger";

export class UpdateManualVitalDto  {
    @ApiProperty({ example: '98', description: 'The SpO2 level of the patient' })
  spo2: string;

  @ApiProperty({ example: '18', description: 'The respiration rate of the patient' })
  respiration: string;

  @ApiProperty({ example: '98.6', description: 'The temperature of the patient in Fahrenheit or Celsius' })
  temperature: string;

  @ApiProperty({ example: '72', description: 'The pulse rate of the patient' })
  pulse: string;

  @ApiProperty({ example: '70', description: 'The weight of the patient in kilograms or pounds' })
  weight: string;

  @ApiProperty({ example: '170', description: 'The height of the patient in centimeters or inches' })
  height: string;

  @ApiProperty({ example: '120/80', description: 'The blood pressure of the patient (systolic/diastolic)' })
  bp: string;
}
