import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PurchaseMedicine } from './entities/purchase_medicine.entity';

@Injectable()
export class PurchaseMedicineService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async create(createPurchaseMedicine: PurchaseMedicine) {
    try {
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createPurchaseMedicine.received_by],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `Staff with id: ${createPurchaseMedicine.received_by} not found.`,
        );
      }
      const docemail = staffId.email;
      const addSupplierBillBasic = await this.connection.query(
        `INSERT into supplier_bill_basic(
          invoice_no,
          date,
          supplier_id,
          file,
          total,
          tax,
          discount,
          net_amount,
          note,
          payment_mode,
          cheque_no,
          cheque_date,
          payment_date,
          received_by,
          attachment,
          attachment_name,
          payment_note
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          createPurchaseMedicine.invoice_no,
          createPurchaseMedicine.date,
          createPurchaseMedicine.supplier_id,
          createPurchaseMedicine.file,
          createPurchaseMedicine.total,
          createPurchaseMedicine.tax,
          createPurchaseMedicine.discount,
          createPurchaseMedicine.net_amount,
          createPurchaseMedicine.note,
          createPurchaseMedicine.payment_mode,
          createPurchaseMedicine.cheque_no,
          createPurchaseMedicine.cheque_date,
          createPurchaseMedicine.payment_date,
          createPurchaseMedicine.received_by,
          createPurchaseMedicine.attachment,
          createPurchaseMedicine.attachment_name,
          createPurchaseMedicine.payment_note,
        ],
      );

      const addedsupplierBillbasicId = addSupplierBillBasic.insertId;
      const [dynamicUpdateStaff] = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff.id;
      const [dynMedicineSupplier] = await this.dynamicConnection.query(
        'SELECT id FROM medicine_supplier WHERE hospital_medicine_supplier_id = ? and Hospital_id = ?',
        [
          createPurchaseMedicine.supplier_id,
          createPurchaseMedicine.hospital_id,
        ],
      );
      const dynmedicineSupplierId = dynMedicineSupplier.id;
      await this.dynamicConnection.query(
        `INSERT into supplier_bill_basic(
          invoice_no,
          date,
          supplier_id,
          file,
          total,
          tax,
          discount,
          net_amount,
          note,
          payment_mode,
          cheque_no,
          cheque_date,
          payment_date,
          received_by,
          attachment,
          attachment_name,
          payment_note,
          hos_supplier_bill_basic_id,
          hospital_id
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          createPurchaseMedicine.invoice_no,
          createPurchaseMedicine.date,
          dynmedicineSupplierId,
          createPurchaseMedicine.file,
          createPurchaseMedicine.total,
          createPurchaseMedicine.tax,
          createPurchaseMedicine.discount,
          createPurchaseMedicine.net_amount,
          createPurchaseMedicine.note,
          createPurchaseMedicine.payment_mode,
          createPurchaseMedicine.cheque_no,
          createPurchaseMedicine.cheque_date,
          createPurchaseMedicine.payment_date,
          dynamicUPTDStaffId,
          createPurchaseMedicine.attachment,
          createPurchaseMedicine.attachment_name,
          createPurchaseMedicine.payment_note,
          addedsupplierBillbasicId,
          createPurchaseMedicine.hospital_id,
        ],
      );
      return [
        {
          'data ': {
            status: 'success',
            message: 'Purchase medicine added successfully ',
            Purchase_medicine_Values: await this.connection.query(
              'SELECT * FROM supplier_bill_basic WHERE id = ?',
              [addedsupplierBillbasicId],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createMedicineBatchDetails(createPurchaseMedicine: PurchaseMedicine[]) {
    try {
      const results = [];

      for (const medicine_batch_detailsEntity of createPurchaseMedicine) {
        const result = await this.connection.query(
          'INSERT into medicine_batch_details(supplier_bill_basic_id,pharmacy_id,inward_date,expiry,batch_no,packing_qty,purchase_rate_packing,quantity,mrp,purchase_price,tax,sale_rate,batch_amount,amount,available_quantity) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
          [
            medicine_batch_detailsEntity.supplier_bill_basic_id,
            medicine_batch_detailsEntity.pharmacy_id,
            medicine_batch_detailsEntity.inward_date,
            medicine_batch_detailsEntity.expiry,
            medicine_batch_detailsEntity.batch_no,
            medicine_batch_detailsEntity.packing_qty,
            medicine_batch_detailsEntity.purchase_rate_packing,
            medicine_batch_detailsEntity.quantity,
            medicine_batch_detailsEntity.mrp,
            medicine_batch_detailsEntity.purchase_price,
            medicine_batch_detailsEntity.tax,
            medicine_batch_detailsEntity.sale_rate,
            medicine_batch_detailsEntity.batch_amount,
            medicine_batch_detailsEntity.amount,
            medicine_batch_detailsEntity.available_quantity,
          ],
        );

        const [supplierBillBasic] = await this.dynamicConnection.query(
          `select id from supplier_bill_basic where hospital_id = ? and  hos_supplier_bill_basic_id = ?`,
          [
            medicine_batch_detailsEntity.hospital_id,
            medicine_batch_detailsEntity.supplier_bill_basic_id,
          ],
        );

        const [dynPharmacy] = await this.dynamicConnection.query(
          'SELECT id FROM pharmacy WHERE hos_pharmacy_id = ? and Hospital_id = ?',
          [
            medicine_batch_detailsEntity.pharmacy_id,
            medicine_batch_detailsEntity.hospital_id,
          ],
        );
        const dynPharmacyId = dynPharmacy.id;
        await this.dynamicConnection.query(
          'INSERT into medicine_batch_details(supplier_bill_basic_id,pharmacy_id,inward_date,expiry,batch_no,packing_qty,purchase_rate_packing,quantity,mrp,purchase_price,tax,sale_rate,batch_amount,amount,available_quantity,hospital_id,hos_medicine_batch_details_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
          [
            supplierBillBasic.id,
            dynPharmacyId,
            medicine_batch_detailsEntity.inward_date,
            medicine_batch_detailsEntity.expiry,
            medicine_batch_detailsEntity.batch_no,
            medicine_batch_detailsEntity.packing_qty,
            medicine_batch_detailsEntity.purchase_rate_packing,
            medicine_batch_detailsEntity.quantity,
            medicine_batch_detailsEntity.mrp,
            medicine_batch_detailsEntity.purchase_price,
            medicine_batch_detailsEntity.tax,
            medicine_batch_detailsEntity.sale_rate,
            medicine_batch_detailsEntity.batch_amount,
            medicine_batch_detailsEntity.amount,
            medicine_batch_detailsEntity.available_quantity,
            medicine_batch_detailsEntity.hospital_id,
            result.insertId,
          ],
        );
        const pharmacyBillDetail = await this.connection.query(
          'SELECT * FROM medicine_batch_details where id = ?',
          [result.insertId],
        );
        results.push({
          status: 'success',
          message: 'Medicine batch details added successfully',
          pharmacyBillDetail: pharmacyBillDetail[0],
          originalInsertId: result.insertId,
        });
      }
      return {
        status: 'success',
        message: 'All pharmacy bill details added successfully',
        data: results,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<PurchaseMedicine[]> {
    const getPurchaseMedicineDetails = await this.connection
      .query(`select medicine_batch_details.id,concat('PHPN',"",medicine_batch_details.supplier_bill_basic_id) AS PharmacyPurchaseNo,
    medicine_batch_details.inward_date AS PurchaseDate,
    supplier_bill_basic.invoice_no AS BillNo,
    medicine_supplier.supplier AS SupplierName,supplier_bill_basic.total AS Total,
    supplier_bill_basic.tax AS Tax,
    supplier_bill_basic.discount AS Discount,supplier_bill_basic.net_amount AS NetAmount
    FROM medicine_batch_details
    LEFT JOIN supplier_bill_basic ON supplier_bill_basic.id = medicine_batch_details.supplier_bill_basic_id
    LEFT JOIN medicine_supplier ON medicine_supplier.id = supplier_bill_basic.supplier_id`);

    return getPurchaseMedicineDetails;
  }

  async findPurchaseMedicine(search: string): Promise<PurchaseMedicine[]> {
    let query = ` select medicine_batch_details.id,concat('PHPN',"",medicine_batch_details.supplier_bill_basic_id) AS PharmacyPurchaseNo,medicine_batch_details.inward_date AS PurchaseDate,
    supplier_bill_basic.invoice_no AS BillNo,
    medicine_supplier.supplier AS SupplierName,supplier_bill_basic.total AS Total,
    supplier_bill_basic.tax AS Tax,
    supplier_bill_basic.discount AS Discount,
    supplier_bill_basic.net_amount AS NetAmount
    FROM medicine_batch_details
    LEFT JOIN supplier_bill_basic ON supplier_bill_basic.id = medicine_batch_details.supplier_bill_basic_id
    LEFT JOIN medicine_supplier ON medicine_supplier.id = supplier_bill_basic.supplier_id `;

    let values = [];

    if (search) {
      query += `  where (concat('PHPN',"",medicine_batch_details.supplier_bill_basic_id) like ? or medicine_batch_details.supplier_bill_basic_id like ? or medicine_batch_details.inward_date like ? or supplier_bill_basic.invoice_no like ? or medicine_supplier.supplier like ? or supplier_bill_basic.total like ? or supplier_bill_basic.tax like ? or supplier_bill_basic.discount like ? or supplier_bill_basic.net_amount like ?)`;
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
    }

    let final = query;

    const medicinePurchaseSearch = await this.connection.query(final, values);

    return medicinePurchaseSearch;
  }

  async findOne(id: string): Promise<PurchaseMedicine | null> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM medicine_batch_details WHERE id = ?',
      [id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: 'NOT FOUND',
          message: `ID ${id} does not exist or has already been `,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const getPurchaseMedicinedetails = await this.connection.query(
        `select medicine_batch_details.id,
      concat('PHPN',"",medicine_batch_details.supplier_bill_basic_id) AS PharmacyPurchaseNo,
      medicine_batch_details.inward_date AS PurchaseDate,
      supplier_bill_basic.invoice_no AS BillNo,
      medicine_supplier.supplier AS SupplierName,
      medicine_supplier.contact AS Contact,
      medicine_supplier.supplier_person AS ContactPerson,
      medicine_supplier.address AS Address,
      medicine_category.medicine_category AS MedicineCategory,
      pharmacy.medicine_name AS MedicineName,
      medicine_batch_details.batch_no AS BatchNo,
      medicine_batch_details.expiry AS ExpiryDate,
      medicine_batch_details.mrp AS MRP,
      medicine_batch_details.batch_amount AS BatchAmount,
      medicine_batch_details.sale_rate AS SalePrice,
      medicine_batch_details.packing_qty AS PackingQty,
      medicine_batch_details.quantity AS Quantity,
      medicine_batch_details.tax AS MedicineTax,
      medicine_batch_details.purchase_price AS PurchasePrice,
      medicine_batch_details.amount AS Amount,
      supplier_bill_basic.total AS Total,
      supplier_bill_basic.tax as Tax,
      supplier_bill_basic.discount AS Discount,
      supplier_bill_basic.net_amount AS NetAmount,
      supplier_bill_basic.note AS Note,
      supplier_bill_basic.payment_mode AS PaymentMode,
      supplier_bill_basic.payment_note AS PaymentNote
      FROM medicine_batch_details
      LEFT JOIN supplier_bill_basic ON supplier_bill_basic.id = medicine_batch_details.supplier_bill_basic_id
      LEFT JOIN medicine_supplier ON medicine_supplier.id = supplier_bill_basic.supplier_id
      LEFT JOIN pharmacy ON pharmacy.id = medicine_batch_details.pharmacy_id
      LEFT JOIN medicine_category ON medicine_category.id = pharmacy.medicine_category_id
      WHERE medicine_batch_details.id = ? `,
        [id],
      );

      return getPurchaseMedicinedetails;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removePurchaseMedicine(
    id: number,
    hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query(
        'DELETE FROM supplier_bill_basic WHERE id = ?',
        [id],
      );
      await this.connection.query(
        'DELETE FROM medicine_batch_details WHERE supplier_bill_basic_id = ?',
        [id],
      );

      let dynamicDeletedPurchaseMedicineId;

      const [dynamicDeletedPurchase] = await this.dynamicConnection.query(
        'SELECT id FROM supplier_bill_basic WHERE hos_supplier_bill_basic_id= ? and hospital_id = ?',
        [id, hospital_id],
      );
      dynamicDeletedPurchaseMedicineId = dynamicDeletedPurchase.id;

      await this.dynamicConnection.query(
        'DELETE FROM supplier_bill_basic WHERE id = ? AND hospital_id = ?',
        [dynamicDeletedPurchaseMedicineId, hospital_id],
      );
      await this.dynamicConnection.query(
        'DELETE FROM medicine_batch_details WHERE supplier_bill_basic_id = ? AND hospital_id = ?',
        [dynamicDeletedPurchaseMedicineId, hospital_id],
      );

      return [
        {
          status: 'success',
          message: `Purchase Medicine with id: ${id} and associated entries in the dynamic database have been deleted.`,
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async findMedicineSupplier(): Promise<PurchaseMedicine[]> {
    const supplier = await this.connection.query(
      'SELECT id,supplier FROM medicine_supplier',
    );
    return supplier;
  }

  async findMedicineCategory(): Promise<PurchaseMedicine[]> {
    const medicine_category = await this.connection.query(
      'SELECT id,medicine_category FROM medicine_category',
    );
    return medicine_category;
  }

  async findMedicineName(id: number): Promise<PurchaseMedicine | null> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM medicine_category WHERE id = ?',
      [id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: 'NOT FOUND',
          message: `ID ${id} does not exist or has already been `,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const getMedicineName = await this.connection.query(
        `SELECT pharmacy.id,pharmacy.medicine_name AS Medicine FROM pharmacy WHERE medicine_category_id = ?`,
        [id],
      );
      return getMedicineName;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findTaxByMedicineName(id: number): Promise<PurchaseMedicine | null> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM pharmacy WHERE id = ?',
      [id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: 'NOT FOUND',
          message: `ID ${id} does not exist or has already been `,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const getMedicineTax = await this.connection.query(
        `SELECT pharmacy.id,pharmacy.medicine_name,pharmacy.vat AS Tax FROM pharmacy WHERE id = ?`,
        [id],
      );
      return getMedicineTax;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
