import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Billing } from './entities/billing.entity';
import {CountDto} from './dto/billing.dto';

@Injectable()
export class BillingService {

  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(Entity: Billing) {
    try {
      const HOSamount = await this.connection.query(`  select charges.standard_charge,tax_category.percentage tax_percentage, round((charges.standard_charge+
    (charges.standard_charge*((tax_category.percentage)/100))),2) amount from
  charges join tax_category on charges.tax_category_id = tax_category.id
where charges.id = ? `, [Entity.charge_id])

      const bill = await this.connection.query(
        `Insert into patient_charges (date,
    qty,
    charge_id,
    standard_charge,
    tpa_charge,
    tax,
    apply_charge,
    amount,
    note,
    payment_status,
    patient_id,
    total) values(?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          Entity.date,
          Entity.qty,
          Entity.charge_id,
          Entity.standard_charge,
          0.00,
          Entity.tax,
          Entity.standard_charge,
          HOSamount[0].amount,
          Entity.note,
          "unpaid",
          Entity.patient_id,
          HOSamount[0].amount

        ]
      )
      const [getadmincharge_id] = await this.dynamicConnection.query(`select id from charges where Hospital_id = ? and hospital_charges_id = ?`, [
        Entity.Hospital_id,
        Entity.charge_id
      ])

      const [gethospatientmob] = await this.connection.query(`select * from patients where id = ?`, [Entity.patient_id])


      const [getadminpatientid] = await this.dynamicConnection.query(`select id from patients where aayush_unique_id = ?`, [gethospatientmob.aayush_unique_id])


      await this.dynamicConnection.query(`Insert into patient_charges
    (date,
    qty,
    charge_id,
    standard_charge,
    tpa_charge,
    tax,
    apply_charge,
    amount,
    note,
    payment_status,
    patient_id,
    total,
    Hospital_id,
    hos_patient_charges_id) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
        Entity.date,
        Entity.qty,
        getadmincharge_id.id,
        Entity.standard_charge,
        0.00,
        Entity.tax,
        Entity.standard_charge,
        HOSamount[0].amount,
        Entity.note,
        "unpaid",
        getadminpatientid.id,
        HOSamount[0].amount,
        Entity.Hospital_id,
        bill.insertId
      ])

      return {
        "date": bill,
        "status": "success",
        "message": "charges added successfully."
      }

    } catch (error) {
      return error
    }
  }


  async findall(patient_id: number) {
    const billing = await this.connection.query(`
select charges.name charge_name, charge_type_master.charge_type as charge_type, charge_categories.name charge_category,
patient_charges.qty as QTY, patient_charges.apply_charge as charges,  patient_charges.tax as TAX, patient_charges.amount as AMOUNT ,
 patient_charges.payment_status as status
from patient_charges
left join charges on patient_charges.charge_id = charges.id
left join charge_categories on charges.charge_category_id = charge_categories.id
left join charge_type_master on charge_categories.charge_type_id = charge_type_master.id
left join patients on patient_charges.patient_id = patients.id
WHERE patients.id = ?
  AND patient_charges.payment_status <> 'paid'`, [patient_id])

    return billing;
  }

  async findone(patient_id: number) {
    const PT = await this.connection.query(`select patients.patient_name as name, patients.age as age,
     patients.id as PT_ID , patients.dob from patients where patients.id = ?`, [patient_id])
    return PT;
  }



  async findamount(patient_id: number) {
    const patient_amount = await this.connection.query(` select sum(patient_charges.amount) as Total from patient_charges
    where patient_charges.patient_id = ? AND patient_charges.payment_status <> 'paid'`, [patient_id])
    return patient_amount;
  }



  async findBillingDetailsByIpdId(
    ipd_id: number,
    search: string,
    limit: number,
    page: number,
  ): Promise<CountDto> {
    const offset = limit * (page - 1);
    let values: any[] = [ipd_id];
    let searchValues: any[] = [];
  
    let baseCondition = `WHERE patient_charges.ipd_id = ?`;
    let searchCondition = '';
  
    if (search) {
      searchCondition = `
        AND (
          CONCAT('IPDN', ipd_details.id) LIKE ?
          OR patient_charges.date LIKE ?
          OR charges.name LIKE ?
          OR charge_type_master.charge_type LIKE ?
          OR charge_categories.name LIKE ?
          OR patient_charges.qty LIKE ?
          OR patient_charges.payment_status LIKE ?
        )`;
      const pattern = `%${search}%`;
      searchValues = Array(7).fill(pattern);
      values.push(...searchValues);
    }
  
    try {
      // 1. Billing list with pagination
      const baseQuery = `
        SELECT 
          patient_charges.id,
          CONCAT('IPDN', ipd_details.id) AS IPD_No,
          patient_charges.date AS ChargesDate,
          charges.name AS charge_name,
          patient_charges.note AS Note,
          charge_type_master.charge_type AS charge_type,
          charge_categories.name AS charge_category,
          patient_charges.qty AS QTY,
          patient_charges.payment_status,
          FORMAT(patient_charges.apply_charge, 2) AS ApplyCharge,
          CONCAT(
            FORMAT((patient_charges.tax / 100) * patient_charges.apply_charge, 2),
            ' (',
            FORMAT(patient_charges.tax, 2),
            '%)'
          ) AS TAX,
          FORMAT(patient_charges.amount, 2) AS AMOUNT
        FROM patient_charges
        LEFT JOIN charges ON patient_charges.charge_id = charges.id
        LEFT JOIN charge_categories ON charges.charge_category_id = charge_categories.id
        LEFT JOIN charge_type_master ON charge_categories.charge_type_id = charge_type_master.id
        LEFT JOIN patients ON patient_charges.patient_id = patients.id
        LEFT JOIN ipd_details ON patient_charges.ipd_id = ipd_details.id
        LEFT JOIN bed_group ON ipd_details.bed_group_id = bed_group.id
        LEFT JOIN bed ON ipd_details.bed = bed.id
        LEFT JOIN bed_type ON bed.bed_type_id = bed_type.id
        LEFT JOIN floor ON bed_group.floor = floor.id
        LEFT JOIN transactions ON patient_charges.transaction_id = transactions.id
        ${baseCondition} ${searchCondition}
         ORDER BY patient_charges.id DESC LIMIT ? OFFSET ?`;
  
      const paginatedValues = [...values, limit, offset];
      const BillingIpd = await this.connection.query(baseQuery, paginatedValues);
  
      // 2. Count of filtered records
      const countQuery = `
        SELECT COUNT(patient_charges.id) AS total
        FROM patient_charges
        LEFT JOIN charges ON patient_charges.charge_id = charges.id
        LEFT JOIN charge_categories ON charges.charge_category_id = charge_categories.id
        LEFT JOIN charge_type_master ON charge_categories.charge_type_id = charge_type_master.id
        LEFT JOIN patients ON patient_charges.patient_id = patients.id
        LEFT JOIN ipd_details ON patient_charges.ipd_id = ipd_details.id
        ${baseCondition} ${searchCondition}`;
  
      const [countResult] = await this.connection.query(countQuery, values);
  
      // 3. Totals and patient info for filtered data
      const totalsQuery = `
        SELECT 
          patients.patient_name AS PatientName,
          patients.id AS PatientID,
          patients.guardian_name AS GuardianName,
          patients.gender AS Gender,
          patients.age AS Age,
          patients.mobileno AS Phone,
          patients.address AS Address,
          patients.image AS PatientImage,
          ipd_details.discharged AS Discharge,
          ipd_details.date AS AdmissionDate,
          ipd_details.case_reference_id AS CaseID,
          CONCAT(bed.name,"-",bed_group.name,"-",floor.name) AS Bed_name,
          FORMAT(SUM((patient_charges.tax / 100) * patient_charges.apply_charge), 2) AS TotalTaxAmount,
          FORMAT(SUM(patient_charges.apply_charge), 2) AS TotalApplyCharge,
          FORMAT(SUM(patient_charges.amount), 2) AS TotalAmount
        FROM patient_charges
        LEFT JOIN charges ON patient_charges.charge_id = charges.id
        LEFT JOIN charge_categories ON charges.charge_category_id = charge_categories.id
        LEFT JOIN charge_type_master ON charge_categories.charge_type_id = charge_type_master.id
        LEFT JOIN patients ON patient_charges.patient_id = patients.id
        LEFT JOIN ipd_details ON patient_charges.ipd_id = ipd_details.id
        LEFT JOIN bed_group ON ipd_details.bed_group_id = bed_group.id
        LEFT JOIN bed ON ipd_details.bed = bed.id
        LEFT JOIN bed_type ON bed.bed_type_id = bed_type.id
        LEFT JOIN floor ON bed_group.floor = floor.id
        ${baseCondition} ${searchCondition}`;
  
      const [totalsResult] = await this.connection.query(totalsQuery, values);
  
      // 4. Paid amount from transactions for filtered records
      const paidQuery = `
        SELECT FORMAT(SUM(transactions.amount), 2) AS PaidAmount
        FROM transactions
        WHERE transactions.ipd_id = ?
      `;
      const [paidResult] = await this.connection.query(paidQuery, [ipd_id]);
  
      const totalAmount = parseFloat(totalsResult?.TotalAmount || 0);
      const paidAmount = parseFloat(paidResult?.PaidAmount || 0);
      const unpaidAmount = (totalAmount - paidAmount).toFixed(2);
  
      return {
        details: BillingIpd,
        patientInfo: {
          patientName: totalsResult?.PatientName || '',
          guardianName: totalsResult?.GuardianName || '',
          gender: totalsResult?.Gender || '',
          age: totalsResult?.Age || '',
          phone: totalsResult?.Phone || '',
          address: totalsResult?.Address || '',
          Bed_name: totalsResult?.Bed_name || '',
          PatientImage: totalsResult?.PatientImage || '',
          PatientID: totalsResult?.PatientID || '',
          Discharge: totalsResult?.Discharge || '',
          AdmissionDate: totalsResult?.AdmissionDate || '',
          CaseID: totalsResult?.CaseID || ''
        },
        total: countResult?.total ?? 0,
        totalTaxAmount: totalsResult?.TotalTaxAmount || 0,
        totalApplyCharge: totalsResult?.TotalApplyCharge || 0,
        totalAmount: totalsResult?.TotalAmount || 0,
        paid: paidAmount.toFixed(2),
        unpaid: unpaidAmount
      };
    } catch (error) {
      console.error(error, 'Billing Error');
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'THE API SERVICE IS TEMPORARILY UNAVAILABLE. PLEASE TRY AGAIN LATER.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  



  async findBillingDetailsByOpdId(
    opd_id: number,
    search: string,
    limit: number,
    page: number,
  ): Promise<CountDto> {
    const offset = limit * (page - 1);
    let values: any[] = [opd_id];
    let searchValues: any[] = [];
  
    try {
      let baseQuery = `
        SELECT 
          patient_charges.id,
          CONCAT('OPDN', opd_details.id) AS OPD_No,
          patient_charges.date AS ChargesDate,
          charges.name AS charge_name,
          patient_charges.note AS Note,
          charge_type_master.charge_type AS charge_type,
          charge_categories.name AS charge_category,
          patient_charges.standard_charge AS StandardCharge,
          patient_charges.qty AS QTY,
          patient_charges.payment_status,
          FORMAT(patient_charges.apply_charge, 2) AS ApplyCharge,
          patient_charges.additional_charge AS AdditionalCharge,
          patient_charges.discount_amount AS DiscountAmount,
          FORMAT((patient_charges.apply_charge + patient_charges.additional_charge - patient_charges.discount_amount), 2) AS SubTotal,
          CONCAT(
              FORMAT((patient_charges.tax / 100) * patient_charges.apply_charge, 2),
              ' (',
              FORMAT(patient_charges.tax, 2),
              '%)'
          ) AS TAX,
          FORMAT(
            ((patient_charges.apply_charge + patient_charges.additional_charge - patient_charges.discount_amount) + 
            ((patient_charges.tax / 100) * patient_charges.apply_charge)), 
          2) AS NetAmount
        FROM patient_charges
        LEFT JOIN charges ON patient_charges.charge_id = charges.id
        LEFT JOIN charge_categories ON charges.charge_category_id = charge_categories.id
        LEFT JOIN charge_type_master ON charge_categories.charge_type_id = charge_type_master.id
        LEFT JOIN patients ON patient_charges.patient_id = patients.id
        LEFT JOIN opd_details ON patient_charges.opd_id = opd_details.id
        LEFT JOIN transactions ON patient_charges.transaction_id = transactions.id
        WHERE patient_charges.opd_id = ?`;
  
      let countQuery = `
        SELECT COUNT(patient_charges.id) AS total
        FROM patient_charges
        LEFT JOIN charges ON patient_charges.charge_id = charges.id
        LEFT JOIN charge_categories ON charges.charge_category_id = charge_categories.id
        LEFT JOIN charge_type_master ON charge_categories.charge_type_id = charge_type_master.id
        LEFT JOIN patients ON patient_charges.patient_id = patients.id
        LEFT JOIN opd_details ON patient_charges.opd_id = opd_details.id
        LEFT JOIN transactions ON patient_charges.transaction_id = transactions.id
        WHERE patient_charges.opd_id = ?`;
  
      let totalsQuery = `
        SELECT 
          patients.patient_name AS PatientName,
          patients.id AS PatientID,
          patients.image AS PatientImage,
          patients.guardian_name AS GuardianName,
          patients.gender AS Gender,
          patients.age AS Age,
          patients.mobileno AS Phone,
          patients.address AS Address,
          opd_details.case_reference_id AS CaseID,
          opd_details.created_at AS OpdAdmissionDate,
          SUM((patient_charges.tax / 100) * patient_charges.apply_charge) AS TotalTaxAmount,
          SUM(patient_charges.apply_charge) AS TotalApplyCharge,
          SUM((patient_charges.apply_charge + patient_charges.additional_charge - patient_charges.discount_amount) + 
              ((patient_charges.tax / 100) * patient_charges.apply_charge)) AS TotalAmount
        FROM patient_charges
        LEFT JOIN charges ON patient_charges.charge_id = charges.id
        LEFT JOIN charge_categories ON charges.charge_category_id = charge_categories.id
        LEFT JOIN charge_type_master ON charge_categories.charge_type_id = charge_type_master.id
        LEFT JOIN patients ON patient_charges.patient_id = patients.id
        LEFT JOIN opd_details ON patient_charges.opd_id = opd_details.id
        LEFT JOIN transactions ON patient_charges.transaction_id = transactions.id
        WHERE patient_charges.opd_id = ?`;
  
      if (search) {
        const condition = `
          AND (CONCAT('OPDN', opd_details.id) LIKE ? 
            OR patient_charges.date LIKE ? 
            OR charges.name LIKE ? 
            OR charge_type_master.charge_type LIKE ? 
            OR charge_categories.name LIKE ? 
            OR patient_charges.qty LIKE ?
            OR patient_charges.payment_status LIKE ? )`;
  
        baseQuery += condition;
        countQuery += condition;
        totalsQuery += condition;
  
        const pattern = `%${search}%`;
        searchValues = Array(7).fill(pattern);
        values = [opd_id, ...searchValues];
      }
  
      const paginatedValues = [...values, limit, offset];
      baseQuery += ` ORDER BY patient_charges.id DESC LIMIT ? OFFSET ?`;
  
      const BillingOpd = await this.connection.query(baseQuery, paginatedValues);
      const [countResult] = await this.connection.query(countQuery, values);
      const [totalsResult] = await this.connection.query(totalsQuery, values);
  
      // Get paid amount separately
      const [paidResult] = await this.connection.query(
        `SELECT SUM(amount) AS PaidAmount FROM transactions WHERE opd_id = ?`,
        [opd_id]
      );

      const paidAmount = (paidResult?.PaidAmount || 0).toFixed(2);
      const unpaidAmount = (totalsResult?.TotalAmount - paidAmount).toFixed(2);
  
      return {
        details: BillingOpd,
        patientInfo: {
          patientName: totalsResult?.PatientName || '',
          guardianName: totalsResult?.GuardianName || '',
          gender: totalsResult?.Gender || '',
          age: totalsResult?.Age || '',
          phone: totalsResult?.Phone || '',
          address: totalsResult?.Address || '',
          PatientImage: totalsResult?.PatientImage || '',
          PatientID: totalsResult?.PatientID || '',
          CaseID: totalsResult?.CaseID || '',
          OpdAdmissionDate: totalsResult?.OpdAdmissionDate || ''
        },
        total: countResult?.total ?? 0,
        totalTaxAmount: (totalsResult?.TotalTaxAmount || 0).toFixed(2),
        totalApplyCharge: (totalsResult?.TotalApplyCharge || 0).toFixed(2),
        totalAmount: (totalsResult?.TotalAmount || 0).toFixed(2),
        paid: paidAmount,
        unpaid: unpaidAmount,
      };
    } catch (error) {
      console.error(error, 'err');
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'THE API SERVICE IS TEMPORARILY UNAVAILABLE. PLEASE TRY AGAIN LATER.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
  


  async findBillingDetailsByCaseReferenceId(
    case_reference_id: string,
    search: string,
    ipd_limit: number,
    ipd_page: number,
    opd_limit: number,
    opd_page: number,
  ): Promise<any> {
    const ipd_offset = ipd_limit * (ipd_page - 1);
    const opd_offset = opd_limit * (opd_page - 1);
    let searchValues: any[] = [];
  
    const searchCondition = `
      AND (
        CONCAT('IPDN', ipd_details.id) LIKE ?
        OR CONCAT('OPDN', opd_details.id) LIKE ?
        OR patient_charges.date LIKE ?
        OR charges.name LIKE ?
        OR charge_type_master.charge_type LIKE ?
        OR charge_categories.name LIKE ?
        OR patient_charges.qty LIKE ?
        OR patient_charges.payment_status LIKE ?
      )`;
  
    if (search) {
      const pattern = `%${search}%`;
      searchValues = Array(8).fill(pattern);
    }
  
    try {
      let baseQuery = `
        SELECT 
          patient_charges.id,
          IF(patient_charges.ipd_id IS NOT NULL, CONCAT('IPDN', ipd_details.id), CONCAT('OPDN', opd_details.id)) AS CaseNo,
          patient_charges.date AS ChargesDate,
          charges.name AS charge_name,
          patient_charges.note AS Note,
          charge_type_master.charge_type AS charge_type,
          charge_categories.name AS charge_category,
          patient_charges.qty AS QTY,
          patient_charges.payment_status,
          patient_charges.additional_charge AS AdditionalCharge,
          patient_charges.discount_amount AS DiscountAmount,
          patient_charges.apply_charge,
          patient_charges.tax,
          patient_charges.amount,
          patient_charges.ipd_id,
          patient_charges.opd_id
        FROM patient_charges
        LEFT JOIN charges ON patient_charges.charge_id = charges.id
        LEFT JOIN charge_categories ON charges.charge_category_id = charge_categories.id
        LEFT JOIN charge_type_master ON charge_categories.charge_type_id = charge_type_master.id
        LEFT JOIN patients ON patient_charges.patient_id = patients.id
        LEFT JOIN ipd_details ON patient_charges.ipd_id = ipd_details.id
        LEFT JOIN opd_details ON patient_charges.opd_id = opd_details.id
        WHERE (ipd_details.case_reference_id = ? OR opd_details.case_reference_id = ?)`;
  
      if (search) baseQuery += searchCondition;
  
      const allData = await this.connection.query(
        baseQuery,
        [case_reference_id, case_reference_id, ...searchValues]
      );
  
      // Split into IPD and OPD
      const ipdDetails = allData.filter(item => item.ipd_id !== null);
      const opdDetails = allData.filter(item => item.opd_id !== null);
  
      const calculateSummary = (data, isOpd: boolean) => {
        let totalApplyCharge = 0;
        let totalTaxAmount = 0;
        let totalAmount = 0;
  
        data.forEach(item => {
          const applyCharge = parseFloat(item.apply_charge || 0);
          const taxRate = parseFloat(item.tax || 0);
          const additionalCharge = parseFloat(item.AdditionalCharge || 0);
          const discountAmount = parseFloat(item.DiscountAmount || 0);
  
          const taxAmount = (taxRate / 100) * applyCharge;
          const subTotal = applyCharge + additionalCharge - discountAmount;
          const netAmount = subTotal + taxAmount;
  
          totalApplyCharge += applyCharge;
          totalTaxAmount += taxAmount;
          totalAmount += isOpd ? netAmount : parseFloat(item.amount || 0);
        });
  
        return {
          totalApplyCharge: totalApplyCharge.toFixed(2),
          totalTaxAmount: totalTaxAmount.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
        };
      };
  
      const ipdSummaryRaw = calculateSummary(ipdDetails, false);
      const opdSummaryRaw = calculateSummary(opdDetails, true);
  
      const ipdPaginated = ipdDetails.slice(ipd_offset, ipd_offset + ipd_limit).map(item => {
        const taxAmount = (parseFloat(item.tax) / 100) * item.apply_charge;
        const subTotal = item.apply_charge + item.AdditionalCharge - item.DiscountAmount;
        const netAmount = subTotal + taxAmount;
  
        return {
          ...item,
          ApplyCharge: item.apply_charge.toFixed(2),
          TAX: taxAmount.toFixed(2),
          SubTotal: subTotal.toFixed(2),
          NetAmount: netAmount.toFixed(2),
          AMOUNT: parseFloat(item.amount || 0).toFixed(2),
        };
      });
  
      const opdPaginated = opdDetails.slice(opd_offset, opd_offset + opd_limit).map(item => {
        const taxAmount = (parseFloat(item.tax) / 100) * item.apply_charge;
        const subTotal = item.apply_charge + item.AdditionalCharge - item.DiscountAmount;
        const netAmount = subTotal + taxAmount;
  
        return {
          ...item,
          ApplyCharge: item.apply_charge.toFixed(2),
          TAX: taxAmount.toFixed(2),
          SubTotal: subTotal.toFixed(2),
          NetAmount: netAmount.toFixed(2),
          AMOUNT: parseFloat(item.amount || 0).toFixed(2),
        };
      });
  
      const [paidResult] = await this.connection.query(
        `
        SELECT
          SUM(CASE WHEN transactions.ipd_id IS NOT NULL THEN amount ELSE 0 END) AS IpdPaid,
          SUM(CASE WHEN transactions.opd_id IS NOT NULL THEN amount ELSE 0 END) AS OpdPaid
        FROM transactions
        WHERE case_reference_id = ?`,
        [case_reference_id]
      );
  
      const ipdPaid = parseFloat(paidResult?.IpdPaid || 0);
      const opdPaid = parseFloat(paidResult?.OpdPaid || 0);

      const isIPD = case_reference_id.startsWith('IPD');
  
      const [patientInfo] = await this.connection.query(
        `
        SELECT 
          patients.patient_name AS PatientName,
          patients.id AS PatientID,
          patients.image AS PatientImage,
          patients.guardian_name AS GuardianName,
          patients.gender AS Gender,
          patients.age AS Age,
          patients.mobileno AS Phone,
          patients.address AS Address,
          opd_details.created_at AS OpdAdmissionDate,
      
          -- IPD specific info (nullable)
          ipd_details.discharged AS Discharge,
          ipd_details.date AS IPDAdmissionDate,
          ipd_details.case_reference_id AS IPDCaseID,
      
          -- Only for IPD: Bed details
          CONCAT(bed.name, "-", bed_group.name, "-", floor.name) AS Bed_name
      
        FROM patient_charges
        LEFT JOIN patients ON patient_charges.patient_id = patients.id
        LEFT JOIN ipd_details ON patient_charges.ipd_id = ipd_details.id
        LEFT JOIN opd_details ON patient_charges.opd_id = opd_details.id
        LEFT JOIN bed_group ON ipd_details.bed_group_id = bed_group.id
        LEFT JOIN bed ON ipd_details.bed = bed.id
        LEFT JOIN floor ON bed_group.floor = floor.id
        WHERE ipd_details.case_reference_id = ? OR opd_details.case_reference_id = ?
        ORDER BY ipd_details.id DESC, opd_details.id DESC
        LIMIT 1
        `,
        [case_reference_id, case_reference_id]
      );
      
  
      return {
        ipdDetails: ipdPaginated,
        opdDetails: opdPaginated,
        ipdSummary: {
          ...ipdSummaryRaw,
          paid: ipdPaid.toFixed(2),
          unpaid: (parseFloat(ipdSummaryRaw.totalAmount) - ipdPaid).toFixed(2),
        },
        opdSummary: {
          ...opdSummaryRaw,
          paid: opdPaid.toFixed(2),
          unpaid: (parseFloat(opdSummaryRaw.totalAmount) - opdPaid).toFixed(2),
        },
        patientInfo: {
          patientName: patientInfo?.PatientName || '',
          guardianName: patientInfo?.GuardianName || '',
          gender: patientInfo?.Gender || '',
          age: patientInfo?.Age || '',
          phone: patientInfo?.Phone || '',
          address: patientInfo?.Address || '',
          Bed_name: patientInfo?.Bed_name || '',
          PatientImage: patientInfo?.PatientImage || '',
          PatientID: patientInfo?.PatientID || '',
          Discharge: patientInfo?.Discharge || '',
          IPDAdmissionDate: patientInfo?.IPDAdmissionDate || '',
          IPDCaseID: patientInfo?.IPDCaseID || '',
          OpdAdmissionDate: patientInfo?.OpdAdmissionDate || ''
        },
        ipdPagination: {
          page: ipd_page,
          limit: ipd_limit,
          total: ipdDetails.length,
        },
        opdPagination: {
          page: opd_page,
          limit: opd_limit,
          total: opdDetails.length,
        },
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'THE API SERVICE IS TEMPORARILY UNAVAILABLE. PLEASE TRY AGAIN LATER.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
  

  async findBillingDetailsByPatientId(
    patient_id: string,
    search: string,
    ipd_limit: number,
    ipd_page: number,
    opd_limit: number,
    opd_page: number,
  ): Promise<any> {
    const ipd_offset = ipd_limit * (ipd_page - 1);
    const opd_offset = opd_limit * (opd_page - 1);
    let searchValues: any[] = [];
  
    const searchCondition = `
      AND (
        CONCAT('IPDN', ipd_details.id) LIKE ?
        OR CONCAT('OPDN', opd_details.id) LIKE ?
        OR patient_charges.date LIKE ?
        OR charges.name LIKE ?
        OR charge_type_master.charge_type LIKE ?
        OR charge_categories.name LIKE ?
        OR patient_charges.qty LIKE ?
        OR patient_charges.payment_status LIKE ?
      )`;
  
    if (search) {
      const pattern = `%${search}%`;
      searchValues = Array(8).fill(pattern);
    }
  
    try {
      let baseQuery = `
        SELECT 
          patient_charges.id,
          IF(patient_charges.ipd_id IS NOT NULL, CONCAT('IPDN', ipd_details.id), CONCAT('OPDN', opd_details.id)) AS CaseNo,
          patient_charges.date AS ChargesDate,
          charges.name AS charge_name,
          patient_charges.note AS Note,
          charge_type_master.charge_type AS charge_type,
          charge_categories.name AS charge_category,
          patient_charges.qty AS QTY,
          patient_charges.payment_status,
          patient_charges.additional_charge AS AdditionalCharge,
          patient_charges.discount_amount AS DiscountAmount,
          patient_charges.apply_charge,
          patient_charges.tax,
          patient_charges.amount,
          patient_charges.ipd_id,
          patient_charges.opd_id
        FROM patient_charges
        LEFT JOIN charges ON patient_charges.charge_id = charges.id
        LEFT JOIN charge_categories ON charges.charge_category_id = charge_categories.id
        LEFT JOIN charge_type_master ON charge_categories.charge_type_id = charge_type_master.id
        LEFT JOIN patients ON patient_charges.patient_id = patients.id
        LEFT JOIN ipd_details ON patient_charges.ipd_id = ipd_details.id
        LEFT JOIN opd_details ON patient_charges.opd_id = opd_details.id
        WHERE patients.id = ?`;
  
      if (search) baseQuery += searchCondition;
  
      const allData = await this.connection.query(
        baseQuery,
        [patient_id, ...searchValues]
      );
  
      const ipdDetails = allData.filter(item => item.ipd_id !== null);
      const opdDetails = allData.filter(item => item.opd_id !== null);
  
      const calculateSummary = (data, isOpd: boolean) => {
        let totalApplyCharge = 0;
        let totalTaxAmount = 0;
        let totalAmount = 0;
  
        data.forEach(item => {
          const applyCharge = parseFloat(item.apply_charge || 0);
          const taxRate = parseFloat(item.tax || 0);
          const additionalCharge = parseFloat(item.AdditionalCharge || 0);
          const discountAmount = parseFloat(item.DiscountAmount || 0);
  
          const taxAmount = (taxRate / 100) * applyCharge;
          const subTotal = applyCharge + additionalCharge - discountAmount;
          const netAmount = subTotal + taxAmount;
  
          totalApplyCharge += applyCharge;
          totalTaxAmount += taxAmount;
          totalAmount += isOpd ? netAmount : parseFloat(item.amount || 0);
        });
  
        return {
          totalApplyCharge: totalApplyCharge.toFixed(2),
          totalTaxAmount: totalTaxAmount.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
        };
      };
  
      const ipdSummaryRaw = calculateSummary(ipdDetails, false);
      const opdSummaryRaw = calculateSummary(opdDetails, true);
  
      const ipdPaginated = ipdDetails.slice(ipd_offset, ipd_offset + ipd_limit).map(item => {
        const taxAmount = (parseFloat(item.tax) / 100) * item.apply_charge;
        const subTotal = item.apply_charge + item.AdditionalCharge - item.DiscountAmount;
        const netAmount = subTotal + taxAmount;
  
        return {
          ...item,
          ApplyCharge: item.apply_charge.toFixed(2),
          TAX: taxAmount.toFixed(2),
          SubTotal: subTotal.toFixed(2),
          NetAmount: netAmount.toFixed(2),
          AMOUNT: parseFloat(item.amount || 0).toFixed(2),
        };
      });
  
      const opdPaginated = opdDetails.slice(opd_offset, opd_offset + opd_limit).map(item => {
        const taxAmount = (parseFloat(item.tax) / 100) * item.apply_charge;
        const subTotal = item.apply_charge + item.AdditionalCharge - item.DiscountAmount;
        const netAmount = subTotal + taxAmount;
  
        return {
          ...item,
          ApplyCharge: item.apply_charge.toFixed(2),
          TAX: taxAmount.toFixed(2),
          SubTotal: subTotal.toFixed(2),
          NetAmount: netAmount.toFixed(2),
          AMOUNT: parseFloat(item.amount || 0).toFixed(2),
        };
      });
  
      const [paidResult] = await this.connection.query(
        `
        SELECT
          SUM(CASE WHEN transactions.ipd_id IS NOT NULL THEN amount ELSE 0 END) AS IpdPaid,
          SUM(CASE WHEN transactions.opd_id IS NOT NULL THEN amount ELSE 0 END) AS OpdPaid
        FROM transactions
        WHERE patient_id = ?`,
        [patient_id]
      );
  
      const ipdPaid = parseFloat(paidResult?.IpdPaid || 0);
      const opdPaid = parseFloat(paidResult?.OpdPaid || 0);
  
      const [patientInfo] = await this.connection.query(
        `
        SELECT 
          patients.patient_name AS PatientName,
          patients.id AS PatientID,
          patients.image AS PatientImage,
          patients.guardian_name AS GuardianName,
          patients.gender AS Gender,
          patients.age AS Age,
          patients.mobileno AS Phone,
          patients.address AS Address,
          opd_details.created_at AS OpdAdmissionDate,
  
          ipd_details.discharged AS Discharge,
          ipd_details.date AS IPDAdmissionDate,
          ipd_details.case_reference_id AS IPDCaseID,
        
          CONCAT(bed.name, "-", bed_group.name, "-", floor.name) AS Bed_name
        
        FROM patient_charges
        LEFT JOIN patients ON patient_charges.patient_id = patients.id
        LEFT JOIN ipd_details ON patient_charges.ipd_id = ipd_details.id
        LEFT JOIN opd_details ON patient_charges.opd_id = opd_details.id
        LEFT JOIN bed_group ON ipd_details.bed_group_id = bed_group.id
        LEFT JOIN bed ON ipd_details.bed = bed.id
        LEFT JOIN floor ON bed_group.floor = floor.id
        WHERE patients.id = ?
        ORDER BY ipd_details.id DESC, opd_details.id DESC
        LIMIT 1
        `,
        [patient_id]
      );
  
      return {
        ipdDetails: ipdPaginated,
        opdDetails: opdPaginated,
        ipdSummary: {
          ...ipdSummaryRaw,
          paid: ipdPaid.toFixed(2),
          unpaid: (parseFloat(ipdSummaryRaw.totalAmount) - ipdPaid).toFixed(2),
        },
        opdSummary: {
          ...opdSummaryRaw,
          paid: opdPaid.toFixed(2),
          unpaid: (parseFloat(opdSummaryRaw.totalAmount) - opdPaid).toFixed(2),
        },
        patientInfo: {
          patientName: patientInfo?.PatientName || '',
          guardianName: patientInfo?.GuardianName || '',
          gender: patientInfo?.Gender || '',
          age: patientInfo?.Age || '',
          phone: patientInfo?.Phone || '',
          address: patientInfo?.Address || '',
          Bed_name: patientInfo?.Bed_name || '',
          PatientImage: patientInfo?.PatientImage || '',
          PatientID: patientInfo?.PatientID || '',
          Discharge: patientInfo?.Discharge || '',
          IPDAdmissionDate: patientInfo?.IPDAdmissionDate || '',
          IPDCaseID: patientInfo?.IPDCaseID || '',
          OpdAdmissionDate: patientInfo?.OpdAdmissionDate || ''
        },
        ipdPagination: {
          page: ipd_page,
          limit: ipd_limit,
          total: ipdDetails.length,
        },
        opdPagination: {
          page: opd_page,
          limit: opd_limit,
          total: opdDetails.length,
        },
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'THE API SERVICE IS TEMPORARILY UNAVAILABLE. PLEASE TRY AGAIN LATER.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  




}

