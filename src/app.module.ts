/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupHospitalChargesUnitTypeModule } from './setup_hospital_charges_unit_type/setup_hospital_charges_unit_type.module';
import { SetupHospitalChargesTaxCategoryModule } from './setup_hospital_charges_tax_category/setup_hospital_charges_tax_category.module';
import { SetupHospitalChargesChargeCategoryModule } from './setup_hospital_charges_charge_category/setup_hospital_charges_charge_category.module';
import { SetupFrontOfficeAppointmentPriorityModule } from './setup_front_office_appointment_priority/setup_front_office_appointment_priority.module';
import { SetupFrontOfficeSourceModule } from './setup_front_office_source/setup_front_office_source.module';
import { SetupFrontOfficeComplainTypeModule } from './setup_front_office_complain_type/setup_front_office_complain_type.module';
import { SetupFrontOfficePurposeModule } from './setup_front_office_purpose/setup_front_office_purpose.module';
import { SetupPharmacyDoseDurationModule } from './setup_pharmacy_dose_duration/setup_pharmacy_dose_duration.module';
import { SetupPharmacyDoseIntervalModule } from './setup-pharmacy-dose_interval/setup-pharmacy-dose_interval.module';
import { MedicineCategoryModule } from './setup_pharmacy_medicine_category/setup_pharmacy_medicine_category.module';
import { SetupPharmacySupplierModule } from './setup_pharmacy_supplier/setup_pharmacy_supplier.module';
import { SetupPharmacyMedicineDosageModule } from './setup_pharmacy_medicine_dosage/setup_pharmacy_medicine_dosage.module';
import { FindingsCategoryModule } from './findings_category/findings_category.module';
import { SetupFindingsFindingModule } from './setup-findings-finding/setup-findings-finding.module';
import { SetupPathologyPathologyCategoryModule } from './setup-pathology-pathology_category/setup-pathology-pathology_category.module';
import { SetupPathologyUnitModule } from './setup-pathology-unit/setup-pathology-unit.module';
import { SetupPathologyPathologyParameterModule } from './setup-pathology-pathology_parameter/setup-pathology-pathology_parameter.module';
import { SetupOperationOperationCategoryModule } from './setup-operation-operation_category/setup-operation-operation_category.module';
import { SetupOperationOperationModule } from './setup-operation-operation/setup-operation-operation.module';
import { OtpModule } from './otp/otp.module';
import { SetupRadiologyRadiologyCategoryModule } from './setup-radiology-radiology_category/setup-radiology-radiology_category.module';
import { SetupRadiologyUnitModule } from './setup-radiology-unit/setup-radiology-unit.module';
import { SetupRadiologyRadiologyParameterModule } from './setup-radiology-radiology_parameter/setup-radiology-radiology_parameter.module';
import { SetupBloodBankProductsModule } from './setup-blood_bank-products/setup-blood_bank-products.module';
import { SetupHospitalChargesChargeTypeMasterModule } from './setup-hospital-charges_charge_type_master/setup-hospital-charges_charge_type_master.module';
import { SetupHospitalChargesChargeTypeModuleModule } from './setup-hospital-charges_charge_type_module/setup-hospital-charges_charge_type_module.module';
import { SetupHospitalChargeChargesModule } from './setup-hospital_charge-charges/setup-hospital_charge-charges.module';
import { SetupSymptomsSymptomsTypeModule } from './setup-symptoms-symptoms_type/setup-symptoms-symptoms_type.module';
import { SetupSymptomsSymptomsHeadModule } from './setup-symptoms-symptoms_head/setup-symptoms-symptoms_head.module';
import { SetupFinanceIncomeHeadModule } from './setup-finance-income_head/setup-finance-income_head.module';
import { SetupFinanceExpenseHeadModule } from './setup-finance-expense_head/setup-finance-expense_head.module';
import { SetupInventoryItemCategoryModule } from './setup-inventory-item_category/setup-inventory-item_category.module';
import { SetupInventoryItemStoreModule } from './setup-inventory-item_store/setup-inventory-item_store.module';
import { SetupInventoryItemSupplierModule } from './setup-inventory-item_supplier/setup-inventory-item_supplier.module';
import { SetupBedFloorModule } from './setup-bed-floor/setup-bed-floor.module';
import { SetupBedBedTypeModule } from './setup-bed-bed_type/setup-bed-bed_type.module';
import { SetupBedBedGroupModule } from './setup-bed-bed_group/setup-bed-bed_group.module';
import { SetupBedBedModule } from './setup-bed-bed/setup-bed-bed.module';
import { SetupBedBedStatusModule } from './setup-bed-bed_status/setup-bed-bed_status.module';
import { SetupHumanResourceSpecialistModule } from './setup-human_resource-specialist/setup-human_resource-specialist.module';
import { SetupHumanResourceDesignationModule } from './setup-human_resource-designation/setup-human_resource-designation.module';
import { SetupHumanResourceDepartmentModule } from './setup-human_resource-department/setup-human_resource-department.module';
import { SetupHumanResourceLeaveTypesModule } from './setup-human_resource-leave_types/setup-human_resource-leave_types.module';
import { SetupReferralReferralCategoryModule } from './setup-referral-referral_category/setup-referral-referral_category.module';
import { SetupPatientNewPatientModule } from './setup-patient-new_patient/setup-patient-new_patient.module';
import { SetupAppointmentShiftModule } from './setup-appointment-shift/setup-appointment-shift.module';
import { SetupAppointmentDoctorShiftModule } from './setup-appointment-doctor_shift/setup-appointment-doctor_shift.module';
import { SetupPatientDisabledPatientListModule } from './setup-patient-disabled_patient_list/setup-patient-disabled_patient_list.module';
import { SetupApptSlotAmountModule } from './setup_appt_slot_amount/setup_appt_slot_amount.module';
import { SetupApptSlotTimimgsModule } from './setup_appt_slot_timimgs/setup_appt_slot_timimgs.module';
import { SetupReferralReferralCommissionModule } from './setup-referral-referral_commission/setup-referral-referral_commission.module';
import { AddAppointmentModule } from './add-appointment/add-appointment.module';
import { InternalAppointmentStaffModule } from './internal-appointment-staff/internal-appointment-staff.module';
import { InternalAppointmentChargesModule } from './internal-appointment-charges/internal-appointment-charges.module';
import { InternalAppointmentShiftModule } from './internal-appointment-shift/internal-appointment-shift.module';
import { InternalAppointmentSlotModule } from './internal-appointment-slot/internal-appointment-slot.module';
import { InternalAppointmentPriorityModule } from './internal-appointment-priority/internal-appointment-priority.module';
import { OpdOutPatientModule } from './opd-out_patient/opd-out_patient.module';
import { InternalOpdOverviewModule } from './internal-opd-overview/internal-opd-overview.module';
import { InternalOpdOverviewConsultantDoctorModule } from './internal-opd-overview-consultant_doctor/internal-opd-overview-consultant_doctor.module';
import { InternalOpdOverviewVisitsModule } from './internal-opd-overview-visits/internal-opd-overview-visits.module';
import { InternalOpdTimelineModule } from './internal-opd-timeline/internal-opd-timeline.module';
import { InternalOpdChargesModule } from './internal-opd-charges/internal-opd-charges.module';
import { SettingsRolesPermissionsModule } from './settings_roles-permissions/settings_roles-permissions.module';
import { SettingsNotificationSettingModule } from './settings_notification_setting/settings_notification_setting.module';
import { SettingsSystemNotificationSettingModule } from './settings-system_notification_setting/settings-system_notification_setting.module';
import { SettingPrefixSettingModule } from './setting-prefix_setting/setting-prefix_setting.module';
import { SettingLanguagesModule } from './setting-languages/setting-languages.module';
import { SettingsUsersPatientsModule } from './settings-users_patients/settings-users_patients.module';
import { SettingsUsersStaffsModule } from './settings-users-staffs/settings-users-staffs.module';
import { ModulesPatientModule } from './modules_patient/modules_patient.module';
import { SettingsModulesPatientModule } from './settings-modules_patient/settings-modules_patient.module';
import { SettingsGeneralSettingModule } from './settings-general_setting/settings-general_setting.module';
import { SettingsCaptchaSettingsModule } from './settings-captcha_settings/settings-captcha_settings.module';
import { SettingsFrontCmsSettingModule } from './settings-front_cms_setting/settings-front_cms_setting.module';
import { AddAppointmentDoctorWiseModule } from './add-appointment-doctor_wise/add-appointment-doctor_wise.module';
import { AddAppointmentPatientQueueModule } from './add-appointment-patient_queue/add-appointment-patient_queue.module';
import { TpaManagementModule } from './tpa_management/tpa_management.module';
import { DischargePatientOpdModuleModule } from './discharge_patient_opd_module/discharge_patient_opd_module.module';
import { InternalModulesChargeCategoryModule } from './internal_modules_charge_category/internal_modules_charge_category.module';
import { InternalModulesChargesnameAndIdModule } from './internal_modules_chargesname-and-id/internal_modules_chargesname-and-id.module';
import { InternalOpdTreatmentHistoryModule } from './internal-opd-treatment-history/internal-opd-treatment-history.module';
import { AppointmentStatusModule } from './appointment_status/appointment_status.module';
import { AppointmentFilterModule } from './appointment_filter/appointment_filter.module';
import { HospitalChargesModule } from './hospital_charges/hospital_charges.module';
import { InternalOpdPaymentModule } from './internal-opd-payment/internal-opd-payment.module';
import { InternalModulesAppointmentsSlotChargeCategoryModule } from './internal_modules_appointments_slot_charge_category/internal_modules_appointments_slot_charge_category.module';
import { ConsultationProcessListModule } from './consultation-process-list/consultation-process-list.module';
import { HospitalsModule } from './hospitals/hospitals.module';
import { SettingsModuleModule } from './settings_module/settings_module.module';
import { OpdOperationModule } from './opd-operation/opd-operation.module';
import { ReferralPersonModule } from './referral_person/referral_person.module';
import { ReferralPersonCommissionModule } from './referral_person_commission/referral_person_commission.module';
import { ReferralPaymentModule } from './referral_payment/referral_payment.module';
import { IpdMainModuleModule } from './ipd_main_module/ipd_main_module.module';
import { DischargePatientIpdModuleModule } from './discharge_patient_ipd_module/discharge_patient_ipd_module.module';
import { RevertDischargePatientIpdModuleModule } from './revert_discharge_patient_ipd_module/revert_discharge_patient_ipd_module.module';
import { NurseNotesIpdModule } from './nurse_notes_ipd/nurse_notes_ipd.module';
import { ConsultantRegisterIpdModule } from './consultant_register_ipd/consultant_register_ipd.module';
import { TimelineIpdModule } from './timeline_ipd/timeline_ipd.module';
import { OperationIpdModule } from './operation_ipd/operation_ipd.module';
import { PrescriptionIpdModule } from './prescription_ipd/prescription_ipd.module';
import { PharmacyModule } from './pharmacy/pharmacy.module';
import { MedicationIpdModule } from './medication_ipd/medication_ipd.module';
import { BedHistoryModule } from './bed_history/bed_history.module';
import { IpdTreatmentHistoryModule } from './ipd_treatment_history/ipd_treatment_history.module';
import { InternalIpdChargesModule } from './internal-ipd-charges/internal-ipd-charges.module';
import { InternalIpdPaymentModule } from './internal-ipd-payment/internal-ipd-payment.module';
import { HumanResourceApplyLeaveModule } from './human_resource_apply_leave/human_resource_apply_leave.module';
import { HumanResourcePayrollModule } from './human_resource_payroll/human_resource_payroll.module';
import { StaffAttendanceModule } from './staff_attendance/staff_attendance.module';
import { FinanceIncomeModule } from './finance_income/finance_income.module';
import { FinanceExpenseModule } from './finance_expense/finance_expense.module';
import { BillingModule } from './billing/billing.module';
import { BillingFilterModule } from './billing_filter/billing_filter.module';
import { HumanResourceStaffModule } from './human_resource_staff/human_resource_staff.module';
import { InternalOpdMedicationMedicationDoseModule } from './internal-opd-medication-medication_dose/internal-opd-medication-medication_dose.module';
import { InternalOpdMedicationMedicationNameModule } from './internal-opd-medication-medication_name/internal-opd-medication-medication_name.module';
import { EmrNewLoginModule } from './emr_new-login/emr_new-login.module';
import { EmrAppointmentModule } from './emr_appointment/emr_appointment.module';
import { EmrPatientDetailsModule } from './emr_patient_details/emr_patient_details.module';
import { EmrInternalApiModule } from './emr_internal-api/emr_internal-api.module';
import { EmrAppointmentFilterModule } from './emr_appointment_filter/emr_appointment_filter.module';
import { EmrAddNewPatientModule } from './emr_add-new-patient/emr_add-new-patient.module';
import { EmrAddNewPatientWithAbhaQrModule } from './emr_add-new-patient-with-abha-qr/emr_add-new-patient-with-abha-qr.module';
import { EmrAppointmentStatusModule } from './emr_appointment_status/emr_appointment_status.module';
import { EmrOpdOutPatientModule } from './emr_opd_out_patient/emr_opd_out_patient.module';
import { PurchaseMedicineModule } from './purchase_medicine/purchase_medicine.module';
import { PharmacyGenerateBillModule } from './pharmacy_generate_bill/pharmacy_generate_bill.module';
import { PathologyTestModule } from './pathology_test/pathology_test.module';
import { PathologyGenerateBillModule } from './pathology_generate_bill/pathology_generate_bill.module';
import { PhpRecordsModule } from './php-records/php-records.module';
import { RadiologyTestModule } from './radiology_test/radiology_test.module';
import { RadiologyGenerateBillModule } from './radiology_generate_bill/radiology_generate_bill.module';
import { EmrOpdPatientAndDoctorProfileModule } from './emr_opd_patient_and_doctor_profile/emr_opd_patient_and_doctor_profile.module';
import { PhpInventoryModule } from './php-inventory/php-inventory.module';
import { OpdBillingModule } from './opd_billing/opd_billing.module';
import { EmrOpdFilterModule } from './emr_opd_filter/emr_opd_filter.module';
import { VisitorBookModule } from './visitor_book/visitor_book.module';
import { PhoneCallLogModule } from './phone_call_log/phone_call_log.module';
import { PostalReceiveDispatchModule } from './postal_receive_dispatch/postal_receive_dispatch.module';
import { FrontofficeComplainModule } from './frontoffice_complain/frontoffice_complain.module';
import { StaffIdCardModule } from './staff_id_card/staff_id_card.module';
import { AmbulanceListModule } from './ambulance_list/ambulance_list.module';
import { AmbulanceCallModule } from './ambulance_call/ambulance_call.module';
import { ComponentIssueModule } from './component_issue/component_issue.module';
import { PatientIdCardModule } from './patient_id_card/patient_id_card.module';
import { CertificatesModule } from './certificates/certificates.module';
import { FrontCmsPageModule } from './front_cms_page/front_cms_page.module';
import { OpdMedicationModule } from './opd-medication/opd-medication.module';
import { RevertDischargePatientOpdModuleModule } from './revert_discharge_patient_opd_module/revert_discharge_patient_opd_module.module';
import { EmrHumanResourceAddStaffModule } from './emr_human_resource_add_staff/emr_human_resource_add_staff.module';
import { EmrHumanResourceProfileModule } from './emr_human_resource_profile/emr_human_resource_profile.module';
import { DonorDetailsModule } from './donor_details/donor_details.module';
import { SettingsSmsSettingsModule } from './settings-sms-settings/settings-sms-settings.module';
import { PrintSettingModule } from './print_setting/print_setting.module';
import { FrontCmsEventGalleryNewsModule } from './front_cms_event_gallery_news/front_cms_event_gallery_news.module';
import { IpdDoctorsModule } from './ipd_doctors/ipd_doctors.module';
import { MediaManagerModule } from './media_manager/media_manager.module';
import { FrontCmsBannerModule } from './front_cms_banner/front_cms_banner.module';
import { FrontCmsMenuModule } from './front_cms_menu/front_cms_menu.module';
import { SettingsEmailSettingsModule } from './settings-email-settings/settings-email-settings.module';
import { SettingsPaymentMethodsModule } from './settings_payment_methods/settings_payment_methods.module';
import { OpdPrescriptionModule } from './opd_prescription/opd_prescription.module';
import { CheckForDuplicateAppointmentModule } from './check-for-duplicate-appointment/check-for-duplicate-appointment.module';
import { SetupHumanResourcePayslipCategoryModule } from './setup-human_resource-payslip_category/setup-human_resource-payslip_category.module';
import { SetupHumanResourcePayslipSettingsModule } from './setup-human_resource-payslip_settings/setup-human_resource-payslip_settings.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PhrAppointmentModule } from './phr-appointment/phr-appointment.module';
import { PhrAppointmentStatusModule } from './phr-appointment-status/phr-appointment-status.module';
import { PhrConsultationProcessModule } from './phr-consultation-process/phr-consultation-process.module';
import { PhrHospitalsModule } from './phr-hospitals/phr-hospitals.module';
import { OpHubAppointmentModule } from './op-hub-appointment/op-hub-appointment.module';
import { OpHubAppointmentStatusModule } from './op-hub-appointment-status/op-hub-appointment-status.module';
import { OpHubBillingModule } from './op-hub-billing/op-hub-billing.module';
import { OpHubCheckForDuplicateAppointmentModule } from './op-hub-check-for-duplicate-appointment/op-hub-check-for-duplicate-appointment.module';
import { OpHubCheckOldPatientModule } from './op-hub-check-old-patient/op-hub-check-old-patient.module';
import { OpHubClinicalNotesModule } from './op-hub-clinical-notes/op-hub-clinical-notes.module';
import { OpHubClinicalNotesWithAbhaModule } from './op-hub-clinical-notes-with-abha/op-hub-clinical-notes-with-abha.module';
import { OpHubCompleteAndCloseConsultationModule } from './op-hub-complete-and-close-consultation/op-hub-complete-and-close-consultation.module';
import { OpHubConsultationProcessModule } from './op-hub-consultation-process/op-hub-consultation-process.module';
import { OpHubDoctorSlotShiftServiceModule } from './op-hub-doctor-slot-shift-service/op-hub-doctor-slot-shift-service.module';
import { OpHubDoctorsModule } from './op-hub-doctors/op-hub-doctors.module';
import { OpHubEmrModule } from './op-hub-emr/op-hub-emr.module';
import { OpHubGetAbhaAddressOfPatientModule } from './op-hub-get-abha-address-of-patient/op-hub-get-abha-address-of-patient.module';
import { OpHubGetPatientDetailsByAayushUniqueIdModule } from './op-hub-get-patient-details-by-aayush-unique-id/op-hub-get-patient-details-by-aayush-unique-id.module';
import { OpHubInternalAppntDoctorsModule } from './op-hub-internal-appnt-doctors/op-hub-internal-appnt-doctors.module';
import { OpHubLoginModule } from './op-hub-login/op-hub-login.module';
import { OpHubManualVitalsModule } from './op-hub-manual-vitals/op-hub-manual-vitals.module';
import { OpHubFcmTokenModule } from './op-hub-fcm-token/op-hub-fcm-token.module';
import { OpHubOpdPrescriptionModule } from './op-hub-opd-prescription/op-hub-opd-prescription.module';
import { OpHubOverallHeaderSerachModule } from './op-hub-overall-header-serach/op-hub-overall-header-serach.module';
import { OpHubPatientFromQrModule } from './op-hub-patient-from-qr/op-hub-patient-from-qr.module';
import { OpHubPatientAppointmentListModule } from './op-hub-patient-appointment-list/op-hub-patient-appointment-list.module';
import { OpHubPatientProfileModule } from './op-hub-patient-profile/op-hub-patient-profile.module';
import { OpHubPrescriptionModule } from './op-hub-prescription/op-hub-prescription.module';
import { OpHubPreviewDocModule } from './op-hub-preview-doc/op-hub-preview-doc.module';
import { OpHubSendNotificationModule } from './op-hub-send-notification/op-hub-send-notification.module';
import { OpHubTokenGenerationModule } from './op-hub-token-generation/op-hub-token-generation.module';
import { OpHubTokenInitiateModule } from './op-hub-token-initiate/op-hub-token-initiate.module';
import { OpHubUnlinkAbhaFromPatientModule } from './op-hub-unlink-abha-from-patient/op-hub-unlink-abha-from-patient.module';
import { OpHubUploadDocPreviewModule } from './op-hub-upload-doc-preview/op-hub-upload-doc-preview.module';
import { OpHubVitalsModule } from './op-hub-vitals/op-hub-vitals.module';
import { OpHubVitalsVibrasenseModule } from './op-hub-vitals-vibrasense/op-hub-vitals-vibrasense.module';
import { SmsNewsletterModule } from './sms-newsletter/sms-newsletter.module';
import { SarvamJobOpdIdMappingModule } from './sarvam_job_opd_id_mapping/sarvam_job_opd_id_mapping.module';
import { PhpAppointmentReportModule } from './php-appointment-report/php-appointment-report.module';
import { PhpOpdReportModule } from './php-opd-report/php-opd-report.module';
import { PhpIpdReportModule } from './php-ipd-report/php-ipd-report.module';
import { PhpPayrollReportModule } from './php-payroll-report/php-payroll-report.module';
import { PhpExpenseReportModule } from './php-expense-report/php-expense-report.module';
import { PhpTransactionReportModule } from './php-transaction-report/php-transaction-report.module';
import { PhpDailyTransactionSummaryReportModule } from './php-daily-transaction-summary-report/php-daily-transaction-summary-report.module';
import { FaceAuthModule } from './face-auth/face-auth.module';
import { PhpIncomeReportModule } from './php-income-report/php-income-report.module';
import { PhpCollectionByReportModule } from './php-collection_by-report/php-collection_by-report.module';
import { AswinAiHospitalOnboardModule } from './aswin-ai-hospital-onboard/aswin-ai-hospital-onboard.module';
import { DashboardStaffModule } from './dashboard_staff/dashboard_staff.module';
import { DashboardIncomeExpenseModule } from './dashboard_income_expense/dashboard_income_expense.module';
import { InternalTransactionIdModule } from './internal-transaction-id/internal-transaction-id.module';
import { QrEncrpytModule } from './qr-encrpyt/qr-encrpyt.module';
import { QrTypeModule } from './qr_type/qr_type.module';
import { OverallPaymentSummaryModule } from './overall-payment-summary/overall-payment-summary.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot({
      type: process.env.HMS_TYPE as 'mysql',
      host: process.env.HMS_HOST_NAME,
      port: parseInt(process.env.HMS_PORT),
      username: process.env.HMS_USERNAME,
      password: process.env.HMS_PASSWORD,
      database: process.env.HMS_DB_NAME,
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: false,
    }),

    TypeOrmModule.forRoot({
      type: process.env.ADMIN_TYPE as 'mysql',
      host: process.env.ADMIN_HOST_NAME,
      name: 'AdminConnection',
      port: parseInt(process.env.ADMIN_PORT),
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
      database: process.env.ADMIN_DB_NAME,
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: false,
    }),

    TypeOrmModule.forRoot({
      type: process.env.ASWIN_TYPE as 'mysql',
      host: process.env.ASWIN_HOST_NAME,
      name: 'aswinConnection',
      port: parseInt(process.env.ASWIN_PORT),
      username: process.env.ASWIN_USERNAME,
      password: process.env.ASWIN_PASSWORD,
      database: process.env.ASWIN_DB_NAME,
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: false,
    }),

    SetupHospitalChargesUnitTypeModule,

    SetupHospitalChargesTaxCategoryModule,

    SetupHospitalChargesChargeCategoryModule,

    SetupFrontOfficeAppointmentPriorityModule,

    SetupFrontOfficeSourceModule,

    SetupFrontOfficeComplainTypeModule,

    SetupFrontOfficePurposeModule,

    SetupPharmacyDoseDurationModule,

    SetupPharmacyDoseIntervalModule,

    MedicineCategoryModule,

    SetupPharmacySupplierModule,

    SetupPharmacyMedicineDosageModule,

    FindingsCategoryModule,

    SetupFindingsFindingModule,

    SetupPathologyPathologyCategoryModule,

    SetupPathologyUnitModule,

    SetupPathologyPathologyParameterModule,

    SetupOperationOperationCategoryModule,

    SetupOperationOperationModule,

    OtpModule,

    SetupRadiologyRadiologyCategoryModule,

    SetupRadiologyUnitModule,

    SetupRadiologyRadiologyParameterModule,

    SetupBloodBankProductsModule,

    SetupHospitalChargesChargeTypeMasterModule,

    SetupHospitalChargesChargeTypeModuleModule,

    SetupHospitalChargeChargesModule,

    SetupSymptomsSymptomsTypeModule,

    SetupSymptomsSymptomsHeadModule,

    SetupFinanceIncomeHeadModule,

    SetupFinanceExpenseHeadModule,

    SetupInventoryItemCategoryModule,

    SetupInventoryItemStoreModule,

    SetupInventoryItemSupplierModule,

    SetupBedFloorModule,

    SetupBedBedTypeModule,

    SetupBedBedGroupModule,

    FaceAuthModule,

    SetupBedBedModule,

    SetupBedBedStatusModule,

    SetupHumanResourceSpecialistModule,

    SetupHumanResourceDesignationModule,

    SetupHumanResourceDepartmentModule,

    SetupHumanResourceLeaveTypesModule,

    SetupReferralReferralCategoryModule,

    SetupPatientNewPatientModule,

    SetupAppointmentShiftModule,

    SetupPatientDisabledPatientListModule,

    SetupAppointmentDoctorShiftModule,

    SetupApptSlotAmountModule,

    HumanResourceApplyLeaveModule,
    HumanResourcePayrollModule,
    StaffAttendanceModule,

    SetupApptSlotTimimgsModule,

    SetupReferralReferralCommissionModule,
    // HumanResourceAddStaffModule,
    AddAppointmentModule,
    InternalAppointmentStaffModule,
    InternalAppointmentChargesModule,
    InternalAppointmentShiftModule,
    InternalAppointmentSlotModule,
    InternalAppointmentPriorityModule,
    OpdOutPatientModule,
    InternalOpdOverviewModule,
    InternalOpdOverviewConsultantDoctorModule,
    InternalOpdOverviewVisitsModule,
    InternalOpdTimelineModule,
    InternalOpdChargesModule,
    SettingsRolesPermissionsModule,
    SettingsNotificationSettingModule,
    SettingsSystemNotificationSettingModule,
    SettingPrefixSettingModule,
    SettingLanguagesModule,
    SettingsUsersPatientsModule,
    SettingsUsersStaffsModule,
    ModulesPatientModule,
    SettingsModulesPatientModule,
    SettingsGeneralSettingModule,
    SettingsCaptchaSettingsModule,
    SettingsFrontCmsSettingModule,
    AddAppointmentDoctorWiseModule,
    AddAppointmentPatientQueueModule,
    TpaManagementModule,
    // HumanResourceAddStaffModule,
    HumanResourceStaffModule,
    DischargePatientOpdModuleModule,
    InternalModulesChargeCategoryModule,
    InternalModulesChargesnameAndIdModule,
    InternalOpdTreatmentHistoryModule,
    AppointmentStatusModule,
    AppointmentFilterModule,
    HospitalChargesModule,
    InternalOpdPaymentModule,
    InternalModulesAppointmentsSlotChargeCategoryModule,
    ConsultationProcessListModule,
    HospitalsModule,
    SettingsModuleModule,
    OpdOperationModule,
    ReferralPersonModule,
    ReferralPersonCommissionModule,
    ReferralPaymentModule,
    IpdMainModuleModule,
    DischargePatientIpdModuleModule,
    RevertDischargePatientIpdModuleModule,
    NurseNotesIpdModule,
    ConsultantRegisterIpdModule,
    TimelineIpdModule,
    OperationIpdModule,
    PrescriptionIpdModule,
    PharmacyModule,
    MedicationIpdModule,
    BedHistoryModule,
    IpdTreatmentHistoryModule,
    InternalIpdChargesModule,
    InternalIpdPaymentModule,

    OpdOperationModule,
    FinanceIncomeModule,
    FinanceExpenseModule,
    BillingModule,
    BillingFilterModule,
    InternalOpdMedicationMedicationDoseModule,
    InternalOpdMedicationMedicationNameModule,
    EmrNewLoginModule,
    EmrAppointmentModule,
    EmrPatientDetailsModule,
    EmrInternalApiModule,
    EmrAppointmentFilterModule,
    EmrAddNewPatientModule,
    EmrAddNewPatientWithAbhaQrModule,
    EmrAppointmentStatusModule,
    EmrOpdOutPatientModule,
    PurchaseMedicineModule,
    PharmacyGenerateBillModule,
    PathologyTestModule,
    PathologyGenerateBillModule,
    PhpInventoryModule,
    PhpRecordsModule,
    RadiologyTestModule,
    RadiologyGenerateBillModule,
    EmrOpdPatientAndDoctorProfileModule,
    PhpInventoryModule,
    OpdBillingModule,
    EmrOpdFilterModule,
    VisitorBookModule,
    PhoneCallLogModule,
    PostalReceiveDispatchModule,
    FrontofficeComplainModule,
    AmbulanceListModule,
    AmbulanceCallModule,
    OpdMedicationModule,
    RevertDischargePatientOpdModuleModule,
    EmrHumanResourceAddStaffModule,
    EmrHumanResourceProfileModule,
    DonorDetailsModule,
    ComponentIssueModule,
    StaffIdCardModule,
    PatientIdCardModule,
    CertificatesModule,
    FrontCmsPageModule,
    OpdMedicationModule,
    SettingsSmsSettingsModule,
    PrintSettingModule,
    FrontCmsEventGalleryNewsModule,
    IpdDoctorsModule,
    MediaManagerModule,
    FrontCmsBannerModule,
    FrontCmsMenuModule,
    SettingsSmsSettingsModule,
    PrintSettingModule,
    SettingsSmsSettingsModule,
    PrintSettingModule,
    SettingsEmailSettingsModule,
    SettingsPaymentMethodsModule,
    OpdPrescriptionModule,
    CheckForDuplicateAppointmentModule,
    SetupHumanResourcePayslipCategoryModule,
    SetupHumanResourcePayslipSettingsModule,
    // InternalApptPaymentForDoctorsModule,
    PhrAppointmentModule,
    PhrAppointmentStatusModule,
    PhrConsultationProcessModule,
    PhrHospitalsModule,
    OpHubAppointmentModule,
    OpHubAppointmentStatusModule,
    OpHubBillingModule,
    OpHubCheckForDuplicateAppointmentModule,
    OpHubCheckOldPatientModule,
    OpHubClinicalNotesModule,
    OpHubClinicalNotesWithAbhaModule,
    OpHubCompleteAndCloseConsultationModule,
    OpHubConsultationProcessModule,
    OpHubDoctorSlotShiftServiceModule,
    OpHubDoctorsModule,
    OpHubEmrModule,
    OpHubGetAbhaAddressOfPatientModule,
    OpHubGetPatientDetailsByAayushUniqueIdModule,
    OpHubInternalAppntDoctorsModule,
    OpHubLoginModule,
    OpHubManualVitalsModule,
    OpHubFcmTokenModule,
    OpHubOpdPrescriptionModule,
    OpHubOverallHeaderSerachModule,
    OpHubPatientFromQrModule,
    OpHubPatientAppointmentListModule,
    OpHubPatientProfileModule,
    OpHubPrescriptionModule,
    OpHubPreviewDocModule,
    OpHubSendNotificationModule,
    OpHubTokenGenerationModule,
    OpHubTokenInitiateModule,
    OpHubUnlinkAbhaFromPatientModule,
    OpHubUploadDocPreviewModule,
    OpHubVitalsModule,
    OpHubVitalsVibrasenseModule,
    SmsNewsletterModule,
    SarvamJobOpdIdMappingModule,
    PhpAppointmentReportModule,
    PhpOpdReportModule,
    PhpIpdReportModule,
    PhpPayrollReportModule,
    PhpExpenseReportModule,
    PhpTransactionReportModule,
    PhpDailyTransactionSummaryReportModule,
    PhpIncomeReportModule,
    PhpCollectionByReportModule,
    AswinAiHospitalOnboardModule,
    DashboardStaffModule,
    DashboardIncomeExpenseModule,
    QrEncrpytModule,
    QrTypeModule,
    InternalTransactionIdModule,
    OverallPaymentSummaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
