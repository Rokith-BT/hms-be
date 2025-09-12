import { ApiProperty } from '@nestjs/swagger';
import { chiefComplaintsBasic } from "../dto/create_chief_complaints_basic.dto";
import { chiefComplaintsDetails } from "../dto/create_chief_complaints_details.dto";
import { diagnosisReport } from "../dto/create_diagnosis_report.dto";
import { dietPlan } from "../dto/create_diet_plan.dto";
import { followUp } from "../dto/create_follow_up.dto";
import { pasttreatmentHistoru } from "../dto/create_past_treatment_history.dto";
import { pastTreatmentHistoryDocs } from "../dto/create_past_treatment_history_docs.dto";
import { treatmentAdvice } from "../dto/create_treatment_advice.dto";
import { UpdatefollowUp } from '../dto/update_follow_up.dto';
import { UpdatedietPlan } from '../dto/update_diet_plan.dto';
import { UpdatediagnosisReport } from '../dto/update_diagnosis_report.dto';
import { UpdatetreatmentAdvice } from '../dto/update_treatment_advice.dto';
import { UpdatepasttreatmentHistoru } from '../dto/update_past_treatment_history.dto';
import { UpdatepastTreatmentHistoryDocs } from '../dto/update_past_treatment_history_docs.dto';
import { UpdatechiefComplaintsBasic } from '../dto/update_chief_complaints_basic.dto';
import { UpdatechiefComplaintsDetails } from '../dto/update_chief_complaints_details.dto';

export class ClinicalNotesWithAbha {
    @ApiProperty({ type: followUp, required: false })
    followUp?: followUp;

    @ApiProperty({ type: dietPlan, required: false })
    dietPlan?: dietPlan;

    @ApiProperty({ type: diagnosisReport, isArray: true, required: false })
    diagnosisReport?: diagnosisReport[];

    @ApiProperty({ type: treatmentAdvice, required: false })
    treatmentAdvice?: treatmentAdvice;

    @ApiProperty({ type: pasttreatmentHistoru, required: false })
    pastTreatmentHistory?: pasttreatmentHistoru;

    @ApiProperty({ type: pastTreatmentHistoryDocs, isArray: true, required: false })
    pastTreatmentHistoryDocs?: pastTreatmentHistoryDocs[];

    @ApiProperty({ type: chiefComplaintsBasic, isArray: true, required: false })
    chiefComplaintsBasic?: chiefComplaintsBasic[];

    @ApiProperty({ type: chiefComplaintsDetails, required: false })
    chiefComplaintDetails?: chiefComplaintsDetails;

    @ApiProperty({ type: Number, example: 1, required: false })
    hospital_id?: number;
}

export class UpdateClinicalNotesWithAbha {
    @ApiProperty({ type: UpdatefollowUp, required: false })
    followUp?: UpdatefollowUp;

    @ApiProperty({ type: UpdatedietPlan, required: false })
    dietPlan?: UpdatedietPlan;

    @ApiProperty({ type: UpdatediagnosisReport, isArray: true, required: false })
    diagnosisReport?: UpdatediagnosisReport[];

    @ApiProperty({ type: UpdatetreatmentAdvice, required: false })
    treatmentAdvice?: UpdatetreatmentAdvice;

    @ApiProperty({ type: UpdatepasttreatmentHistoru, required: false })
    pastTreatmentHistory?: UpdatepasttreatmentHistoru;

    @ApiProperty({ type: UpdatepastTreatmentHistoryDocs, isArray: true, required: false })
    pastTreatmentHistoryDocs?: UpdatepastTreatmentHistoryDocs[];

    @ApiProperty({ type: UpdatechiefComplaintsBasic, isArray: true, required: false })
    chiefComplaintsBasic?: UpdatechiefComplaintsBasic[];

    @ApiProperty({ type: UpdatechiefComplaintsDetails, required: false })
    chiefComplaintDetails?: UpdatechiefComplaintsDetails;

    @ApiProperty({ type: Number, example: 1, required: false })
    hospital_id?: number;
}


class ChiefComplaintsBasicDto {
    @ApiProperty({ example: 3, required: false })
    id?: number;

    @ApiProperty({ example: 1, required: false })
    opd_id?: number;

    @ApiProperty({ example: 6, required: false })
    chief_complaints_detail_id?: number;

    @ApiProperty({ example: 'Head pain', required: false })
    complaints_name?: string;

    @ApiProperty({ example: 'voice', required: false })
    filled_using?: string;

    @ApiProperty({ example: '2024-10-16T12:41:03.000Z', required: false })
    created_at?: string;
}
class ChiefComplaintDetailsDto {
    @ApiProperty({ example: 6, required: false })
    id?: number;

    @ApiProperty({ example: 1, required: false })
    opd_id?: number;

    @ApiProperty({ example: '1', required: false })
    count?: string;

    @ApiProperty({ example: 'days', required: false })
    duration_limit?: string;

    @ApiProperty({ example: 'head is paining for the past 2 days', required: false })
    remarks?: string;

    @ApiProperty({ example: 'voice', required: false })
    filled_using?: string;

    @ApiProperty({ example: '2024-10-16T12:41:03.000Z', required: false })
    created_at?: string;
}

class PastTreatmentHistoryDto {
    @ApiProperty({ example: 1, required: false })
    id?: number;

    @ApiProperty({ example: 1, required: false })
    opd_id?: number;

    @ApiProperty({ example: 'history of the report will be written here', required: false })
    history?: string;

    @ApiProperty({ example: 'scrible', required: false })
    filled_using?: string;

    @ApiProperty({ example: '2024-10-16T12:41:03.000Z', required: false })
    created_at?: string;
}

class PastTreatmentHistoryDocsDto {
    @ApiProperty({ example: 1, required: false })
    id?: number;

    @ApiProperty({ example: 1, required: false })
    past_history_id?: number;

    @ApiProperty({ example: 1, required: false })
    opd_id?: number;

    @ApiProperty({ example: 'document.pdf', required: false })
    document?: string;

    @ApiProperty({ example: 'voice', required: false })
    filled_using?: string;

    @ApiProperty({ example: '2024-10-16T12:41:03.000Z', required: false })
    created_at?: string;
}

class DiagnosisReportDto {
    @ApiProperty({ example: 1, required: false })
    id?: number;

    @ApiProperty({ example: 'Pathology', required: false })
    test_categories?: string;

    @ApiProperty({ example: 'blood test', required: false })
    sub_category?: string;

    @ApiProperty({ example: 'laboratory', required: false })
    laboratory?: string;

    @ApiProperty({ example: 'remarks of the report will be written here', required: false })
    remarks?: string;

    @ApiProperty({ example: 'voice', required: false })
    filled_using?: string;

    @ApiProperty({ example: 1, required: false })
    opd_id?: number;

    @ApiProperty({ example: '2024-10-16T12:41:03.000Z', required: false })
    created_at?: string;
}
class DietPlanDto {
    @ApiProperty({ example: 1, required: false })
    id?: number;

    @ApiProperty({ example: 1, required: false })
    opd_id?: number;

    @ApiProperty({ example: 'diet plan for the patients', required: false })
    diet_plan?: string;

    @ApiProperty({ example: 'voice', required: false })
    filled_using?: string;

    @ApiProperty({ example: '2024-10-16T12:41:03.000Z', required: false })
    created_at?: string;
}


class TreatmentAdviceDto {
    @ApiProperty({ example: 1, required: false })
    id?: number;

    @ApiProperty({ example: 1, required: false })
    opd_id?: number;

    @ApiProperty({ example: 'advise for the patients will be written here', required: false })
    treatment_advice?: string;

    @ApiProperty({ example: '2024-10-16T12:41:04.000Z', required: false })
    created_at?: string;

    @ApiProperty({ example: 'scrible', required: false })
    filled_using?: string;
}
class FollowUpDto {
    @ApiProperty({ example: 1, required: false })
    id?: number;

    @ApiProperty({ example: 1, required: false })
    opd_id?: number;

    @ApiProperty({ example: '1', required: false })
    count?: string;

    @ApiProperty({ example: 'days', required: false })
    duration?: string;

    @ApiProperty({ example: '2024-11-10T18:30:00.000Z', required: false })
    date?: string;

    @ApiProperty({ example: 'head is paining for the past 2 days', required: false })
    remarks?: string;

    @ApiProperty({ example: 'voice', required: false })
    filled_using?: string;

    @ApiProperty({ example: '2024-10-16T12:41:03.000Z', required: false })
    created_at?: string;
}
export class ClinicalNotesResponseDto {
    @ApiProperty({ example: 'success' })
    status: string;

    @ApiProperty({ example: 'clinical-notes fetched  successfully' })
    message: string;

    @ApiProperty({ type: [ChiefComplaintsBasicDto] })
    chiefComplaintsBasic: ChiefComplaintsBasicDto[];

    @ApiProperty({ type: ChiefComplaintDetailsDto })
    chiefComplaintDetails: ChiefComplaintDetailsDto;

    @ApiProperty({ type: PastTreatmentHistoryDto })
    pastTreatmentHistory: PastTreatmentHistoryDto;

    @ApiProperty({ type: [PastTreatmentHistoryDocsDto] })
    pastTreatmentHistoryDocs: PastTreatmentHistoryDocsDto[];

    @ApiProperty({ type: [DiagnosisReportDto] })
    diagnosisReport: DiagnosisReportDto[];

    @ApiProperty({ type: DietPlanDto })
    dietPlan: DietPlanDto;

    @ApiProperty({ type: TreatmentAdviceDto })
    treatmentAdvice: TreatmentAdviceDto;

    @ApiProperty({ type: FollowUpDto })
    followUp: FollowUpDto;
}

export class postResp {
    @ApiProperty({ example: 'success' })
    status: string;

    @ApiProperty({ example: 'clinical-notes added successfully' })
    message: string;
}

export class updateResp {
    @ApiProperty({ example: 'success' })
    status: string;

    @ApiProperty({ example: 'clinical notes updated successfully' })
    message: string;
}