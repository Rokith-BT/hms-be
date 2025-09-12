import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AmbulanceCall } from './entities/ambulance_call.entity';

@Injectable()
export class AmbulanceCallService {


  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly  dynamicConnection: DataSource,
  ) { }


  async create(createAmbulanceCall: AmbulanceCall) {

    try {
      const [patientId] = await this.connection.query('SELECT aayush_unique_id FROM patients WHERE id = ?', [createAmbulanceCall.patient_id]);
      if (!patientId || patientId.length === 0) {
        throw new Error(` with id: ${createAmbulanceCall.patient_id} not found.`);
      }

      const email = patientId.aayush_unique_id;


      const [staffId] = await this.connection.query('SELECT email FROM staff WHERE id = ?', [createAmbulanceCall.generated_by]);
      if (!staffId || staffId.length === 0) {
        throw new Error(`Staff with id: ${createAmbulanceCall.generated_by} not found.`);
      }

      const docemail = staffId.email;


      const [staffId1] = await this.connection.query('SELECT email FROM staff WHERE id = ?', [createAmbulanceCall.received_by]);
      if (!staffId1 || staffId1.length === 0) {
        throw new Error(`Staff with id: ${createAmbulanceCall.received_by} not found.`);
      }

      const docemail1 = staffId1.email;





      const addAmbulanceCall = await this.connection.query(
        `INSERT into ambulance_call(
       patient_id,
       case_reference_id,
       vehicle_id,
       driver,
       date,
       call_from,
       call_to,
       charge_category_id,
       charge_id,
       standard_charge,
       tax_percentage,
       amount,
       net_amount,
       note,
       generated_by
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          createAmbulanceCall.patient_id,
          createAmbulanceCall.case_reference_id,
          createAmbulanceCall.vehicle_id,
          createAmbulanceCall.driver,
          createAmbulanceCall.date,
          createAmbulanceCall.call_from,
          createAmbulanceCall.call_to,
          createAmbulanceCall.charge_category_id,
          createAmbulanceCall.charge_id,
          createAmbulanceCall.standard_charge,
          createAmbulanceCall.tax_percentage,
          createAmbulanceCall.amount,
          createAmbulanceCall.net_amount,
          createAmbulanceCall.note,
          createAmbulanceCall.generated_by
        ],
      )

      const addAmbulanceCallID = addAmbulanceCall.insertId;
      console.log(addAmbulanceCallID, 'addAmbulanceCallIDDDD')



      let Ambulance_transaction_id;


      const Ambulance_transaction = await this.connection.query(
        `INSERT into transactions (
         type,
         section,
         patient_id,
         case_reference_id,
         ambulance_call_id,
         payment_mode,
         amount,
         cheque_no,
         cheque_date,
         attachment,
         attachment_name,
         payment_date,
         note,
         received_by
           ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        ['payment',
          'Ambulance',
          createAmbulanceCall.patient_id,
          createAmbulanceCall.case_reference_id,
          addAmbulanceCallID,
          createAmbulanceCall.payment_mode,
          createAmbulanceCall.amount,
          createAmbulanceCall.cheque_no,
          createAmbulanceCall.cheque_date,
          createAmbulanceCall.attachment,
          createAmbulanceCall.attachment_name,
          createAmbulanceCall.payment_date,
          createAmbulanceCall.note,
          createAmbulanceCall.received_by
        ],
      );

      Ambulance_transaction_id = Ambulance_transaction.insertId;
      console.log(Ambulance_transaction_id, 'Ambulance_transaction_idddddd')



      await this.connection.query(`update ambulance_call SET
        transaction_id=?
        where id=?`,
        [Ambulance_transaction_id, addAmbulanceCallID],)



      const dynamicPatient = await this.dynamicConnection.query('SELECT id FROM patients WHERE aayush_unique_id = ?', [email]);
      console.log(dynamicPatient[0].id, "newpatid");
      const dynamicIPDPatientId = dynamicPatient[0].id;


      const dynamicUpdateStaff = await this.dynamicConnection.query('SELECT id FROM staff WHERE email = ?', [docemail]);
      console.log(dynamicUpdateStaff[0].id, "1234567890-");
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;

      const dynamicUpdateStaff1 = await this.dynamicConnection.query('SELECT id FROM staff WHERE email = ?', [docemail1]);
      const dynamicUpdateStaff1ID = dynamicUpdateStaff1[0].id;
      console.log(dynamicUpdateStaff1ID, "dynamicUpdateStaff1IDDDDD-");

      const DynAmbulanceList = await this.dynamicConnection.query('SELECT id FROM vehicles WHERE hos_vehicles_id = ? and hospital_id = ?', [createAmbulanceCall.vehicle_id, createAmbulanceCall.hospital_id]);
      const DynAmbulanceListID = DynAmbulanceList[0].id;
      console.log(DynAmbulanceListID, "DynAmbulanceListIDDDD");

      const getAdminChargeId = await this.dynamicConnection.query(`select id  from charges 
          where Hospital_id = ? and hospital_charges_id = ?`,
        [createAmbulanceCall.hospital_id,
        createAmbulanceCall.charge_id
        ])
      const getAdminChargeID = getAdminChargeId[0].id;

      const getAdminChargeCategories = await this.dynamicConnection.query(`select id  from charge_categories 
            where Hospital_id = ? and hospital_charge_categories_id = ?`,
        [createAmbulanceCall.hospital_id,
        createAmbulanceCall.charge_category_id
        ])
      const getAdminChargeCategoriesID = getAdminChargeCategories[0].id;



      let caseReferenceId;


      if (createAmbulanceCall.case_reference_id) {



        const [DynIpdOpd] = await this.dynamicConnection.query('SELECT opd_id,ipd_id FROM patient_charges WHERE charge_id=? and patient_id=?', [getAdminChargeID, dynamicIPDPatientId]);
        const DynOpd = DynIpdOpd.opd_id;
        const DynIPD = DynIpdOpd.ipd_id;
        console.log(DynOpd, "DynIPDIDDD");
        console.log(DynIPD, "IDDD");






        if (DynOpd) {

          const [opdDetails] = await this.dynamicConnection.query(
            'SELECT case_reference_id FROM opd_details WHERE id=?',
            [DynOpd]
          );
          caseReferenceId = opdDetails ? opdDetails.case_reference_id : null;

        } else if (DynIPD) {

          const [ipdDetails] = await this.dynamicConnection.query(
            'SELECT case_reference_id FROM ipd_details WHERE id=?',
            [DynIPD]
          );
          caseReferenceId = ipdDetails ? ipdDetails.case_reference_id : null;

        }

        console.log(caseReferenceId, "Case Reference ID");



      }


      const addDynAmbulanceCall = await this.dynamicConnection.query(
        `INSERT into ambulance_call(
       patient_id,
       case_reference_id,
       vehicle_id,
       driver,
       date,
       call_from,
       call_to,
       charge_category_id,
       charge_id,
       standard_charge,
       tax_percentage,
       amount,
       net_amount,
       note,
       generated_by,
       hospital_id,
       hos_ambulance_call_id
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          dynamicIPDPatientId,
          caseReferenceId,
          DynAmbulanceListID,
          createAmbulanceCall.driver,
          createAmbulanceCall.date,
          createAmbulanceCall.call_from,
          createAmbulanceCall.call_to,
          getAdminChargeCategoriesID,
          getAdminChargeID,
          createAmbulanceCall.standard_charge,
          createAmbulanceCall.tax_percentage,
          createAmbulanceCall.amount,
          createAmbulanceCall.net_amount,
          createAmbulanceCall.note,
          dynamicUPTDStaffId,
          createAmbulanceCall.hospital_id,
          addAmbulanceCallID
        ],
      )


      const addDynAmbulanceCallID = addDynAmbulanceCall.insertId;
      console.log(addDynAmbulanceCallID, 'addDynAmbulanceCallIDDDDD')





      let Dyn_Ambulance_transaction_id;


      const Dyn_Ambulance_transaction = await this.dynamicConnection.query(
        `INSERT into transactions (
         type,
         section,
         patient_id,
         case_reference_id,
         ambulance_call_id,
         payment_mode,
         amount,
         cheque_no,
         cheque_date,
         attachment,
         attachment_name,
         payment_date,
         note,
         received_by,
         Hospital_id,
         hos_transaction_id
           ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        ['payment',
          'Ambulance',
          dynamicIPDPatientId,
          caseReferenceId,
          addDynAmbulanceCallID,
          createAmbulanceCall.payment_mode,
          createAmbulanceCall.amount,
          createAmbulanceCall.cheque_no,
          createAmbulanceCall.cheque_date,
          createAmbulanceCall.attachment,
          createAmbulanceCall.attachment_name,
          createAmbulanceCall.payment_date,
          createAmbulanceCall.note,
          dynamicUpdateStaff1ID,
          createAmbulanceCall.hospital_id,
          Ambulance_transaction_id
        ],
      );

      Dyn_Ambulance_transaction_id = Dyn_Ambulance_transaction.insertId;
      console.log(Dyn_Ambulance_transaction_id, 'Dyn_Ambulance_transaction_iddddd')



      await this.dynamicConnection.query(`update ambulance_call SET
        transaction_id=?,
        hospital_id=?
        where id=?`,
        [Dyn_Ambulance_transaction_id, createAmbulanceCall.hospital_id, addDynAmbulanceCallID],)



      return [{
        "data ": {
          status: "success",
          "messege": "Ambulance call details added successfully ",
          "Ambulance_call_Values": await this.connection.query('SELECT * FROM ambulance_call WHERE id = ?', [addAmbulanceCallID])
        }
      }];


    }
    catch (error) {
      console.error('Error while posting data:', error);
    }
  }


  async updateAmbulanceCall(id: number, createAmbulanceCall: AmbulanceCall) {
    try {


      const [patientId] = await this.connection.query('SELECT aayush_unique_id FROM patients WHERE id = ?', [createAmbulanceCall.patient_id]);
      if (!patientId || patientId.length === 0) {
        throw new Error(` with id: ${createAmbulanceCall.patient_id} not found.`);
      }

      const email = patientId.aayush_unique_id;


      await this.connection.query(`update ambulance_call SET
       patient_id=?,
       case_reference_id=?,
       vehicle_id=?,
       driver=?,
       date=?,
       call_from=?,
       call_to=?,
       charge_category_id=?,
       charge_id=?,
       standard_charge=?,
       tax_percentage=?,
       amount=?,
       net_amount=?,
       note=?
       where id=?`,
        [
          createAmbulanceCall.patient_id,
          createAmbulanceCall.case_reference_id,
          createAmbulanceCall.vehicle_id,
          createAmbulanceCall.driver,
          createAmbulanceCall.date,
          createAmbulanceCall.call_from,
          createAmbulanceCall.call_to,
          createAmbulanceCall.charge_category_id,
          createAmbulanceCall.charge_id,
          createAmbulanceCall.standard_charge,
          createAmbulanceCall.tax_percentage,
          createAmbulanceCall.amount,
          createAmbulanceCall.net_amount,
          createAmbulanceCall.note,
          id
        ],
      )



      const [transaction] = await this.connection.query(`select transaction_id from ambulance_call where id=?`, [id])
      const transactionID = transaction.id;
      console.log(transactionID, "transactionIDDDD");




      await this.connection.query(`update transactions SET
         patient_id=?,
         case_reference_id=?,
         payment_mode=?,
         amount=?,
         cheque_no=?,
         cheque_date=?,
         attachment=?,
         attachment_name=?,
         payment_date=?,
         note=?
         where id=?`,
        [
          createAmbulanceCall.patient_id,
          createAmbulanceCall.case_reference_id,
          createAmbulanceCall.payment_mode,
          createAmbulanceCall.amount,
          createAmbulanceCall.cheque_no,
          createAmbulanceCall.cheque_date,
          createAmbulanceCall.attachment,
          createAmbulanceCall.attachment_name,
          createAmbulanceCall.payment_date,
          createAmbulanceCall.note,
          transactionID
        ],
      )


      const dynamicPatient = await this.dynamicConnection.query('SELECT id FROM patients WHERE aayush_unique_id = ?', [email]);
      console.log(dynamicPatient[0].id, "newpatid");
      const dynamicIPDPatientId = dynamicPatient[0].id;


      const DynAmbulanceList = await this.dynamicConnection.query('SELECT id FROM vehicles WHERE hos_vehicles_id = ? and hospital_id = ?', [createAmbulanceCall.vehicle_id, createAmbulanceCall.hospital_id]);
      const DynAmbulanceListID = DynAmbulanceList[0].id;
      console.log(DynAmbulanceListID, "DynAmbulanceListIDDDD");

      const getAdminChargeId = await this.dynamicConnection.query(`select id  from charges 
          where Hospital_id = ? and hospital_charges_id = ?`,
        [createAmbulanceCall.hospital_id,
        createAmbulanceCall.charge_id
        ])
      const getAdminChargeID = getAdminChargeId[0].id;

      const getAdminChargeCategories = await this.dynamicConnection.query(`select id  from charge_categories 
            where Hospital_id = ? and hospital_charge_categories_id = ?`,
        [createAmbulanceCall.hospital_id,
        createAmbulanceCall.charge_category_id
        ])
      const getAdminChargeCategoriesID = getAdminChargeCategories[0].id;



      let caseReferenceId;


      if (createAmbulanceCall.case_reference_id) {



        const [DynIpdOpd] = await this.dynamicConnection.query('SELECT opd_id,ipd_id FROM patient_charges WHERE charge_id=? and patient_id=?', [getAdminChargeID, dynamicIPDPatientId]);
        const DynOpd = DynIpdOpd.opd_id;
        const DynIPD = DynIpdOpd.ipd_id;
        console.log(DynOpd, "DynIPDIDDD");
        console.log(DynIPD, "IDDD");






        if (DynOpd) {

          const [opdDetails] = await this.dynamicConnection.query(
            'SELECT case_reference_id FROM opd_details WHERE id=?',
            [DynOpd]
          );
          caseReferenceId = opdDetails ? opdDetails.case_reference_id : null;

        } else if (DynIPD) {

          const [ipdDetails] = await this.dynamicConnection.query(
            'SELECT case_reference_id FROM ipd_details WHERE id=?',
            [DynIPD]
          );
          caseReferenceId = ipdDetails ? ipdDetails.case_reference_id : null;

        }

        console.log(caseReferenceId, "Case Reference ID");



      }


      const [GetDynAmbulanceCall] = await this.dynamicConnection.query(
        'SELECT id,transaction_id FROM ambulance_call WHERE hos_ambulance_call_id=? and hospital_id=?',
        [id, createAmbulanceCall.hospital_id]
      );

      const GetDynAmbulanceCallID = GetDynAmbulanceCall.id;
      const GetDyntransacID = GetDynAmbulanceCall.transaction_id;




      await this.dynamicConnection.query(
        `update ambulance_call SET
       patient_id=?,
       case_reference_id=?,
       vehicle_id=?,
       driver=?,
       date=?,
       call_from=?,
       call_to=?,
       charge_category_id=?,
       charge_id=?,
       standard_charge=?,
       tax_percentage=?,
       amount=?,
       net_amount=?,
       note=?,
       hospital_id=?
       where id=?`,
        [
          dynamicIPDPatientId,
          caseReferenceId,
          DynAmbulanceListID,
          createAmbulanceCall.driver,
          createAmbulanceCall.date,
          createAmbulanceCall.call_from,
          createAmbulanceCall.call_to,
          getAdminChargeCategoriesID,
          getAdminChargeID,
          createAmbulanceCall.standard_charge,
          createAmbulanceCall.tax_percentage,
          createAmbulanceCall.amount,
          createAmbulanceCall.net_amount,
          createAmbulanceCall.note,
          createAmbulanceCall.hospital_id,
          GetDynAmbulanceCallID
        ],
      )


      await this.dynamicConnection.query(
        `update transactions SET
         patient_id=?,
         case_reference_id=?,
         payment_mode=?,
         amount=?,
         cheque_no=?,
         cheque_date=?,
         attachment=?,
         attachment_name=?,
         payment_date=?,
         note=?,
         hospital_id=?
         where id=?`,
        [
          dynamicIPDPatientId,
          caseReferenceId,
          createAmbulanceCall.payment_mode,
          createAmbulanceCall.amount,
          createAmbulanceCall.cheque_no,
          createAmbulanceCall.cheque_date,
          createAmbulanceCall.attachment,
          createAmbulanceCall.attachment_name,
          createAmbulanceCall.payment_date,
          createAmbulanceCall.note,
          createAmbulanceCall.hospital_id,
          GetDyntransacID
        ],
      )






      return [{
        "data ": {
          status: "success",
          "messege": "Ambulance call details updated successfully ",
          "updated_values": await this.connection.query('SELECT * FROM ambulance_call WHERE id = ?', [id])
        }
      }];


    } catch (error) {

      console.error('Error while posting data:', error);
    }
  }



  async removeAmbulanceCall(id: number, hospital_id: number): Promise<{ [key: string]: any }[]> {

    try {

      const [GetTransactionID] = await this.connection.query(
        'SELECT transaction_id FROM ambulance_call WHERE id=?',
        [id]
      );

      const GettransacID = GetTransactionID.transaction_id;


      await this.connection.query('DELETE FROM transactions WHERE id = ?', [GettransacID]);
      await this.connection.query('DELETE FROM ambulance_call WHERE id = ?', [id]);


      const [GetDynAmbulanceCall] = await this.dynamicConnection.query(
        'SELECT id FROM ambulance_call WHERE hos_ambulance_call_id=? and hospital_id=?',
        [id, hospital_id]
      );

      const GetDynAmbulanceCallID = GetDynAmbulanceCall.id;
      const GetDyntransacID = GetDynAmbulanceCall.transaction_id;

      await this.dynamicConnection.query('UPDATE transactions SET is_deleted = 1 WHERE id=?', [GetDyntransacID]);
      await this.dynamicConnection.query('DELETE FROM ambulance_call WHERE id = ?', [GetDynAmbulanceCallID]);

      return [
        {
          status: 'success',
          message: `Ambulance call with id: ${id} and associated entries in the dynamic database have been deleted.`,
        },
      ];

    }
    catch (error) {
      console.error('Error while posting data:', error);
    }
  }



  async deleteAmbulancePayment(id: number, Hospital_id: number): Promise<{ [key: string]: any }[]> {

    try {


      await this.connection.query('DELETE FROM transactions WHERE id = ?', [id]);
      await this.dynamicConnection.query('UPDATE transactions SET is_deleted = 1 WHERE hos_transaction_id = ? and Hospital_id = ?', [id, Hospital_id]);





      return [
        {
          status: 'success',
          message: `Payment with id: ${id} and associated entries in the dynamic database have been deleted.`,
        },
      ];

    }
    catch (error) {
      console.error('Error while posting data:', error);
    }

  }




  async AddAmbulancePayment(createAmbulanceCall: AmbulanceCall) {
    try {
      const fromDate = new Date()
      console.log(fromDate, 'dateeeeee')

      const [patientId] = await this.connection.query('SELECT aayush_unique_id FROM patients WHERE id = ?', [createAmbulanceCall.patient_id]);
      if (!patientId || patientId.length === 0) {
        throw new Error(` with id: ${createAmbulanceCall.patient_id} not found.`);
      }
      const email = patientId.email;
      const [staffId] = await this.connection.query('SELECT email FROM staff WHERE id = ?', [createAmbulanceCall.received_by]);
      if (!staffId || staffId.length === 0) {
        throw new Error(`Staff with id: ${createAmbulanceCall.received_by} not found.`);
      }

      const docemail = staffId.email;
      let Ambulance_transaction_id;
      const Ambulance_transaction = await this.connection.query(
        `INSERT into transactions (
           type,
           section,
           patient_id,
           case_reference_id,
           ambulance_call_id,
           payment_mode,
           amount,
           cheque_no,
           cheque_date,
           attachment,
           attachment_name,
           payment_date,
           note,
           received_by
             ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        ['payment',
          'Ambulance',
          createAmbulanceCall.patient_id,
          createAmbulanceCall.case_reference_id,
          createAmbulanceCall.ambulance_call_id,
          createAmbulanceCall.payment_mode,
          createAmbulanceCall.amount,
          createAmbulanceCall.cheque_no,
          createAmbulanceCall.cheque_date,
          createAmbulanceCall.attachment,
          createAmbulanceCall.attachment_name,
          createAmbulanceCall.payment_date,
          createAmbulanceCall.note,
          createAmbulanceCall.received_by
        ],
      );

      Ambulance_transaction_id = Ambulance_transaction.insertId;

      // -------------------------------------//



      const dynamicPatient = await this.dynamicConnection.query('SELECT id FROM patients WHERE aayush_unique_id = ?', [email]);
      console.log(dynamicPatient[0].id, "newpatid");
      const dynamicIPDPatientId = dynamicPatient[0].id;


      const dynamicUpdateStaff = await this.dynamicConnection.query('SELECT id FROM staff WHERE email = ?', [docemail]);
      console.log(dynamicUpdateStaff[0].id, "1234567890-");
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;

      const getAmbulanceCallbill = await this.dynamicConnection.query('SELECT id FROM ambulance_call WHERE hos_ambulance_call_id = ? and hospital_id =?', [createAmbulanceCall.ambulance_call_id, createAmbulanceCall.hospital_id]);
      const getAmbulanceCallbillID = getAmbulanceCallbill[0].id;
      console.log(getAmbulanceCallbillID, "getAmbulanceCallbillIDDDD");


      const DynCaseref = await this.dynamicConnection.query('SELECT case_reference_id FROM ambulance_call WHERE id = ?', [getAmbulanceCallbillID]);
      const DynCaserefID = DynCaseref[0].case_reference_id;
      console.log(DynCaserefID, "DynCaserefIDDDDDD");


      let Dyn_Ambulance_transaction_id;


      const Dyn_Ambulance_transaction = await this.dynamicConnection.query(
        `INSERT into transactions (
           type,
           section,
           patient_id,
           case_reference_id,
           ambulance_call_id,
           payment_mode,
           amount,
           cheque_no,
           cheque_date,
           attachment,
           attachment_name,
           payment_date,
           note,
           received_by,
           Hospital_id,
           hos_transaction_id
             ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        ['payment',
          'Ambulance',
          dynamicIPDPatientId,
          DynCaserefID,
          getAmbulanceCallbillID,
          createAmbulanceCall.payment_mode,
          createAmbulanceCall.amount,
          createAmbulanceCall.cheque_no,
          createAmbulanceCall.cheque_date,
          createAmbulanceCall.attachment,
          createAmbulanceCall.attachment_name,
          createAmbulanceCall.payment_date,
          createAmbulanceCall.note,
          dynamicUPTDStaffId,
          createAmbulanceCall.hospital_id,
          Ambulance_transaction_id
        ],
      );

      Dyn_Ambulance_transaction_id = Dyn_Ambulance_transaction.insertId;
      console.log(Dyn_Ambulance_transaction_id, 'Dyn_Ambulance_transaction_idddd')




      return [{
        "data ": {
          status: "success",
          "messege": "Payment bill details added successfully ",
          "Added_Payment_values": await this.connection.query('SELECT * FROM transactions where id = ?', [Ambulance_transaction_id])
        }
      }];


    } catch (error) {
      console.error('Error inserting data:', error);
    }
  }

}