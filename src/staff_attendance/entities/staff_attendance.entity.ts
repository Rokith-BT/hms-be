export class StaffAttendance {
  id: number;
  date: Date;
  staff_id: number;
  staff_attendance_type_id: number;
  remark: string;
  is_active: number;
  created_at: Date;
  updated_at: Date;
  hospital_id: number;
  hos_staff_attendance_id: number;
  hos_staff_attendance_type_id: number;
}
