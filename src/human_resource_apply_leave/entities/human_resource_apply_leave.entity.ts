export class HumanResourceApplyLeave {
  id: number;
  staff_id: number;
  leave_type_id: number;
  leave_from: Date;
  leave_to: Date;
  leave_days: number;
  employee_remark: string;
  admin_remark: string;
  status: string;
  applied_by: number;
  status_updated_by: number;
  document_file: any;
  date: Date;
  created_at: Date;
  alloted_leave: string;
  hospital_id: number;
  hos_staff_leave_request_id: number;
  hos_staff_leave_details_id: number;
}
