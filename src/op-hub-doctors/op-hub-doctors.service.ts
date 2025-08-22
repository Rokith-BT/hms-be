import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DoctorDetailsCountDto } from './entities/op-hub-doctor.entity';

@Injectable()
export class OpHubDoctorsService {
  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(
    search: string,
    hospital_id: number,
    date: any,
    gender: string,
  ) {
    if (hospital_id) {
      try {
        let query = `SELECT distinct
  CONCAT("Dr. ",staff.name, " ", staff.surname) AS doctor_name,
  staff.email,
  staff.id AS doctor_id,
  staff.gender,
  staff.image,
  coalesce( staff.qualification,"-") qualification,
  coalesce( staff.work_exp,"-") AS experience,
 COALESCE( concat( ROUND(((ROUND((SELECT AVG(staff_rating.rating) FROM staff_rating WHERE staff_rating.staff_id = staff.id), 1) / 5) * 5), 0)),"-" )AS rating,
 coalesce( GROUP_CONCAT(DISTINCT specialist.specialist_name),"-") AS specialist_names,
  charges.standard_charge,
  hospitals.hospital_name,
   concat(hospitals.hospital_opening_timing," - ",hospitals.hospital_closing_timing) hospital_opening_timing,
  shift_details.charge_id,
  concat(tax_category.percentage,"%") tax_percentage,
  round(((charges.standard_charge*((tax_category.percentage)/100))),2) tax,
    (select round((charges.standard_charge+(charges.standard_charge*((tax_category.percentage)/100))),2) amount from 
charges join tax_category on charges.tax_category_id = tax_category.id
where charges.id = shift_details.charge_id) Totalamount    
FROM staff 

LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
LEFT JOIN doctor_shift ON doctor_shift.staff_id = staff.id
left join hospital_staffs on hospital_staffs.staff_id = staff.id
left join hospitals on hospitals.plenome_id = hospital_staffs.hospital_id
LEFT JOIN shift_details on shift_details.staff_id = staff.id
left join charges on charges.id = shift_details.charge_id
left join tax_category on charges.tax_category_id = tax_category.id
LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1
WHERE staff_roles.role_id = 3 and staff.is_deleted = 0 and staff.is_active = 1 and hospital_staffs.hospital_id = ? `;
        let values = [];
        values.push(hospital_id);
        if (search) {
          query += `
  AND (staff.name LIKE ? 
  OR specialist.specialist_name like ?) `;
          values.push('%' + search + '%');
          values.push('%' + search + '%');
        }

        if (date) {
          query += ` AND doctor_shift.day = dayname(?) `;
          values.push(date);
        }
        if (gender) {
          query += ` and staff.gender = ? `;
          values.push(gender);
        }
        let final = `  GROUP BY doctor_id, doctor_name, doctor_shift.day,email, doctor_shift.global_shift_id,charge_id,hospital_name,hospital_opening_timing,qualification`;
        let out = query + final;
        let getDocs = await this.connection.query(out, values);

        for (const doc of getDocs) {
          try {
            const [getDoctorId] = await this.dynamicConnection.query(
              `select staff.id from staff where staff.email = ?`,
              [doc.email],
            );
            doc.doctor_id = getDoctorId.id;
          } catch (error) {
            console.error('Error fetching doctor id:', error);
          }
        }
        return getDocs;
      } catch (error) {
        return error;
      }
    } else {
      return {
        message: 'Enter the hospital_id to get Doctors',
      };
    }
  }

  async findAllV2(
    search: string,
    hospital_id: number,
    date: any,
    gender: string,
    limit: number,
    page: number,
  ): Promise<DoctorDetailsCountDto> {
    const offset = limit * (page - 1);
    try {
      let query = `SELECT DISTINCT
  CONCAT("Dr. ", staff.name, " ", staff.surname) AS doctor_name,
  staff.email,
  staff.id AS doctor_id,
  staff.gender,
  staff.image,
  COALESCE(staff.qualification, "-") AS qualification,
  COALESCE(staff.work_exp, "-") AS experience,
  COALESCE(
    CONCAT(ROUND(((ROUND(AVG(staff_rating.rating), 1) / 5) * 5), 0)),
    "-"
  ) AS rating,
  COALESCE(GROUP_CONCAT(DISTINCT specialist.specialist_name), "-") AS specialist_names,
  charges.standard_charge,
  hospitals.hospital_name,
  CONCAT(hospitals.hospital_opening_timing, " - ", hospitals.hospital_closing_timing) AS hospital_opening_timing,
  shift_details.charge_id,
  CONCAT(tax_category.percentage, "%") AS tax_percentage,
  ROUND((charges.standard_charge * (tax_category.percentage / 100)), 2) AS tax,
  ROUND((charges.standard_charge + (charges.standard_charge * (tax_category.percentage / 100))), 2) AS Totalamount

FROM staff
LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
LEFT JOIN doctor_shift ON doctor_shift.staff_id = staff.id
LEFT JOIN hospital_staffs ON hospital_staffs.staff_id = staff.id
LEFT JOIN hospitals ON hospitals.plenome_id = hospital_staffs.hospital_id
LEFT JOIN shift_details ON shift_details.staff_id = staff.id
LEFT JOIN charges ON charges.id = shift_details.charge_id
LEFT JOIN tax_category ON charges.tax_category_id = tax_category.id
LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1
LEFT JOIN staff_rating ON staff_rating.staff_id = staff.id

WHERE staff_roles.role_id = 3 
  AND staff.is_deleted = 0 
  AND staff.is_active = 1 
  AND hospital_staffs.hospital_id = ? `;

      let countQuery = `
SELECT COUNT(DISTINCT staff.id) AS total
FROM staff
LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
LEFT JOIN doctor_shift ON doctor_shift.staff_id = staff.id
LEFT JOIN hospital_staffs ON hospital_staffs.staff_id = staff.id
LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1
WHERE staff_roles.role_id = 3
  AND staff.is_deleted = 0
  AND staff.is_active = 1 
  AND hospital_staffs.hospital_id = ? `;
      let values = [];
      let countValues = [];
      values.push(hospital_id);
      countValues.push(hospital_id);

      if (search) {
        query += `
  AND (staff.name LIKE ? 
  OR specialist.specialist_name like ?) `;
        values.push('%' + search + '%');
        values.push('%' + search + '%');

        countQuery += `
          AND (staff.name LIKE ? 
          OR specialist.specialist_name like ?) `;
        countValues.push('%' + search + '%');
        countValues.push('%' + search + '%');
      }

      if (date) {
        query += ` AND doctor_shift.day = dayname(?) `;
        values.push(date);

        countQuery += ` AND doctor_shift.day = dayname(?) `;
        countValues.push(date);
      }
      if (gender) {
        query += ` and staff.gender = ? `;
        values.push(gender);

        countQuery += ` and staff.gender = ? `;
        countValues.push(gender);
      }
      let final = `  GROUP BY doctor_id, doctor_shift.day,charge_id,hospital_name,qualification`;
      let out = query + final + ` limit ${limit} offset ${offset}`;
      let getDocs = await this.connection.query(out, values);
      let [getCount] = await this.connection.query(countQuery, countValues);

      for (const doc of getDocs) {
        try {
          const [getDoctorId] = await this.dynamicConnection.query(
            `select staff.id from staff where staff.email = ?`,
            [doc.email],
          );
          doc.doctor_id = getDoctorId.id;
        } catch (error) {
          console.error('Error fetching doctor id:', error);
        }
      }
      let resp = {
        details: getDocs,
        count: getCount.total,
      };
      return resp;
    } catch (error) {
      console.log(error, 'errorerrorerrorerror');

      return error;
    }
  }

  // async findallV3(hospital_id: number, limit: number, page: number) {
  //   const offset = limit * (page - 1);

  //   const staffList = await this.dynamicConnection.query(
  //     `SELECT id, name, surname, email, image, work_exp, employee_id, specialist
  //    FROM staff
  //    WHERE is_deleted = 0 AND is_active = 1
  //    LIMIT ? OFFSET ?`,
  //     [Number(limit), Number(offset)],
  //   );

  //   const [getHosTimings] = await this.connection.query(
  //     `SELECT hospital_opening_timing, hospital_closing_timing, hospital_name
  //    FROM hospitals WHERE plenome_id = ?`,
  //     [hospital_id],
  //   );

  //   const hosTiming = `${getHosTimings.hospital_opening_timing} - ${getHosTimings.hospital_closing_timing}`;

  //   for (const staff of staffList) {
  //     const [ratingResult] = await this.connection.query(
  //       `SELECT ROUND(AVG(rating), 1) AS rating
  //      FROM staff_rating WHERE staff_id = ?`,
  //       [staff.id],
  //     );
  //     staff.rating = ratingResult?.rating ?? 0;

  //     const [chargeDetail] = await this.dynamicConnection.query(
  //       `SELECT charge_id FROM shift_details WHERE staff_id = ?`,
  //       [staff.id],
  //     );
  //     staff.charge_id = chargeDetail?.charge_id ?? null;

  //     if (staff.charge_id) {
  //       const [chargeInfo] = await this.dynamicConnection.query(
  //         `SELECT standard_charge, tax_category.percentage
  //        FROM charges
  //        LEFT JOIN tax_category ON tax_category.id = charges.tax_category_id
  //        WHERE charges.id = ?`,
  //         [staff.charge_id],
  //       );

  //       const standard_charge = parseFloat(chargeInfo?.standard_charge ?? 0);
  //       const tax_percentage = parseFloat(chargeInfo?.percentage ?? 0);
  //       const tax = (standard_charge * tax_percentage) / 100;

  //       staff.standard_charge = standard_charge;
  //       staff.tax_percentage = tax_percentage;
  //       staff.tax = tax;
  //       staff.Totalamount = standard_charge + tax;
  //     } else {
  //       staff.standard_charge = null;
  //       staff.tax_percentage = null;
  //       staff.tax = null;
  //       staff.Totalamount = null;
  //     }

  //     if (staff.specialist) {
  //       for (let i = 0; i < staff.specialist.length; i++) {
  //         const id = staff.specialist[i];
  //         if (typeof id === 'number') {
  //           try {
  //             const [specialistRow] = await this.dynamicConnection.query(
  //               `SELECT specialist_name FROM specialist WHERE id = ?`,
  //               [id],
  //             );
  //             if (specialistRow) {
  //               staff.specialist[i] = specialistRow.specialist_name;
  //             }
  //           } catch (err) {
  //             console.error('Error fetching specialist name:', err);
  //           }
  //         }
  //       }
  //     }
  //   }

  //   // 4. Total count (for pagination)
  //   const [countResult] = await this.dynamicConnection.query(
  //     `SELECT COUNT(id) AS total FROM staff WHERE is_deleted = 0 AND is_active = 1`,
  //   );

  //   // 5. Final output
  //   return {
  //     details: staffList,
  //     count: countResult?.total ?? 0,
  //     hospital_opening_timing: hosTiming,
  //     hospital_name: getHosTimings.hospital_name,
  //   };
  // }

  async findallV3(hospital_id: number, limit: number, page: number) {
    const offset = limit * (page - 1);
    try {
      // 1. Fetch paginated staff list
      const staffList: any[] = await this.dynamicConnection.query(
        `SELECT id, name, surname, email, image, work_exp, employee_id, specialist
     FROM staff
     WHERE is_deleted = 0 AND is_active = 1
     LIMIT ? OFFSET ?`,
        [Number(limit), Number(offset)],
      );

      // 2. Fetch hospital timings
      const [getHosTimings]: any = await this.connection.query(
        `SELECT hospital_opening_timing, hospital_closing_timing, hospital_name
     FROM hospitals WHERE plenome_id = ?`,
        [hospital_id],
      );

      const hosTiming = `${getHosTimings.hospital_opening_timing} - ${getHosTimings.hospital_closing_timing}`;

      // 3. Collect staff IDs and charge IDs
      const staffIds = staffList.map((staff) => staff.id);
      const chargeMap = new Map<number, any>();

      const shiftDetails = await this.dynamicConnection.query(
        `SELECT staff_id, charge_id FROM shift_details WHERE staff_id IN (?)`,
        [staffIds],
      );
      const chargeInfoMap = new Map<number, any>();

      if (shiftDetails.length) {
        shiftDetails.forEach((row: any) =>
          chargeMap.set(row.staff_id, row.charge_id),
        );

        // 4. Collect charge IDs
        const chargeIds = [
          ...new Set(shiftDetails.map((row: any) => row.charge_id)),
        ];
        const chargeInfoList = await this.dynamicConnection.query(
          `SELECT charges.id, standard_charge, tax_category.percentage AS percentage
     FROM charges
     LEFT JOIN tax_category ON tax_category.id = charges.tax_category_id
     WHERE charges.id IN (?)`,
          [chargeIds],
        );

        chargeInfoList.forEach((c: any) => chargeInfoMap.set(c.id, c));
      }
      // 5. Fetch ratings in parallel
      const ratingList = await this.connection.query(
        `SELECT staff_id, ROUND(AVG(rating), 1) AS rating
     FROM staff_rating
     WHERE staff_id IN (?)
     GROUP BY staff_id`,
        [staffIds],
      );

      const ratingMap = new Map<number, number>();
      ratingList.forEach((r: any) => ratingMap.set(r.staff_id, r.rating));

      // 6. Collect all specialist IDs
      const allSpecialistIds: number[] = [];
      staffList.forEach((staff) => {
        if (Array.isArray(staff.specialist)) {
          allSpecialistIds.push(
            ...staff.specialist.filter((id: any) => typeof id === 'number'),
          );
        }
      });

      const specialistInfo = await this.dynamicConnection.query(
        `SELECT id, specialist_name FROM specialist WHERE id IN (?)`,
        [allSpecialistIds],
      );
      const specialistMap = new Map<number, string>();
      specialistInfo.forEach((s: any) =>
        specialistMap.set(s.id, s.specialist_name),
      );

      // 7. Assign data to staffList
      staffList.forEach((staff) => {
        const chargeId = chargeMap.get(staff.id);
        staff.charge_id = chargeId ?? null;

        const rating = ratingMap.get(staff.id);
        staff.rating = rating ?? 0;

        if (chargeId && chargeInfoMap.has(chargeId)) {
          const { standard_charge, percentage } = chargeInfoMap.get(chargeId);
          const std = parseFloat(standard_charge);
          const pct = parseFloat(percentage ?? 0);
          const tax = (std * pct) / 100;

          staff.standard_charge = std;
          staff.tax_percentage = pct;
          staff.tax = tax;
          staff.Totalamount = std + tax;
        } else {
          staff.standard_charge = null;
          staff.tax_percentage = null;
          staff.tax = null;
          staff.Totalamount = null;
        }

        if (Array.isArray(staff.specialist)) {
          staff.specialist = staff.specialist.map((id: any) =>
            typeof id === 'number' ? specialistMap.get(id) ?? id : id,
          );
        }
      });

      // 8. Count query
      const [countResult]: any = await this.dynamicConnection.query(
        `SELECT COUNT(id) AS total FROM staff WHERE is_deleted = 0 AND is_active = 1`,
      );

      // 9. Final response
      return {
        details: staffList,
        count: countResult?.total ?? 0,
        hospital_opening_timing: hosTiming,
        hospital_name: getHosTimings.hospital_name,
      };
    } catch (error) {
      console.log('error', error, 'err');
    }
  }
  async getDocName(limit: number, page: number) {
    const docName = await this.dynamicConnection.query(
      `select name,surname from staff where is_deleted = 0 and is_active = 1 limit ${limit} offset ${
        limit * (page - 1)
      }`,
    );
    return docName;
  }
}
