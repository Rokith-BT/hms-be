export class SettingsNotificationSetting {
    id:number;
    type:string;
    is_mail:number;
    is_sms:number;
    is_mobileapp:number;
    is_notification:number;
    display_notification:number;
    display_sms:number;
    template:Text;
    template_id:string;
    subject:Text;
    variables:Text;
    created_at:Date;
    // hos_notification_setting_id:number;
    // hospital_id:number;
}
