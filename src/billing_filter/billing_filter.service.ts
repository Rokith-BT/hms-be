import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class BillingFilterService {
  constructor(private readonly connection: DataSource) { }


  async findAll(date: string, fromDate: string, todate: string, patient_id: number, payment_method: string) {

    let query = `select transactions.id as s_no, transactions.patient_id as Patient_ID, patients.patient_name as Patient_Name, 
transactions.payment_mode as payment_method,transactions.payment_date as date from transactions
left join patients on transactions.patient_id = patients.id `

    let values = []

    if (fromDate && todate) {
      date = `date(transactions.payment_date) >= date ('` + fromDate + `') and date(transactions.payment_date) <= date ('` + todate + `')`
    } else if (fromDate) {
      date = `date(transactions.payment_date) >= date ('` + fromDate + `')`
    } else if (todate) {
      date = `date(transactions.payment_date) <= date ('` + todate + `')`
    }

    else {
      date = ` date(transactions.payment_date) < Date(Now()) `
    }

    let where = `where ` + date
    if (patient_id) {
      where += ` and transactions.patient_id = ?`
      values.push(patient_id)
    }

    if (payment_method) {
      where += ` and transactions.payment_mode = ?`
      values.push(payment_method)
    }
    let order = ` order by transactions.payment_date asc `


    let final = query + where + order

    try {
      const billing_filter = await this.connection.query(final, values);
      return billing_filter;
    } catch (error) {
      return error
    }




  }


}
