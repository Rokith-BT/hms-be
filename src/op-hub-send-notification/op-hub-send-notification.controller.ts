import { Controller, Post, Body } from '@nestjs/common';
import { OpHubSendNotificationService } from './op-hub-send-notification.service';
@Controller('op-hub-send-notification')
export class OpHubSendNotificationController {
  constructor(private readonly sendNotificationService: OpHubSendNotificationService) { }

  @Post('to-profile')
  async sendNotificationToProfile(@Body('from_staff_id') from_staff_id: string,
    @Body('to_staff_id') to_staff_id: string, @Body(`room_id`) room_id: string, @Body('hospital_id') hospital_id: any) {
    return this.sendNotificationService.SendNotificationForPatientProfile(from_staff_id, to_staff_id, room_id, hospital_id);
  }
}
