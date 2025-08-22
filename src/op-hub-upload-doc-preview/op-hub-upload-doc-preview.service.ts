import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OpHubPreviewDocService } from 'src/op-hub-preview-doc/op-hub-preview-doc.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import axios from 'axios';
import { awsConfig } from 'src/aws.config';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from "uuid";
import {
  S3,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

@Injectable()
export class OpHubUploadDocPreviewService {


  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => OpHubPreviewDocService))
    private docPreviewData: OpHubPreviewDocService
  ) { }

  async create(
    file: any,
    opd_id: number,
    hospital_id: number,
    abhaAddress: string
  ) {
    console.log(   file,": any",
      opd_id,": number",
      hospital_id,": number",
      abhaAddress,": string");
    
    if (!hospital_id) {
      return {
        status: "failed",
        messege: "enter hospital_id to post clinical notes",
      };
    }
    const [getPatientID] = await this.dynamicConnection.query(
      `select patient_id from opd_details where id = ?`,
      [opd_id]
    );
    
    const [checkPatientAbhaAddress] = await this.dynamicConnection.query(
      `select * from patient_abha_address where abhaAddress = ?`,
      [abhaAddress]
    );
    console.log(checkPatientAbhaAddress,"checkPatientAbhaAddress");
    
    const [getPatDOB] = await this.dynamicConnection.query(
      `select * from patients where id = ?`,
      [getPatientID.patient_id]
    );
    let yob;
    if (getPatDOB.dob) {
      const [getYob] = await this.dynamicConnection.query(
        `SELECT YEAR(dob) AS year FROM patients where id = ?`,
        [getPatientID.patient_id]
      );
      yob = await getYob.year;
    }



    try {
      
      await this.dynamicConnection.query(
        `update visit_details set case_sheet_document = ? where opd_details_id = ?`,
        [file, opd_id]
      );
      const [getAdminOPD] = await this.connection.query(
        `select id from opd_details where Hospital_id = ? and hos_opd_id = ?`,
        [hospital_id, opd_id]
      );
      await this.connection.query(
        `update visit_details set case_sheet_document = ? where opd_details_id = ?`,
        [file, getAdminOPD.id]
      );

      return {
        status: "success",
        message: "case sheet uploaded successfully",
      };
    } catch (error) {
      return {
        status: "failed",
        message: "unable to upload case sheet",
        error,
      };
    } finally {
      
      const getPreviewData = await this.docPreviewData.findAll(
        opd_id,
        hospital_id
      );
      let patientDetails = await getPreviewData.details.patient_details;
      const bundleDate = new Date(patientDetails.bundleDate);
      const options = {
        year: 'numeric' as 'numeric',
        month: '2-digit' as '2-digit',
        day: '2-digit' as '2-digit',
        hour: '2-digit' as '2-digit',
        minute: '2-digit' as '2-digit',
        second: '2-digit' as '2-digit',
        hourCycle: 'h23' as 'h23',
        timeZone: 'Asia/Kolkata'
      };

      const new_bundle_Date = new Intl.DateTimeFormat('en-CA', options).format(bundleDate);
      const [date, time] = new_bundle_Date.split(', ');
      const isoDate = `${date}T${time}`;
      const finaldob = isoDate.split('T')[0]
      patientDetails.bundleDate = finaldob;


      let vitalDetails = await getPreviewData.details.vitals;
      let doctorDetails = await getPreviewData.details.doctor_details;
      const [getHosDetails] = await this.connection.query(
        `select * from hospitals where plenome_id = ?`,
        [hospital_id]
      );

      const followupDetails =
        await getPreviewData.details.clinical_notes.followUp;

      let CurrDate = new Date().toISOString();
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split("T")[0];


      let CompositionID = uuidv4();
      let PractitionerID = uuidv4();
      let PatientID = uuidv4();
      let OrgtID = uuidv4();
      let RespRateID = uuidv4();
      let BPID = uuidv4();
      let HeartRateID = uuidv4();
      let SPO2ID = uuidv4();
      let TemperatureID = uuidv4();
      let WeightID = uuidv4();
      let HeightID = uuidv4();
      let BMIID = uuidv4();
      let EncounterID = uuidv4();
      let PrescriptionIDs: string[] = [];
      let ChifeCompIDs: string[] = [];
      const wellnessBundle = {
        resourceType: "Bundle",
        id: uuidv4(),
        meta: {
          versionId: "1",
          lastUpdated: CurrDate,
          profile: [
            "https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle",
          ],
          security: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/v3-Confidentiality",
              code: "V",
              display: "very restricted",
            },
          ],
        },
        identifier: {
          system: "http://hip.in",
          value: "305fecc2-4ba2-46cc-9ccd-efa755aff51d",
        },
        type: "document",
        timestamp: CurrDate,
        entry: [
          {
            fullUrl: `urn:uuid:${CompositionID}`,
            resource: {
              resourceType: "Composition",
              id: CompositionID,

              language: "en-IN",

              identifier: {
                system: "https://ndhm.in/phr",
                value: "645bb0c3-ff7e-4123-bef5-3852a4784813",
              },
              status: "final",
              type: {
                text: "Wellness Record",
              },
              encounter: {
                reference: `urn:uuid:${EncounterID}`,
              },
              subject: {
                reference: `urn:uuid:${PatientID}`,
                display: patientDetails.patientName,
              },
              date: CurrDate,
              author: [
                {
                  reference: `urn:uuid:${PractitionerID}`,
                  display: `Dr. ${doctorDetails.doctorName}`,
                },
              ],
              title: "Wellness Record",
              section: [
                {
                  title: "Vital Signs",
                  entry: [
                    {
                      reference: `urn:uuid:${RespRateID}`,
                      display: "ObservationVitalSigns",
                    },
                    {
                      reference: `urn:uuid:${HeartRateID}`,
                      display: "ObservationVitalSigns",
                    },
                    {
                      reference: `urn:uuid:${SPO2ID}`,
                      display: "ObservationVitalSigns",
                    },
                    {
                      reference: `urn:uuid:${TemperatureID}`,
                      display: "ObservationVitalSigns",
                    },
                    {
                      reference: `urn:uuid:${BPID}`,
                      display: "ObservationVitalSigns",
                    },
                  ],
                },
                {
                  title: "Body Measurement",
                  entry: [
                    {
                      reference: `urn:uuid:${HeightID}`,
                      display: "ObservationBodyMeasurements",
                    },
                    {
                      reference: `urn:uuid:${WeightID}`,
                      display: "ObservationBodyMeasurements",
                    },
                    {
                      reference: `urn:uuid:${BMIID}`,
                      display: "ObservationBodyMeasurements",
                    },
                  ],
                },
              ],
            },
          },
          {
            fullUrl: `urn:uuid:${PractitionerID}`,
            resource: {
              resourceType: "Practitioner",
              id: `${PractitionerID}`,

              identifier: [
                {
                  type: {
                    coding: [
                      {
                        system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                        code: "MD",
                        display: "Medical License number",
                      },
                    ],
                  },
                  system: "https://doctor.ndhm.gov.in",
                  value: "21-1521-3828-3227",
                },
              ],
              name: [
                {
                  text: `Dr. ${doctorDetails.doctorName}`,
                },
              ],
            },
          },
          {
            fullUrl: `urn:uuid:${PatientID}`,
            resource: {
              resourceType: "Patient",
              id: `${PatientID}`,

              identifier: [
                {
                  type: {
                    coding: [
                      {
                        system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                        code: "MR",
                        display: "Medical record number",
                      },
                    ],
                  },
                  system: "https://healthid.ndhm.gov.in",
                  value: "22-7225-4829-5255",
                },
              ],
              name: [
                {
                  text: patientDetails.patientName,
                },
              ],
              telecom: [
                {
                  system: "phone",
                  value: Number(patientDetails.mobileno),
                  use: "home",
                },
              ],
              gender: patientDetails.gender.toLocaleLowerCase(),
              birthDate: patientDetails.bundleDate,
            },
          },
          {
            fullUrl: `urn:uuid:${EncounterID}`,
            resource: {
              resourceType: "Encounter",
              id: `${PatientID}`,
              status: "finished",
              class: {
                system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                code: "AMB",
                display: "OPD Visit",
              },
              subject: {
                reference: `urn:uuid:${PatientID}`,
              },
              period: {
                start: CurrDate,
              },
            },
          },
          {
            fullUrl: `urn:uuid:${OrgtID}`,
            resource: {
              resourceType: "Organization",
              id: `${OrgtID}`,

              identifier: [
                {
                  type: {
                    coding: [
                      {
                        system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                        code: "PRN",
                        display: "Provider number",
                      },
                    ],
                  },
                  system: "https://facility.ndhm.gov.in",
                  value: "4567823",
                },
              ],
              name: getHosDetails.hospital_name,
              telecom: [
                {
                  system: "phone",
                  value: getHosDetails.contact_no,
                  use: "work",
                },
                {
                  system: "email",
                  value: getHosDetails.email,
                  use: "work",
                },
              ],
            },
          },
          {
            fullUrl: `urn:uuid:${RespRateID}`,
            resource: {
              resourceType: "Observation",
              id: `${RespRateID}`,

              status: "final",
              category: [
                {
                  coding: [
                    {
                      system:
                        "http://terminology.hl7.org/CodeSystem/observation-category",
                      code: "vital-signs",
                      display: "Vital Signs",
                    },
                  ],
                  text: "Vital Signs",
                },
              ],
              code: {
                coding: [
                  {
                    system: "http://loinc.org",
                    code: "9279-1",
                    display: "Respiratory rate",
                  },
                ],
                text: "Respiratory rate",
              },
              subject: {
                reference: `urn:uuid:${PatientID}`,
                display: "Patient",
              },
              effectiveDateTime: "2020-09-29",
              performer: [
                {
                  reference: `urn:uuid:${PractitionerID}`,
                  display: "Practitioner",
                },
              ],
              valueQuantity: {
                value: Number(vitalDetails.respiration),
                unit: "breaths/minute",
                system: "http://unitsofmeasure.org",
                code: "/min",
              },
            },
          },
          {
            fullUrl: `urn:uuid:${HeartRateID}`,
            resource: {
              resourceType: "Observation",
              id: `${HeartRateID}`,

              status: "final",
              category: [
                {
                  coding: [
                    {
                      system:
                        "http://terminology.hl7.org/CodeSystem/observation-category",
                      code: "vital-signs",
                      display: "Vital Signs",
                    },
                  ],
                  text: "Vital Signs",
                },
              ],
              code: {
                coding: [
                  {
                    system: "http://loinc.org",
                    code: "8867-4",
                    display: "Heart rate",
                  },
                ],
                text: "Heart rate",
              },
              subject: {
                reference: `urn:uuid:${PatientID}`,
                display: "Patient",
              },
              effectiveDateTime: "2020-09-29",
              performer: [
                {
                  reference: `urn:uuid:${PractitionerID}`,
                  display: "Practitioner",
                },
              ],
              valueQuantity: {
                value: Number(vitalDetails.pulse),
                unit: "beats/minute",
                system: "http://unitsofmeasure.org",
                code: "/min",
              },
            },
          },
          {
            fullUrl: `urn:uuid:${SPO2ID}`,
            resource: {
              resourceType: "Observation",
              id: `${SPO2ID}`,

              identifier: [
                {
                  system: "http://goodcare.org/observation/id",
                  value: "o1223435-10",
                },
              ],
              status: "final",
              category: [
                {
                  coding: [
                    {
                      system:
                        "http://terminology.hl7.org/CodeSystem/observation-category",
                      code: "vital-signs",
                      display: "Vital Signs",
                    },
                  ],
                  text: "Vital Signs",
                },
              ],
              code: {
                coding: [
                  {
                    system: "http://loinc.org",
                    code: "2708-6",
                    display: "Oxygen saturation in Arterial blood",
                  },
                ],
              },
              subject: {
                reference: `urn:uuid:${PatientID}`,
                display: "Patient",
              },
              effectiveDateTime: "2020-09-29T09:30:10+01:00",
              performer: [
                {
                  reference: `urn:uuid:${PractitionerID}`,
                  display: "Practitioner",
                },
              ],
              valueQuantity: {
                value: Number(vitalDetails.spo2),
                unit: "%",
                system: "http://unitsofmeasure.org",
                code: "%",
              },
              interpretation: [
                {
                  coding: [
                    {
                      system:
                        "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                      code: "N",
                      display: "Normal",
                    },
                  ],
                  text: "Normal (applies to non-numeric results)",
                },
              ],
              referenceRange: [
                {
                  low: {
                    value: 90,
                    unit: "%",
                    system: "http://unitsofmeasure.org",
                    code: "%",
                  },
                  high: {
                    value: 99,
                    unit: "%",
                    system: "http://unitsofmeasure.org",
                    code: "%",
                  },
                },
              ],
            },
          },
          {
            fullUrl: `urn:uuid:${TemperatureID}`,
            resource: {
              resourceType: "Observation",
              id: `${TemperatureID}`,

              status: "final",
              code: {
                coding: [
                  {
                    system: "http://loinc.org",
                    code: "61008-9",
                    display: "Body surface temperature",
                  },
                ],
                text: "Body surface temperature",
              },
              subject: {
                reference: `urn:uuid:${PatientID}`,
                display: "Patient",
              },
              effectiveDateTime: "2021-03-09",
              performer: [
                {
                  reference: `urn:uuid:${PractitionerID}`,
                  display: "Practitioner",
                },
              ],
              valueQuantity: {
                value: Number(vitalDetails.temperature),
                unit: "Cel",
                system: "http://unitsofmeasure.org",
                code: "Cel",
              },
            },
          },
          {
            fullUrl: `urn:uuid:${HeightID}`,
            resource: {
              resourceType: "Observation",
              id: `${HeightID}`,

              status: "final",
              category: [
                {
                  coding: [
                    {
                      system:
                        "http://terminology.hl7.org/CodeSystem/observation-category",
                      code: "vital-signs",
                      display: "Vital Signs",
                    },
                  ],
                  text: "Vital Signs",
                },
              ],
              code: {
                coding: [
                  {
                    system: "http://loinc.org",
                    code: "8302-2",
                    display: "Body height",
                  },
                ],
                text: "Body height",
              },
              subject: {
                reference: `urn:uuid:${PatientID}`,
                display: "Patient",
              },
              effectiveDateTime: "2020-09-29",
              performer: [
                {
                  reference: `urn:uuid:${PractitionerID}`,
                  display: "Practitioner",
                },
              ],
              valueQuantity: {
                value: Number(vitalDetails.height),
                unit: "cm",
                system: "http://unitsofmeasure.org",
                code: "cm",
              },
            },
          },
          {
            fullUrl: `urn:uuid:${WeightID}`,
            resource: {
              resourceType: "Observation",
              id: `${WeightID}`,

              status: "final",
              category: [
                {
                  coding: [
                    {
                      system:
                        "http://terminology.hl7.org/CodeSystem/observation-category",
                      code: "vital-signs",
                      display: "Vital Signs",
                    },
                  ],
                },
              ],
              code: {
                coding: [
                  {
                    system: "http://loinc.org",
                    code: "29463-7",
                    display: "Body weight",
                  },
                ],
              },
              subject: {
                reference: `urn:uuid:${PatientID}`,
                display: "Patient",
              },
              effectiveDateTime: "2020-09-29",
              performer: [
                {
                  reference: `urn:uuid:${PractitionerID}`,
                  display: "Practitioner",
                },
              ],
              valueQuantity: {
                value: Number(vitalDetails.weight),
                unit: "kg",
                system: "http://unitsofmeasure.org",
                code: "kg",
              },
            },
          },
          {
            fullUrl: `urn:uuid:${BMIID}`,
            resource: {
              resourceType: "Observation",
              id: `${BMIID}`,

              status: "final",
              category: [
                {
                  coding: [
                    {
                      system:
                        "http://terminology.hl7.org/CodeSystem/observation-category",
                      code: "vital-signs",
                      display: "Vital Signs",
                    },
                  ],
                  text: "Vital Signs",
                },
              ],
              code: {
                coding: [
                  {
                    system: "http://loinc.org",
                    code: "39156-5",
                    display: "Body mass index (BMI) [Ratio]",
                  },
                ],
                text: "BMI",
              },
              subject: {
                reference: `urn:uuid:${PatientID}`,
                display: "Patient",
              },
              effectiveDateTime: "2020-09-29",
              performer: [
                {
                  reference: `urn:uuid:${PractitionerID}`,
                  display: "Practitioner",
                },
              ],
              valueQuantity: {
                value:
                  Number(vitalDetails.weight) /
                  (Number(vitalDetails.height) * Number(vitalDetails.height)),
                unit: "kg/m2",
                system: "http://unitsofmeasure.org",
                code: "kg/m2",
              },
            },
          },
          {
            fullUrl: `urn:uuid:${BPID}`,
            resource: {
              resourceType: "Observation",
              id: `${BPID}`,

              identifier: [
                {
                  system: "urn:ietf:rfc:3986",
                  value: "urn:uuid:187e0c12-8dd2-67e2-99b2-bf273c878281",
                },
              ],
              status: "final",
              category: [
                {
                  coding: [
                    {
                      system:
                        "http://terminology.hl7.org/CodeSystem/observation-category",
                      code: "vital-signs",
                      display: "Vital Signs",
                    },
                  ],
                },
              ],
              code: {
                coding: [
                  {
                    system: "http://loinc.org",
                    code: "85354-9",
                    display: "Blood pressure panel with all children optional",
                  },
                ],
                text: "Blood pressure panel with all children optional",
              },
              subject: {
                reference: `urn:uuid:${PatientID}`,
                display: "Patient",
              },
              effectiveDateTime: "2020-09-29",
              performer: [
                {
                  reference: `urn:uuid:${PractitionerID}`,
                  display: "Practitioner",
                },
              ],
              interpretation: [
                {
                  coding: [
                    {
                      system:
                        "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                      code: "L",
                      display: "low",
                    },
                  ],
                  text: "Below low normal",
                },
              ],
              bodySite: {
                coding: [
                  {
                    system: "http://snomed.info/sct",
                    code: "368209003",
                    display: "Right arm",
                  },
                ],
              },
              component: [
                {
                  code: {
                    coding: [
                      {
                        system: "http://loinc.org",
                        code: "8480-6",
                        display: "Systolic blood pressure",
                      },
                    ],
                  },
                  valueQuantity: {
                    value: Number(vitalDetails.bp),
                    unit: "mmHg",
                    system: "http://unitsofmeasure.org",
                    code: "mm[Hg]",
                  },
                  interpretation: [
                    {
                      coding: [
                        {
                          system:
                            "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                          code: "N",
                          display: "normal",
                        },
                      ],
                      text: "Normal",
                    },
                  ],
                },
                {
                  code: {
                    coding: [
                      {
                        system: "http://loinc.org",
                        code: "8462-4",
                        display: "Diastolic blood pressure",
                      },
                    ],
                  },
                  valueQuantity: {
                    value: Number(vitalDetails.bp),
                    unit: "mmHg",
                    system: "http://unitsofmeasure.org",
                    code: "mm[Hg]",
                  },
                  interpretation: [
                    {
                      coding: [
                        {
                          system:
                            "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                          code: "L",
                          display: "low",
                        },
                      ],
                      text: "Below low normal",
                    },
                  ],
                },
              ],
            },
          },
        ],
      };
      const uploadWellnessBody =  {
        value: wellnessBundle,
      };

      const response1 = await axios.post(
        "https://abha-api.plenome.com/file_upload",
        uploadWellnessBody
      );

      const carecontext_reqbody =  {
        // "abhaNumber": "91287816066859",    //optional
        abhaAddress:  abhaAddress,
        patient_ref_no: await getPatDOB.aayush_unique_id,
        patient: [
          {
            display: "Wellness Record Linked",
            careContexts: [
              {
                display: "Wellness document" + formattedDate,
                doc_key: response1.data.data,
              },
            ],

            hiType: "WellnessRecord",
            count: 1,
          },
        ],
      };

      let currDateObj = new Date(CurrDate);
      currDateObj.setDate(currDateObj.getDate() + 2);
      let updatedDate = currDateObj.toISOString();

      let selectedSymptoms: [] = [];


      if (await getPreviewData.details.clinical_notes.chiefComplaintsBasic) {
        selectedSymptoms =
          await getPreviewData.details.clinical_notes.chiefComplaintsBasic;
      }
      let medicationVal: [] = [];

      if (getPreviewData.details.prescription.length > 0) {
        medicationVal = await getPreviewData.details.prescription;
      }
      if (medicationVal.length > 0) {
         medicationVal.forEach((ele: any) => {
          PrescriptionIDs.push(uuidv4());
        });
      }

      if (selectedSymptoms) {
         selectedSymptoms.forEach((elem: any) => {
          ChifeCompIDs.push(uuidv4());
        });
      }

      const docs = await this.findAll(await file);

      let docRefId = uuidv4();


      const getPastTreatHis =
        await getPreviewData.details.clinical_notes.pastTreatmentHistory;
      let treatHisID = uuidv4();
      let followupId = uuidv4();

      const opConsultation: any = {
        resourceType: "Bundle",
        id: uuidv4(),

        identifier: {
          system: "http://hip.in",
          value: uuidv4(),
        },
        type: "document",
        timestamp: CurrDate,
        entry: [
          {
            fullUrl: `urn:uuid:${CompositionID}`,
            resource: {
              resourceType: "Composition",
              id: `${CompositionID}`,
              meta: {
                versionId: "1",
                lastUpdated: CurrDate,
                profile: [
                  "https://nrces.in/ndhm/fhir/r4/StructureDefinition/OPConsultRecord",
                ],
              },
              language: "en-IN",
              identifier: {
                system: "https://ndhm.in/phr",
                value: uuidv4(),
              },
              status: "final",
              type: {
                coding: [
                  {
                    system: "http://snomed.info/sct",
                    code: "371530004",
                    display: "Clinical consultation report",
                  },
                ],
                text: "Clinical Consultation report",
              },
              encounter: {
                reference: `urn:uuid:${EncounterID}`,
              },
              subject: {
                reference: `urn:uuid:${PatientID}`,
                display: patientDetails.patientName,
              },
              date: CurrDate,
              author: [
                {
                  reference: `urn:uuid:${PractitionerID}`,
                  display: doctorDetails.doctorName,
                },
              ],
              title: "Consultation Report",
              custodian: {
                reference: `urn:uuid:${OrgtID}`,
                display: getHosDetails.hospital_name,
              },
              section: [
                {
                  title: "Chief complaints",
                  code: {
                    coding: [
                      {
                        system: "http://snomed.info/sct",
                        code: "422843007",
                        display: "Chief complaint section",
                      },
                    ],
                  },
                  entry: [
                    ...ChifeCompIDs.map((comp: any, i: number) => ({
                      reference: `urn:uuid:${comp}`,
                      display: "Condition",
                    })),
                  ],
                },
                {
                  title: "Medical History",
                  code: {
                    coding: [
                      {
                        system: "http://snomed.info/sct",
                        code: "371529009",
                        display: "History and physical report",
                      },
                    ],
                  },
                  entry: [
                    {
                      reference: `urn:uuid:${treatHisID}`,
                      display: "Condition",
                    },
                  ],
                },
                {
                  title: "Follow Up",
                  code: {
                    coding: [
                      {
                        system: "http://snomed.info/sct",
                        code: "736271009",
                        display: "Outpatient care plan",
                      },
                    ],
                  },
                  entry: [
                    {
                      reference: `urn:uuid:${followupId}`,
                      display: "Appointment",
                    },
                  ],
                },
                {
                  title: "Document Reference",
                  code: {
                    coding: [
                      {
                        system: "http://snomed.info/sct",
                        code: "371530004",
                        display: "Clinical consultation report",
                      },
                    ],
                  },
                  entry: [
                    {
                      reference: `urn:uuid:${docRefId}`,
                      display: "DocumentReference",
                    },
                  ],
                },
              ],
            },
          },
          {
            fullUrl: `urn:uuid:${PractitionerID}`,
            resource: {
              resourceType: "Practitioner",
              id: PractitionerID,
              meta: {
                versionId: "1",
                lastUpdated: CurrDate,
                profile: [
                  "https://nrces.in/ndhm/fhir/r4/StructureDefinition/Practitioner",
                ],
              },
              identifier: [
                {
                  type: {
                    coding: [
                      {
                        system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                        code: "MD",
                        display: "Medical License number",
                      },
                    ],
                  },
                  system: "https://doctor.ndhm.gov.in",
                  value: "21-1521-3828-3227",
                },
              ],
              name: [
                {
                  text: doctorDetails.doctorName,
                },
              ],
            },
          },
          {
            fullUrl: `urn:uuid:${OrgtID}`,
            resource: {
              resourceType: "Organization",
              id: OrgtID,
              meta: {
                profile: [
                  "https://nrces.in/ndhm/fhir/r4/StructureDefinition/Organization",
                ],
              },
              identifier: [
                {
                  type: {
                    coding: [
                      {
                        system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                        code: "PRN",
                        display: "Provider number",
                      },
                    ],
                  },
                  system: "https://facility.ndhm.gov.in",
                  value: "4567823",
                },
              ],
              name: getHosDetails.hospital_name,
              telecom: [
                {
                  system: "phone",
                  value: Number(getHosDetails.contact_no),
                  use: "work",
                },
                {
                  system: "email",
                  value: getHosDetails.email,
                  use: "work",
                },
              ],
            },
          },
          {
            fullUrl: `urn:uuid:${PatientID}`,
            resource: {
              resourceType: "Patient",
              id: PatientID,
              meta: {
                versionId: "1",
                lastUpdated: "2020-07-09T14:58:58.181+05:30",
                profile: [
                  "https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient",
                ],
              },
              identifier: [
                {
                  type: {
                    coding: [
                      {
                        system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                        code: "MR",
                        display: "Medical record number",
                      },
                    ],
                  },
                  system: "https://healthid.ndhm.gov.in",
                  value: "22-7225-4829-5255",
                },
              ],
              name: [
                {
                  text: patientDetails.patientName,
                },
              ],
              telecom: [
                {
                  system: "phone",
                  value: patientDetails.mobileno,
                  use: "home",
                },
              ],
              gender: patientDetails?.gender.toLocaleLowerCase(),
              birthDate: patientDetails?.bundleDate,
            },
          },
          {
            fullUrl: `urn:uuid:${EncounterID}`,
            resource: {
              resourceType: "Encounter",
              id: `${PatientID}`,
              status: "finished",
              class: {
                system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                code: "AMB",
                display: "OPD Visit",
              },
              subject: {
                reference: `urn:uuid:${PatientID}`,
              },
              period: {
                start: CurrDate,
              },
            },
          },
          ...selectedSymptoms.map((symps: any, i: number) => ({
            fullUrl: `urn:uuid:${ChifeCompIDs[i]}`,
            resource: {
              resourceType: "Condition",
              id: ChifeCompIDs[i],
              meta: {
                profile: [
                  "https://nrces.in/ndhm/fhir/r4/StructureDefinition/Condition",
                ],
              },
              clinicalStatus: {
                coding: [
                  {
                    system:
                      "http://terminology.hl7.org/CodeSystem/condition-clinical",
                    code: "active",
                    display: "Active",
                  },
                ],
              },
              code: {
                coding: [
                  {
                    system: "http://snomed.info/sct",
                    code: "297142003",
                    display: "Foot swelling",
                  },
                ],
                text: symps?.complaints_name,
              },
              subject: {
                reference: `urn:uuid:${PatientID}`,
                display: "Patient",
              },
              recordedDate: CurrDate,
            },
          })),

          {
            fullUrl: `urn:uuid:${treatHisID}`,
            resource: {
              resourceType: "Condition",
              id: "2",
              meta: {
                profile: [
                  "https://nrces.in/ndhm/fhir/r4/StructureDefinition/Condition",
                ],
              },
              clinicalStatus: {
                coding: [
                  {
                    system:
                      "http://terminology.hl7.org/CodeSystem/condition-clinical",
                    code: "recurrence",
                    display: "Recurrence",
                  },
                ],
              },
              code: {
                coding: [
                  {
                    system: "http://snomed.info/sct",
                    code: "46635009",
                    display: "Diabetes mellitus type 1",
                  },
                ],
                text: getPastTreatHis?.history || "past treatment history",
              },
              subject: {
                reference: `urn:uuid:${PatientID}`,
                display: "Patient",
              },
              recordedDate: CurrDate,
            },
          },
          {
            fullUrl: `urn:uuid:${followupId}`,
            resource: {
              resourceType: "Appointment",
              id: "1",
              meta: {
                profile: [
                  "https://nrces.in/ndhm/fhir/r4/StructureDefinition/Appointment",
                ],
              },
              status: "booked",
              serviceCategory: [
                {
                  coding: [
                    {
                      system: "http://snomed.info/sct",
                      code: "408443003",
                      display: "General medical practice",
                    },
                  ],
                },
              ],
              serviceType: [
                {
                  coding: [
                    {
                      system: "http://snomed.info/sct",
                      code: "11429006",
                      display: "Consultation",
                    },
                  ],
                },
              ],
              appointmentType: {
                coding: [
                  {
                    system: "http://snomed.info/sct",
                    code: "185389009",
                    display: "Follow-up visit",
                  },
                ],
              },
              reasonReference: [
                {
                  reference: `urn:uuid:${uuidv4()}`,
                  display: "Condition",
                },
              ],
              description:
                (await followupDetails?.remarks) || "remarks of the follow up",
              start: CurrDate,
              end: updatedDate,
              created: CurrDate,
              basedOn: [
                {
                  reference: `urn:uuid:${uuidv4()}`,
                  display: "ServiceRequest",
                },
              ],
              participant: [
                {
                  actor: {
                    reference: `urn:uuid:${PatientID}`,
                    display: "Patient",
                  },
                  status: "accepted",
                },
                {
                  actor: {
                    reference: `urn:uuid:${PractitionerID}`,
                    display: "Practitioner",
                  },
                  status: "accepted",
                },
              ],
            },
          },
          {
            fullUrl: `urn:uuid:${docRefId}`,
            resource: {
              resourceType: "DocumentReference",
              id: "44486a09-bcad-420b-ba14-b769fafb7f84",
              meta: {
                profile: [
                  "https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentReference",
                ],
              },
              status: "current",
              docStatus: "final",
              type: {
                coding: [
                  {
                    system: "http://snomed.info/sct",
                    code: "4241000179101",
                    display: "Laboratory report",
                  },
                ],
                text: "Laboratory report",
              },
              subject: {
                reference: `urn:uuid:${PatientID}`,
                display: "Patient",
              },
              content: [
                {
                  attachment: {
                    contentType: "application/pdf",
                    language: "en-IN",
                    data: docs,
                    title: "Laboratory report",
                    creation: "2019-05-29T14:58:58.181+05:30",
                  },
                },
              ],
            },
          },
        ],
      };
      const uploadBody =  {
        value: await opConsultation,
      };
      const response = await axios.post(
        "https://abha-api.plenome.com/file_upload",
        uploadBody
      );
      let op_key = response.data.data;
      if (response) {
        carecontext_reqbody.patient.push({
          display: "OPConsultation Record Linked",
          careContexts: [
            {
              display: "OPConsultation document " + formattedDate,
              doc_key: op_key,
            },
          ],

          hiType: "OPConsultation",
          count: 1,
        });
      }

      for (const a of opConsultation.entry) {
        if (a.fullUrl == `urn:uuid:${treatHisID}`) {
          if (!getPastTreatHis) {
            const index = opConsultation.entry.indexOf(a);
            opConsultation.entry.splice(index, 1);
          }
        }
        if (a.fullUrl == `urn:uuid:${followupId}`) {
          if (!followupDetails) {
            const index = opConsultation.entry.indexOf(a);
            opConsultation.entry.splice(index, 1);
          }
        }
      }

      if (!getPreviewData.details.clinical_notes.chiefComplaintsBasic) {
        delete opConsultation.entry[0].resource.section[0];
      }
      if (!getPastTreatHis) {
        delete opConsultation.entry[0].resource.section[1];
      }
      if (!followupDetails) {
        delete opConsultation.entry[0].resource.section[2];
      }

      if (getPreviewData.details.prescription.length > 0) {
        let CompositionID1 = uuidv4();
        let EncounterID1 = uuidv4();
        let PatientID1 = uuidv4();
        let PractitionerID1 = uuidv4();
        let OrgtID1 = uuidv4();

        let PrescriptionIDs1 = [];
        if (medicationVal.length > 0) {
           medicationVal.forEach((ele: any) => {
            PrescriptionIDs1.push(uuidv4());
          });
        }
        let prescriptionBundle = {
          resourceType: "Bundle",
          id: uuidv4(),
          identifier: {
            system: "http://hip.in",
            value: uuidv4(),
          },
          type: "document",
          timestamp: CurrDate,
          entry: [
            {
              fullUrl: `urn:uuid:${CompositionID1}`,
              resource: {
                resourceType: "Composition",
                id: `${CompositionID1}`,
                meta: {
                  versionId: "1",
                  lastUpdated: CurrDate,
                  profile: [
                    "https://nrces.in/ndhm/fhir/r4/StructureDefinition/PrescriptionRecord",
                  ],
                },
                language: "en-IN",
                identifier: {
                  system: "https://ndhm.in/phr",
                  value: uuidv4(),
                },
                status: "final",
                type: {
                  coding: [
                    {
                      system: "http://snomed.info/sct",
                      code: "18629005",
                      display: "Prescription",
                    },
                  ],
                  text: "Prescription",
                },
                encounter: {
                  reference: `urn:uuid:${EncounterID1}`,
                },
                subject: {
                  reference: `urn:uuid:${PatientID1}`,
                  display: patientDetails.patientName,
                },
                date: CurrDate,
                author: [
                  {
                    reference: `urn:uuid:${PractitionerID1}`,
                    display: doctorDetails.doctorName,
                  },
                ],
                title: "Consultation Report",
                custodian: {
                  reference: `urn:uuid:${OrgtID1}`,
                  display: getHosDetails.hospital_name,
                },
                section: [
                  {
                    title: "Medications",
                    code: {
                      coding: [
                        {
                          system: "http://snomed.info/sct",
                          code: "721912009",
                          display: "Medication summary document",
                        },
                      ],
                    },
                    entry: [
                      ...PrescriptionIDs1.map((ele, i) => ({
                        reference: `urn:uuid:${ele}`, // Example: Adjust key as per structure of `ele`
                        type: "MedicationRequest",
                      })),
                      // {
                      // reference:
                      // 'urn:uuid:bceda2f2-484f-45f3-8bf1-f8bcd7631f50`,
                      // display: 'MedicationRequest',
                      // },
                    ],
                  },
                ],
              },
            },
            {
              fullUrl: `urn:uuid:${PractitionerID1}`,
              resource: {
                resourceType: "Practitioner",
                id: PractitionerID1,
                meta: {
                  versionId: "1",
                  lastUpdated: CurrDate,
                  profile: [
                    "https://nrces.in/ndhm/fhir/r4/StructureDefinition/Practitioner",
                  ],
                },
                identifier: [
                  {
                    type: {
                      coding: [
                        {
                          system:
                            "http://terminology.hl7.org/CodeSystem/v2-0203",
                          code: "MD",
                          display: "Medical License number",
                        },
                      ],
                    },
                    system: "https://doctor.ndhm.gov.in",
                    value: "21-1521-3828-3227",
                  },
                ],
                name: [
                  {
                    text: doctorDetails.doctorName,
                  },
                ],
              },
            },
            {
              fullUrl: `urn:uuid:${OrgtID1}`,
              resource: {
                resourceType: "Organization",
                id: OrgtID1,
                meta: {
                  profile: [
                    "https://nrces.in/ndhm/fhir/r4/StructureDefinition/Organization",
                  ],
                },
                identifier: [
                  {
                    type: {
                      coding: [
                        {
                          system:
                            "http://terminology.hl7.org/CodeSystem/v2-0203",
                          code: "PRN",
                          display: "Provider number",
                        },
                      ],
                    },
                    system: "https://facility.ndhm.gov.in",
                    value: "4567823",
                  },
                ],
                name: getHosDetails.hospital_name,
                telecom: [
                  {
                    system: "phone",
                    value: Number(getHosDetails.contact_no),
                    use: "work",
                  },
                  {
                    system: "email",
                    value: getHosDetails.email,
                    use: "work",
                  },
                ],
              },
            },
            {
              fullUrl: `urn:uuid:${PatientID1}`,
              resource: {
                resourceType: "Patient",
                id: PatientID1,
                meta: {
                  versionId: "1",
                  lastUpdated: "2020-07-09T14:58:58.181+05:30",
                  profile: [
                    "https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient",
                  ],
                },
                identifier: [
                  {
                    type: {
                      coding: [
                        {
                          system:
                            "http://terminology.hl7.org/CodeSystem/v2-0203",
                          code: "MR",
                          display: "Medical record number",
                        },
                      ],
                    },
                    system: "https://healthid.ndhm.gov.in",
                    value: "22-7225-4829-5255",
                  },
                ],
                name: [
                  {
                    text: patientDetails.patientName,
                  },
                ],
                telecom: [
                  {
                    system: "phone",
                    value: patientDetails.mobileno,
                    use: "home",
                  },
                ],
                gender: patientDetails?.gender.toLocaleLowerCase(),
                birthDate: patientDetails?.bundleDate,
              },
            },
            {
              fullUrl: `urn:uuid:${EncounterID1}`,
              resource: {
                resourceType: "Encounter",
                id: `${PatientID1}`,
                status: "finished",
                class: {
                  system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                  code: "AMB",
                  display: "OPD Visit",
                },
                subject: {
                  reference: `urn:uuid:${PatientID1}`,
                },
                period: {
                  start: CurrDate,
                },
              },
            },
            ...medicationVal.map((medicine: any, i: any) => ({
              fullUrl: `urn:uuid:${PrescriptionIDs1[i]}`,
              resource: {
                resourceType: "MedicationRequest",
                id: PrescriptionIDs[i],
                meta: {
                  profile: [
                    "https://nrces.in/ndhm/fhir/r4/StructureDefinition/MedicationRequest",
                  ],
                },
                status: "active",
                intent: "order",
                medicationCodeableConcept: {
                  coding: [
                    {
                      system: "http://snomed.info/sct",
                      code: "1145423002",
                      display: medicine?.medicine_name,
                    },
                  ],
                  text: medicine?.medicine_name,
                },
                subject: {
                  reference: `urn:uuid:${PatientID1}`,
                  display: patientDetails?.patientName,
                },
                authoredOn: "2020-07-09",
                requester: {
                  reference: `urn:uuid:${PractitionerID1}`,
                  display: doctorDetails?.doctorName,
                },
                reasonCode: [
                  {
                    coding: [
                      {
                        system: "http://snomed.info/sct",
                        code: "789400009",
                        display: medicine?.dosage || "Feaver",
                      },
                    ],
                  },
                ],

                dosageInstruction: [
                  {
                    text: medicine?.remarks,
                    additionalInstruction: [
                      {
                        coding: [
                          {
                            system: "http://snomed.info/sct",
                            code: "311504000",
                            display: "With or after food",
                          },
                        ],
                      },
                    ],
                    timing: {
                      repeat: {
                        frequency: 1,
                        period: 1,
                        periodUnit: "d",
                      },
                    },
                    route: {
                      coding: [
                        {
                          system: "http://snomed.info/sct",
                          code: "26643006",
                          display: "Oral Route",
                        },
                      ],
                    },
                    method: {
                      coding: [
                        {
                          system: "http://snomed.info/sct",
                          code: "421521009",
                          display: "Swallow",
                        },
                      ],
                    },
                  },
                ],
              },
            })),
          ],
        };

        const uploadPrescBody =  {
          value:  prescriptionBundle,
        };

        const response2 = await axios.post(
          "https://abha-api.plenome.com/file_upload",
          uploadPrescBody
        );

        let pres_key = response2.data.data;
        if (response2) {
          carecontext_reqbody.patient.push({
            display: "Prescription Record Linked",
            careContexts: [
              {
                display: "Prescription document " + formattedDate,
                doc_key: pres_key,
              },
            ],

            hiType: "Prescription",
            count: 1,
          });
        }


      }

      const [getHosHipId] = await this.connection.query(
        `select hip_id from hospitals where plenome_id = ?`,
        [hospital_id]
      );


      // -----------------------------------
      const immunizationBundle = {
        resourceType: "Bundle",
        id: uuidv4(),
        meta: {
          versionId: "1",
          lastUpdated: CurrDate,
          profile: [
            "https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle",
          ],
          security: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/v3-Confidentiality",
              code: "V",
              display: "very restricted",
            },
          ],
        },
        identifier: {
          system: "http://hip.in",
          value: "305fecc2-4ba2-46cc-9ccd-efa755aff51e",
        },
        type: "document",
        timestamp: CurrDate,
        entry: [
          {
            fullUrl: `urn:uuid:${CompositionID}`,
            resource: {
              resourceType: "Composition",
              id: CompositionID,
              language: "en-IN",
              identifier: {
                system: "https://ndhm.in/phr",
                value: "645bb0c3-ff7e-4123-bef5-3852a4784813",
              },
              status: "final",
              type: {
                text: "Immunization Record",
              },
              encounter: {
                reference: `urn:uuid:${EncounterID}`,
              },
              subject: {
                reference: `urn:uuid:${PatientID}`,
                display: patientDetails.patientName,
              },
              date: CurrDate,
              author: [
                {
                  reference: `urn:uuid:${PractitionerID}`,
                  display: `Dr. ${doctorDetails.doctorName}`,
                },
              ],
              title: "Immunization Record",

            },
          },
          {
            fullUrl: `urn:uuid:${PractitionerID}`,
            resource: {
              resourceType: "Practitioner",
              id: `${PractitionerID}`,
              identifier: [
                {
                  type: {
                    coding: [
                      {
                        system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                        code: "MD",
                        display: "Medical License number",
                      },
                    ],
                  },
                  system: "https://doctor.ndhm.gov.in",
                  value: "21-1521-3828-3227",
                },
              ],
              name: [
                {
                  text: `Dr. ${doctorDetails.doctorName}`,
                },
              ],
            },
          },
          {
            fullUrl: `urn:uuid:${PatientID}`,
            resource: {
              resourceType: "Patient",
              id: `${PatientID}`,
              identifier: [
                {
                  type: {
                    coding: [
                      {
                        system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                        code: "MR",
                        display: "Medical record number",
                      },
                    ],
                  },
                  system: "https://healthid.ndhm.gov.in",
                  value: "22-7225-4829-5255",
                },
              ],
              name: [
                {
                  text: patientDetails.patientName,
                },
              ],
              telecom: [
                {
                  system: "phone",
                  value: Number(patientDetails.mobileno),
                  use: "home",
                },
              ],
              gender: patientDetails.gender.toLocaleLowerCase(),
              birthDate: patientDetails.bundleDate,
            },
          },
          {
            fullUrl: `urn:uuid:${EncounterID}`,
            resource: {
              resourceType: "Encounter",
              id: `${PatientID}`,
              status: "finished",
              class: {
                system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                code: "AMB",
                display: "OPD Visit",
              },
              subject: {
                reference: `urn:uuid:${PatientID}`,
              },
              period: {
                start: CurrDate,
              },
            },
          },
          {
            fullUrl: `urn:uuid:${OrgtID}`,
            resource: {
              resourceType: "Organization",
              id: `${OrgtID}`,
              identifier: [
                {
                  type: {
                    coding: [
                      {
                        system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                        code: "PRN",
                        display: "Provider number",
                      },
                    ],
                  },
                  system: "https://facility.ndhm.gov.in",
                  value: "4567823",
                },
              ],
              name: getHosDetails.hospital_name,
              telecom: [
                {
                  system: "phone",
                  value: getHosDetails.contact_no,
                  use: "work",
                },
                {
                  system: "email",
                  value: getHosDetails.email,
                  use: "work",
                },
              ],
            },
          },
        ],
      };
      const uploadImmunizationBody =  {
        value: immunizationBundle,
      };
      const ImmunizeKey = await axios.post(
        "https://abha-api.plenome.com/file_upload",
        uploadImmunizationBody
      );
       carecontext_reqbody.patient.push({
        display: "Immunization Record Linked",
        careContexts: [
          {
            display: "Immunization document" + formattedDate,
            doc_key: ImmunizeKey.data.data,
          },
        ],
        hiType: "ImmunizationRecord",
        count: 1,
      });
      // -----------------------------
      const invoiceBundle = {
        resourceType: "Bundle",
        id: uuidv4(),
        meta: {
          versionId: "1",
          lastUpdated: CurrDate,
          profile: [
            "https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle",
          ],
          security: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/v3-Confidentiality",
              code: "V",
              display: "very restricted",
            },
          ],
        },
        identifier: {
          system: "http://hip.in",
          value: "305fecc2-4ba2-46cc-9ccd-efa755aff51f",
        },
        type: "document",
        timestamp: CurrDate,
        entry: [
          {
            fullUrl: `urn:uuid:${CompositionID}`,
            resource: {
              resourceType: "Composition",
              id: CompositionID,

              language: "en-IN",

              identifier: {
                system: "https://ndhm.in/phr",
                value: "645bb0c3-ff7e-4123-bef5-3852a4784813",
              },
              status: "final",
              type: {
                text: "invoice Record",
              },
              encounter: {
                reference: `urn:uuid:${EncounterID}`,
              },
              subject: {
                reference: `urn:uuid:${PatientID}`,
                display: patientDetails.patientName,
              },
              date: CurrDate,
              author: [
                {
                  reference: `urn:uuid:${PractitionerID}`,
                  display: `Dr. ${doctorDetails.doctorName}`,
                },
              ],
              title: "invoice Record",

            },
          },
          {
            fullUrl: `urn:uuid:${PractitionerID}`,
            resource: {
              resourceType: "Practitioner",
              id: `${PractitionerID}`,

              identifier: [
                {
                  type: {
                    coding: [
                      {
                        system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                        code: "MD",
                        display: "Medical License number",
                      },
                    ],
                  },
                  system: "https://doctor.ndhm.gov.in",
                  value: "21-1521-3828-3227",
                },
              ],
              name: [
                {
                  text: `Dr. ${doctorDetails.doctorName}`,
                },
              ],
            },
          },
          {
            fullUrl: `urn:uuid:${PatientID}`,
            resource: {
              resourceType: "Patient",
              id: `${PatientID}`,

              identifier: [
                {
                  type: {
                    coding: [
                      {
                        system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                        code: "MR",
                        display: "Medical record number",
                      },
                    ],
                  },
                  system: "https://healthid.ndhm.gov.in",
                  value: "22-7225-4829-5255",
                },
              ],
              name: [
                {
                  text: patientDetails.patientName,
                },
              ],
              telecom: [
                {
                  system: "phone",
                  value: Number(patientDetails.mobileno),
                  use: "home",
                },
              ],
              gender: patientDetails.gender.toLocaleLowerCase(),
              birthDate: patientDetails.bundleDate,
            },
          },
          {
            fullUrl: `urn:uuid:${EncounterID}`,
            resource: {
              resourceType: "Encounter",
              id: `${PatientID}`,
              status: "finished",
              class: {
                system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                code: "AMB",
                display: "OPD Visit",
              },
              subject: {
                reference: `urn:uuid:${PatientID}`,
              },
              period: {
                start: CurrDate,
              },
            },
          },
          {
            fullUrl: `urn:uuid:${OrgtID}`,
            resource: {
              resourceType: "Organization",
              id: `${OrgtID}`,

              identifier: [
                {
                  type: {
                    coding: [
                      {
                        system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                        code: "PRN",
                        display: "Provider number",
                      },
                    ],
                  },
                  system: "https://facility.ndhm.gov.in",
                  value: "4567823",
                },
              ],
              name: getHosDetails.hospital_name,
              telecom: [
                {
                  system: "phone",
                  value: getHosDetails.contact_no,
                  use: "work",
                },
                {
                  system: "email",
                  value: getHosDetails.email,
                  use: "work",
                },
              ],
            },
          },
        ],
      };
      const uploadinvoiceBody =  {
        value: invoiceBundle,
      };

      const invoiceKey = await axios.post(
        "https://abha-api.plenome.com/file_upload",
        uploadinvoiceBody
      );

       carecontext_reqbody.patient.push({
        display: "invoice Record Linked",
        careContexts: [
          {
            display: "invoice document" + formattedDate,
            doc_key: invoiceKey.data.data,
          },
        ],

        hiType: "Invoice",
        count: 1,
      });
      //-----------------------------------------------
      const discharge_summaryBundle = {
        resourceType: "Bundle",
        id: uuidv4(),
        meta: {
          versionId: "1",
          lastUpdated: CurrDate,
          profile: [
            "https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle",
          ],
          security: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/v3-Confidentiality",
              code: "V",
              display: "very restricted",
            },
          ],
        },
        identifier: {
          system: "http://hip.in",
          value: "305fecc2-4ba2-46cc-9ccd-efa755aff51g",
        },
        type: "document",
        timestamp: CurrDate,
        entry: [
          {
            fullUrl: `urn:uuid:${CompositionID}`,
            resource: {
              resourceType: "Composition",
              id: CompositionID,

              language: "en-IN",

              identifier: {
                system: "https://ndhm.in/phr",
                value: "645bb0c3-ff7e-4123-bef5-3852a4784813",
              },
              status: "final",
              type: {
                text: "discharge summary Record",
              },
              encounter: {
                reference: `urn:uuid:${EncounterID}`,
              },
              subject: {
                reference: `urn:uuid:${PatientID}`,
                display: patientDetails.patientName,
              },
              date: CurrDate,
              author: [
                {
                  reference: `urn:uuid:${PractitionerID}`,
                  display: `Dr. ${doctorDetails.doctorName}`,
                },
              ],
              title: "discharge summary Record",

            },
          },
          {
            fullUrl: `urn:uuid:${PractitionerID}`,
            resource: {
              resourceType: "Practitioner",
              id: `${PractitionerID}`,

              identifier: [
                {
                  type: {
                    coding: [
                      {
                        system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                        code: "MD",
                        display: "Medical License number",
                      },
                    ],
                  },
                  system: "https://doctor.ndhm.gov.in",
                  value: "21-1521-3828-3227",
                },
              ],
              name: [
                {
                  text: `Dr. ${doctorDetails.doctorName}`,
                },
              ],
            },
          },
          {
            fullUrl: `urn:uuid:${PatientID}`,
            resource: {
              resourceType: "Patient",
              id: `${PatientID}`,

              identifier: [
                {
                  type: {
                    coding: [
                      {
                        system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                        code: "MR",
                        display: "Medical record number",
                      },
                    ],
                  },
                  system: "https://healthid.ndhm.gov.in",
                  value: "22-7225-4829-5255",
                },
              ],
              name: [
                {
                  text: patientDetails.patientName,
                },
              ],
              telecom: [
                {
                  system: "phone",
                  value: Number(patientDetails.mobileno),
                  use: "home",
                },
              ],
              gender: patientDetails.gender.toLocaleLowerCase(),
              birthDate: patientDetails.bundleDate,
            },
          },
          {
            fullUrl: `urn:uuid:${EncounterID}`,
            resource: {
              resourceType: "Encounter",
              id: `${PatientID}`,
              status: "finished",
              class: {
                system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                code: "AMB",
                display: "OPD Visit",
              },
              subject: {
                reference: `urn:uuid:${PatientID}`,
              },
              period: {
                start: CurrDate,
              },
            },
          },
          {
            fullUrl: `urn:uuid:${OrgtID}`,
            resource: {
              resourceType: "Organization",
              id: `${OrgtID}`,

              identifier: [
                {
                  type: {
                    coding: [
                      {
                        system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                        code: "PRN",
                        display: "Provider number",
                      },
                    ],
                  },
                  system: "https://facility.ndhm.gov.in",
                  value: "4567823",
                },
              ],
              name: getHosDetails.hospital_name,
              telecom: [
                {
                  system: "phone",
                  value: getHosDetails.contact_no,
                  use: "work",
                },
                {
                  system: "email",
                  value: getHosDetails.email,
                  use: "work",
                },
              ],
            },
          },
        ],
      };
      const uploaddischarge_summaryBody =  {
        value: discharge_summaryBundle,
      };

      const summaryKey = await axios.post(
        "https://abha-api.plenome.com/file_upload",
        uploaddischarge_summaryBody
      );

       carecontext_reqbody.patient.push({
        display: "discharge summary Record Linked",
        careContexts: [
          {
            display: "discharge summary document" + formattedDate,
            doc_key: summaryKey.data.data,
          },
        ],

        hiType: "DischargeSummary",
        count: 1,
      });
      // ----------------------------------------------------------------

      // ----------------------------------------------------------------
      const diagnosticBundle = {
        resourceType: "Bundle",
        id: uuidv4(),
        meta: {
          versionId: "1",
          lastUpdated: CurrDate,
          profile: [
            "https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle",
          ],
          security: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/v3-Confidentiality",
              code: "V",
              display: "very restricted",
            },
          ],
        },
        identifier: {
          system: "http://hip.in",
          value: "305fecc2-4ba2-46cc-9ccd-efa755aff51f",
        },
        type: "document",
        timestamp: CurrDate,
        entry: [
          {
            fullUrl: `urn:uuid:${CompositionID}`,
            resource: {
              resourceType: "Composition",
              id: CompositionID,

              language: "en-IN",

              identifier: {
                system: "https://ndhm.in/phr",
                value: "645bb0c3-ff7e-4123-bef5-3852a4784813",
              },
              status: "final",
              type: {
                text: "Diagnostic Report Record",
              },
              encounter: {
                reference: `urn:uuid:${EncounterID}`,
              },
              subject: {
                reference: `urn:uuid:${PatientID}`,
                display: patientDetails.patientName,
              },
              date: CurrDate,
              author: [
                {
                  reference: `urn:uuid:${PractitionerID}`,
                  display: `Dr. ${doctorDetails.doctorName}`,
                },
              ],
              title: "diagnostic Record",

            },
          },
          {
            fullUrl: `urn:uuid:${PractitionerID}`,
            resource: {
              resourceType: "Practitioner",
              id: `${PractitionerID}`,

              identifier: [
                {
                  type: {
                    coding: [
                      {
                        system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                        code: "MD",
                        display: "Medical License number",
                      },
                    ],
                  },
                  system: "https://doctor.ndhm.gov.in",
                  value: "21-1521-3828-3227",
                },
              ],
              name: [
                {
                  text: `Dr. ${doctorDetails.doctorName}`,
                },
              ],
            },
          },
          {
            fullUrl: `urn:uuid:${PatientID}`,
            resource: {
              resourceType: "Patient",
              id: `${PatientID}`,

              identifier: [
                {
                  type: {
                    coding: [
                      {
                        system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                        code: "MR",
                        display: "Medical record number",
                      },
                    ],
                  },
                  system: "https://healthid.ndhm.gov.in",
                  value: "22-7225-4829-5255",
                },
              ],
              name: [
                {
                  text: patientDetails.patientName,
                },
              ],
              telecom: [
                {
                  system: "phone",
                  value: Number(patientDetails.mobileno),
                  use: "home",
                },
              ],
              gender: patientDetails.gender.toLocaleLowerCase(),
              birthDate: patientDetails.bundleDate,
            },
          },
          {
            fullUrl: `urn:uuid:${EncounterID}`,
            resource: {
              resourceType: "Encounter",
              id: `${PatientID}`,
              status: "finished",
              class: {
                system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                code: "AMB",
                display: "OPD Visit",
              },
              subject: {
                reference: `urn:uuid:${PatientID}`,
              },
              period: {
                start: CurrDate,
              },
            },
          },
          {
            fullUrl: `urn:uuid:${OrgtID}`,
            resource: {
              resourceType: "Organization",
              id: `${OrgtID}`,

              identifier: [
                {
                  type: {
                    coding: [
                      {
                        system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                        code: "PRN",
                        display: "Provider number",
                      },
                    ],
                  },
                  system: "https://facility.ndhm.gov.in",
                  value: "4567823",
                },
              ],
              name: getHosDetails.hospital_name,
              telecom: [
                {
                  system: "phone",
                  value: getHosDetails.contact_no,
                  use: "work",
                },
                {
                  system: "email",
                  value: getHosDetails.email,
                  use: "work",
                },
              ],
            },
          },
        ],
      };
      const uploaddiagnosticBody =  {
        value: diagnosticBundle,
      };

      const DiagnosticKey = await axios.post(
        "https://abha-api.plenome.com/file_upload",
        uploaddiagnosticBody
      );

       carecontext_reqbody.patient.push({
        display: "diagnostic Record Linked",
        careContexts: [
          {
            display: "diagnostic document" + formattedDate,
            doc_key: DiagnosticKey.data.data,
          },
        ],

        hiType: "DiagnosticReport",
        count: 1,
      });
      // -----------------------------------------------------------------------

      const health_documentBundle = {
        resourceType: "Bundle",
        id: uuidv4(),
        meta: {
          versionId: "1",
          lastUpdated: CurrDate,
          profile: [
            "https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle",
          ],
          security: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/v3-Confidentiality",
              code: "V",
              display: "very restricted",
            },
          ],
        },
        identifier: {
          system: "http://hip.in",
          value: "305fecc2-4ba2-46cc-9ccd-efa755aff51f",
        },
        type: "document",
        timestamp: CurrDate,
        entry: [
          {
            fullUrl: `urn:uuid:${CompositionID}`,
            resource: {
              resourceType: "Composition",
              id: CompositionID,

              language: "en-IN",

              identifier: {
                system: "https://ndhm.in/phr",
                value: "645bb0c3-ff7e-4123-bef5-3852a4784813",
              },
              status: "final",
              type: {
                text: "Health Document Record",
              },
              encounter: {
                reference: `urn:uuid:${EncounterID}`,
              },
              subject: {
                reference: `urn:uuid:${PatientID}`,
                display: patientDetails.patientName,
              },
              section: [

                {
                  title: "Document Reference",
                  code: {
                    coding: [
                      {
                        system: "http://snomed.info/sct",
                        code: "371530004",
                        display: "Clinical consultation report",
                      },
                    ],
                  },
                  entry: [
                    {
                      reference: `urn:uuid:${docRefId}`,
                      display: "DocumentReference",
                    },
                  ],
                },
              ],
              date: CurrDate,
              author: [
                {
                  reference: `urn:uuid:${PractitionerID}`,
                  display: `Dr. ${doctorDetails.doctorName}`,
                },
              ],
              title: "Health Document Record",

            },
          },
          {
            fullUrl: `urn:uuid:${PractitionerID}`,
            resource: {
              resourceType: "Practitioner",
              id: `${PractitionerID}`,

              identifier: [
                {
                  type: {
                    coding: [
                      {
                        system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                        code: "MD",
                        display: "Medical License number",
                      },
                    ],
                  },
                  system: "https://doctor.ndhm.gov.in",
                  value: "21-1521-3828-3227",
                },
              ],
              name: [
                {
                  text: `Dr. ${doctorDetails.doctorName}`,
                },
              ],
            },
          },
          {
            fullUrl: `urn:uuid:${PatientID}`,
            resource: {
              resourceType: "Patient",
              id: `${PatientID}`,

              identifier: [
                {
                  type: {
                    coding: [
                      {
                        system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                        code: "MR",
                        display: "Medical record number",
                      },
                    ],
                  },
                  system: "https://healthid.ndhm.gov.in",
                  value: "22-7225-4829-5255",
                },
              ],
              name: [
                {
                  text: patientDetails.patientName,
                },
              ],
              telecom: [
                {
                  system: "phone",
                  value: Number(patientDetails.mobileno),
                  use: "home",
                },
              ],
              gender: patientDetails.gender.toLocaleLowerCase(),
              birthDate: patientDetails.bundleDate,
            },
          },
          {
            fullUrl: `urn:uuid:${EncounterID}`,
            resource: {
              resourceType: "Encounter",
              id: `${PatientID}`,
              status: "finished",
              class: {
                system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                code: "AMB",
                display: "OPD Visit",
              },
              subject: {
                reference: `urn:uuid:${PatientID}`,
              },
              period: {
                start: CurrDate,
              },
            },
          },
          {
            fullUrl: `urn:uuid:${OrgtID}`,
            resource: {
              resourceType: "Organization",
              id: `${OrgtID}`,

              identifier: [
                {
                  type: {
                    coding: [
                      {
                        system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                        code: "PRN",
                        display: "Provider number",
                      },
                    ],
                  },
                  system: "https://facility.ndhm.gov.in",
                  value: "4567823",
                },
              ],
              name: getHosDetails.hospital_name,
              telecom: [
                {
                  system: "phone",
                  value: getHosDetails.contact_no,
                  use: "work",
                },
                {
                  system: "email",
                  value: getHosDetails.email,
                  use: "work",
                },
              ],
            },
          },
          {
            fullUrl: `urn:uuid:${docRefId}`,
            resource: {
              resourceType: "DocumentReference",
              id: "44486a09-bcad-420b-ba14-b769fafb7f84",
              meta: {
                profile: [
                  "https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentReference",
                ],
              },
              status: "current",
              docStatus: "final",
              type: {
                coding: [
                  {
                    system: "http://snomed.info/sct",
                    code: "4241000179101",
                    display: "Laboratory report",
                  },
                ],
                text: "Laboratory report",
              },
              subject: {
                reference: `urn:uuid:${PatientID}`,
                display: "Patient",
              },
              content: [
                {
                  attachment: {
                    contentType: "application/pdf",
                    language: "en-IN",
                    data: docs,
                    title: "Laboratory report",
                    creation: "2019-05-29T14:58:58.181+05:30",
                  },
                },
              ],
            },
          },
        ],
      };
      const uploadhealth_documentBody =  {
        value: health_documentBundle,
      };

      const healthDocKey = await axios.post(
        "https://abha-api.plenome.com/file_upload",
        uploadhealth_documentBody
      );

       carecontext_reqbody.patient.push({
        display: "health_document Record Linked",
        careContexts: [
          {
            display: "health_document document" + formattedDate,
            doc_key: healthDocKey.data.data,
          },
        ],

        hiType: "HealthDocumentRecord",
        count: 1,
      });

      

      if (abhaAddress && abhaAddress.trim() != "" && abhaAddress.toLocaleLowerCase() != "null") {


        if (getPatientID.patient_id == checkPatientAbhaAddress.patient_id) {
          const PatientDetails = await getPreviewData.details.patient_details;

          if (checkPatientAbhaAddress.link_token_updated_date && checkPatientAbhaAddress.linkToken) {
            const givenDate = new Date(
              checkPatientAbhaAddress.link_token_updated_date
            ); // Replace with your date
            const currentDate = new Date();

            // Set time to 00:00:00 for both dates to avoid time issues
            currentDate.setHours(0, 0, 0, 0);
            givenDate.setHours(0, 0, 0, 0);

            // Calculate the difference in months
            const monthDifference =
              (currentDate.getFullYear() - givenDate.getFullYear()) * 12 +
              currentDate.getMonth() -
              givenDate.getMonth();

            if (monthDifference > 5) {


              const getPatnameBody = {
                abhaAddress: abhaAddress,
              };

              const getname = await axios.post(
                "https://abha-api.plenome.com/m1-abha-address-verification",
                getPatnameBody
              );

              const PatName = await getname.data.fullName;
              let patGender;
              if (
                PatientDetails.gender.toLocaleLowerCase() == "male" ||
                PatientDetails.gender.toLocaleLowerCase() == "m"
              ) {
                patGender = "M";
              } else if (
                PatientDetails.gender.toLocaleLowerCase() == "female" ||
                PatientDetails.gender.toLocaleLowerCase() == "f"
              ) {
                patGender = "F";
              } else {
                patGender = "O";
              }



              const getLinkTokenBody =  {
                name: await PatName,
                gender: await patGender,
                yearOfBirth: await yob,
                abhaAddress:  abhaAddress,
              };
              const headers =  {
                "X-HIP-ID": await getHosHipId.hip_id,
                "Content-Type": "application/json",
              };
              console.log("getLinkTokenBody",getLinkTokenBody);
              
              const getLinkToken = await axios.post(
                "https://abha-api.plenome.com/hiecm/api/v3/generate-token",
                getLinkTokenBody,
                { headers }
              );

               this.updateLinkToken(
                hospital_id,
                getLinkToken.data[0].response[0].payload.linkToken,
                abhaAddress
              );
            }
          } else {


            const getPatnameBody = {
              abhaAddress: abhaAddress,
            };

            const getname = await axios.post(
              "https://abha-api.plenome.com/m1-abha-address-verification",
              getPatnameBody
            );


            const PatName = await getname.data.fullName;
            let patGender;
            if (
              PatientDetails.gender.toLocaleLowerCase() == "male" ||
              PatientDetails.gender.toLocaleLowerCase() == "m"
            ) {
              patGender = "M";
            } else if (
              PatientDetails.gender.toLocaleLowerCase() == "female" ||
              PatientDetails.gender.toLocaleLowerCase() == "f"
            ) {
              patGender = "F";
            } else {
              patGender = "O";
            }

            const [getHosHipId] = await this.connection.query(
              `select hip_id from hospitals where plenome_id = ?`,
              [hospital_id]
            );


            const getLinkTokenBody =  {
              name: await PatName,
              gender: await patGender,
              yearOfBirth: await yob,
              abhaAddress:  abhaAddress,
            };


            const headers =  {
              "X-HIP-ID": await getHosHipId.hip_id,
              "Content-Type": "application/json",
            };
            const getLinkToken = await axios.post(
              "https://abha-api.plenome.com/hiecm/api/v3/generate-token",
              getLinkTokenBody,
              { headers }
            );
console.log("asdffffffffdsaasdf");

            await this.updateLinkToken(
              hospital_id,
              getLinkToken.data[0].response[0].payload.linkToken,
              abhaAddress
            );
          }
          const existing_link_token: any = await this.getexistingLinkToken(hospital_id, abhaAddress

          )


          console.log(1,existing_link_token.linkToken,"existing_link_token.linkToken");

          if (existing_link_token.linkToken) {
            console.log(existing_link_token.linkToken,"existing_link_token.linkToken");
            
            const cc_headers =  {
              "X-LINK-TOKEN": await existing_link_token.linkToken,
              "X-HIP-ID": await getHosHipId.hip_id,
              "Content-Type": "application/json",
            };
             await axios.post(
              "https://abha-api.plenome.com/link/carecontext",
              carecontext_reqbody,
              { headers: cc_headers }
            );

          }


        }
      }
      else {
        const cc_headers =  {
          "X-LINK-TOKEN": "Temp_linktoken",
          "X-HIP-ID": await getHosHipId.hip_id,
          "Content-Type": "application/json",
        };
        console.log(cc_headers,"cc_headers");
        try {
          console.log("carecontext_reqbody",carecontext_reqbody);
          
          await axios.post(
            "https://abha-api.plenome.com/link/carecontext",
            carecontext_reqbody,
            { headers: cc_headers }
          );
        } catch (error) {
          console.log(error,"error1111");
          
        }
        //  await axios.post(
        //   "https://abha-api.plenome.com/link/carecontext",
        //   carecontext_reqbody,
        //   { headers: cc_headers }
        // );

      }
    }
  }
  async updateLinkToken(
    hospital_id: number,
    token: string,
    abhaAddress: string
  ) {
    try {
      await this.dynamicConnection.query(
        `update patient_abha_address set linkToken = ?,
            link_token_updated_date = date(now()) where abhaAddress = ?`,
        [ token, abhaAddress]
      );
    } catch (error) {
      console.log(error);
    }
  }

  async getexistingLinkToken(
    hospital_id: number,
    abhaAddress: string
  ) {
    try {
      const [existing_link_token] = await this.dynamicConnection.query(
        `select linkToken from patient_abha_address where abhaAddress = ?`,
        [abhaAddress]
      );
      return existing_link_token
    } catch (error) {
      console.log(error);
    }
  }

  async findAll(value: string) {
    try {
      const s3 = new S3({
        credentials: {
          accessKeyId: awsConfig.accessKeyId,
          secretAccessKey: awsConfig.secretAccessKey,
        },
        region: awsConfig.region,
      });

      const command = new GetObjectCommand({
        Bucket: awsConfig.bucketName,
        Key: value,
      });

      const s3Data = await s3.send(command);


      const buffer =  Buffer.from(
        await s3Data.Body.transformToByteArray()
      );
      return buffer.toString("base64");
    } catch (error) {
      console.error(error);
      return error;
    }
  }

}
