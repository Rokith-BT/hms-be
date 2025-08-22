import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Pharmacy } from './entities/pharmacy.entity';

@Injectable()
export class PharmacyService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async create(createPharmacy: Pharmacy) {
    try {
      const addPharmacy = await this.connection.query(
        `INSERT into pharmacy(
          medicine_name,
          medicine_category_id,
          medicine_image,
          medicine_company,
          medicine_composition,
          medicine_group,
          unit,
          min_level,
          reorder_level,
          vat,
          unit_packing,
          vat_ac,
          note,
          is_active
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          createPharmacy.medicine_name,
          createPharmacy.medicine_category_id,
          createPharmacy.medicine_image,
          createPharmacy.medicine_company,
          createPharmacy.medicine_composition,
          createPharmacy.medicine_group,
          createPharmacy.unit,
          createPharmacy.min_level,
          createPharmacy.reorder_level,
          createPharmacy.vat,
          createPharmacy.unit_packing,
          createPharmacy.vat_ac,
          createPharmacy.note,
          createPharmacy.is_active,
        ],
      );

      const addedPharmacyId = addPharmacy.insertId;

      const [dynmedcategory] = await this.dynamicConnection.query(
        'SELECT id FROM medicine_category WHERE hospital_medicine_category_id = ?',
        [createPharmacy.medicine_category_id],
      );
      const Yourmedcateid = dynmedcategory.id;

      await this.dynamicConnection.query(
        `INSERT into pharmacy(
          medicine_name,
          medicine_category_id,
          medicine_image,
          medicine_company,
          medicine_composition,
          medicine_group,
          unit,
          min_level,
          reorder_level,
          vat,
          unit_packing,
          vat_ac,
          note,
          is_active,
          Hospital_id,
          hos_pharmacy_id
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          createPharmacy.medicine_name,
          Yourmedcateid,
          createPharmacy.medicine_image,
          createPharmacy.medicine_company,
          createPharmacy.medicine_composition,
          createPharmacy.medicine_group,
          createPharmacy.unit,
          createPharmacy.min_level,
          createPharmacy.reorder_level,
          createPharmacy.vat,
          createPharmacy.unit_packing,
          createPharmacy.vat_ac,
          createPharmacy.note,
          createPharmacy.is_active,
          createPharmacy.Hospital_id,
          addedPharmacyId,
        ],
      );

      return [
        {
          'data ': {
            status: 'success',
            messege: 'Pharmacy notes added successfully ',
            Added_Pharmacy_Values: await this.connection.query(
              'SELECT * FROM pharmacy WHERE id = ?',
              [addedPharmacyId],
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

  async update(id: number, createPharmacy: Pharmacy) {
    try {
      await this.connection.query(
        `UPDATE pharmacy SET
        medicine_name=?,
        medicine_category_id=?,
        medicine_image=?,
        medicine_company=?,
        medicine_composition=?,
        medicine_group=?,
        unit=?,
        min_level=?,
        reorder_level=?,
        vat=?,
        unit_packing=?,
        vat_ac=?,
        note=?
          WHERE id = ?
        `,
        [
          createPharmacy.medicine_name,
          createPharmacy.medicine_category_id,
          createPharmacy.medicine_image,
          createPharmacy.medicine_company,
          createPharmacy.medicine_composition,
          createPharmacy.medicine_group,
          createPharmacy.unit,
          createPharmacy.min_level,
          createPharmacy.reorder_level,
          createPharmacy.vat,
          createPharmacy.unit_packing,
          createPharmacy.vat_ac,
          createPharmacy.note,
          id,
        ],
      );
      const [Pharmadynnidd] = await this.dynamicConnection.query(
        `SELECT id from pharmacy WHERE hos_pharmacy_id = ? and Hospital_id = ?`,
        [id, createPharmacy.Hospital_id],
      );
      const getdynpharma = Pharmadynnidd.id;

      const [dynmedcategory] = await this.dynamicConnection.query(
        'SELECT id FROM medicine_category WHERE hospital_medicine_category_id = ? and Hospital_id = ?',
        [createPharmacy.medicine_category_id, createPharmacy.Hospital_id],
      );
      const Yourmedcateid = dynmedcategory.id;
      await this.dynamicConnection.query(
        `UPDATE pharmacy SET
        medicine_name=?,
        medicine_category_id=?,
        medicine_image=?,
        medicine_company=?,
        medicine_composition=?,
        medicine_group=?,
        unit=?,
        min_level=?,
        reorder_level=?,
        vat=?,
        unit_packing=?,
        vat_ac=?,
        note=?,
        Hospital_id=?
          WHERE id = ?
        `,
        [
          createPharmacy.medicine_name,
          Yourmedcateid,
          createPharmacy.medicine_image,
          createPharmacy.medicine_company,
          createPharmacy.medicine_composition,
          createPharmacy.medicine_group,
          createPharmacy.unit,
          createPharmacy.min_level,
          createPharmacy.reorder_level,
          createPharmacy.vat,
          createPharmacy.unit_packing,
          createPharmacy.vat_ac,
          createPharmacy.note,
          createPharmacy.Hospital_id,
          getdynpharma,
        ],
      );
      return [
        {
          'data ': {
            status: 'success',
            messege: 'Pharmacy details updated successfully ',
            updated_values: await this.connection.query(
              'SELECT * FROM pharmacy WHERE id = ?',
              [id],
            ),
          },
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

  async removePharmacy(
    id: number,
    Hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query(
        'DELETE FROM medicine_bad_stock WHERE pharmacy_id = ?',
        [id],
      );
      await this.connection.query(
        'DELETE FROM medicine_batch_details WHERE pharmacy_id = ?',
        [id],
      );
      await this.connection.query('DELETE FROM pharmacy WHERE id = ?', [id]);

      const [dynamicDeletedPharma] = await this.dynamicConnection.query(
        'SELECT id FROM pharmacy WHERE hos_pharmacy_id= ?',
        [id],
      );
      const dynamicDeletedPharmaidd = dynamicDeletedPharma.id;

      await this.dynamicConnection.query(
        'DELETE FROM medicine_bad_stock WHERE pharmacy_id = ? AND hospital_id = ?',
        [dynamicDeletedPharmaidd, Hospital_id],
      );
      await this.dynamicConnection.query(
        'DELETE FROM medicine_batch_details WHERE pharmacy_id = ? AND hospital_id = ?',
        [dynamicDeletedPharmaidd, Hospital_id],
      );
      await this.dynamicConnection.query(
        'DELETE FROM pharmacy WHERE id = ? AND Hospital_id = ?',
        [dynamicDeletedPharmaidd, Hospital_id],
      );

      return [
        {
          status: 'success',
          message: `Pharmacy with id: ${id} and associated entries in the dynamic database have been deleted.`,
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

  async findAll(): Promise<Pharmacy[]> {
    const getMedicineStock = await this.connection.query(`SELECT 
    pharmacy.id,
    pharmacy.medicine_name AS MedicineName,
    pharmacy.medicine_company AS MedicineCompany,
    pharmacy.medicine_composition AS MedicineComposition,
    medicine_category.medicine_category AS MedicineCategory,
    pharmacy.medicine_group AS MedicineGroup,
    pharmacy.unit AS Unit,
    pharmacy_bill_detail.medicine_batch_detail_id,
    
    -- Calculate available quantity
    (COALESCE(SUM(medicine_batch_details.quantity), 0) - COALESCE(SUM(pharmacy_bill_detail.quantity), 0)) AS AvailableQuantity,
    
    -- Concatenate AvailableQuantity and StockStatus
    CONCAT(
        (COALESCE(SUM(medicine_batch_details.quantity), 0) - COALESCE(SUM(pharmacy_bill_detail.quantity), 0)), 
        ' (',
        CASE 
            WHEN (COALESCE(SUM(medicine_batch_details.quantity), 0) - COALESCE(SUM(pharmacy_bill_detail.quantity), 0)) <= 0 THEN 'Out of Stock'
            WHEN (COALESCE(SUM(medicine_batch_details.quantity), 0) - COALESCE(SUM(pharmacy_bill_detail.quantity), 0)) <= pharmacy.min_level THEN 'Low Stock'
            WHEN (COALESCE(SUM(medicine_batch_details.quantity), 0) - COALESCE(SUM(pharmacy_bill_detail.quantity), 0)) <= pharmacy.reorder_level THEN 'Reorder Stock'
            ELSE 'In Stock'
        END,
        ')'
    ) AS AvailableQuantityWithStatus
    
FROM 
    pharmacy 
LEFT JOIN 
    medicine_category ON pharmacy.medicine_category_id = medicine_category.id
LEFT JOIN 
    medicine_batch_details ON pharmacy.id = medicine_batch_details.pharmacy_id
LEFT JOIN 
    pharmacy_bill_detail ON medicine_batch_details.id = pharmacy_bill_detail.medicine_batch_detail_id

GROUP BY 
    pharmacy.id, 
    pharmacy.medicine_name, 
    pharmacy.medicine_company, 
    pharmacy.medicine_composition, 
    medicine_category.medicine_category, 
    pharmacy.medicine_group, 
    pharmacy.unit, 
    pharmacy.min_level, 
    pharmacy.reorder_level, 
    pharmacy_bill_detail.medicine_batch_detail_id `);
    return getMedicineStock;
  }

  async findMedicineStock(search: string): Promise<Pharmacy[]> {
    let query = `SELECT 
    pharmacy.id,
    pharmacy.medicine_name AS MedicineName,
    pharmacy.medicine_company AS MedicineCompany,
    pharmacy.medicine_composition AS MedicineComposition,
    medicine_category.medicine_category AS MedicineCategory,
    pharmacy.medicine_group AS MedicineGroup,
    pharmacy.unit AS Unit,
    pharmacy_bill_detail.medicine_batch_detail_id,
    
    -- Calculate available quantity
    (COALESCE(SUM(medicine_batch_details.quantity), 0) - COALESCE(SUM(pharmacy_bill_detail.quantity), 0)) AS AvailableQuantity,
    
    -- Concatenate AvailableQuantity and StockStatus
    CONCAT(
        (COALESCE(SUM(medicine_batch_details.quantity), 0) - COALESCE(SUM(pharmacy_bill_detail.quantity), 0)), 
        ' (',
        CASE 
            WHEN (COALESCE(SUM(medicine_batch_details.quantity), 0) - COALESCE(SUM(pharmacy_bill_detail.quantity), 0)) <= 0 THEN 'Out of Stock'
            WHEN (COALESCE(SUM(medicine_batch_details.quantity), 0) - COALESCE(SUM(pharmacy_bill_detail.quantity), 0)) <= pharmacy.min_level THEN 'Low Stock'
            WHEN (COALESCE(SUM(medicine_batch_details.quantity), 0) - COALESCE(SUM(pharmacy_bill_detail.quantity), 0)) <= pharmacy.reorder_level THEN 'Reorder Stock'
            ELSE 'In Stock'
        END,
        ')'
    ) AS AvailableQuantityWithStatus
    
FROM 
    pharmacy 
LEFT JOIN 
    medicine_category ON pharmacy.medicine_category_id = medicine_category.id
LEFT JOIN 
    medicine_batch_details ON pharmacy.id = medicine_batch_details.pharmacy_id
LEFT JOIN 
    pharmacy_bill_detail ON medicine_batch_details.id = pharmacy_bill_detail.medicine_batch_detail_id `;

    let values = [];

    if (search) {
      query += ` WHERE (pharmacy.medicine_name like ? 
      or pharmacy.medicine_company like ? 
      or pharmacy.medicine_composition like ? 
      or medicine_category.medicine_category like ? 
      or pharmacy.medicine_group like ?
      or pharmacy.unit like ?
    
      )`;
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
    }

    let last = ` GROUP BY 
   pharmacy.id, 
   pharmacy.medicine_name, 
   pharmacy.medicine_company, 
   pharmacy.medicine_composition, 
   medicine_category.medicine_category, 
   pharmacy.medicine_group, 
   pharmacy.unit, 
   pharmacy.min_level, 
   pharmacy.reorder_level, 
   pharmacy_bill_detail.medicine_batch_detail_id`;

    let final = query + last;

    const medicineSearch = await this.connection.query(final, values);
    return medicineSearch;
  }

  async findPharmacyById(id: number): Promise<Pharmacy> {
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
      const getPharmacy = await this.connection.query(
        `SELECT pharmacy.id,pharmacy.medicine_name AS MedicineName,pharmacy.medicine_company AS MedicineCompany,
    pharmacy.medicine_composition AS MedicineComposition,
    medicine_category.medicine_category AS MedicineCategory,
    pharmacy.medicine_group AS MedicineGroup,pharmacy.unit AS Unit,
    pharmacy.min_level AS MinLevel,
    pharmacy.vat AS VAT,
    pharmacy.vat_ac AS VATac,
    pharmacy.reorder_level AS ReorderLevel,
    pharmacy.unit_packing AS UnitPacking
    FROM pharmacy
    LEFT JOIN medicine_category ON pharmacy.medicine_category_id = medicine_category.id
    WHERE pharmacy.id = ? `,
        [id],
      );
      return getPharmacy;
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

  async findOne(id: string): Promise<Pharmacy | null> {
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
      const getPharmaMedicinedetails = await this.connection.query(
        `SELECT pharmacy.id,pharmacy.medicine_name AS MedicineName,pharmacy.medicine_company AS MedicineCompany,
      pharmacy.medicine_composition AS MedicineComposition,
      medicine_category.medicine_category AS MedicineCategory,
      pharmacy.medicine_group AS MedicineGroup,pharmacy.unit AS Unit,
      pharmacy.min_level AS MinLevel,
      pharmacy.vat AS VAT,
      pharmacy.vat_ac AS VATac,
      pharmacy.reorder_level AS ReorderLevel,
      pharmacy.unit_packing AS UnitPacking
      FROM pharmacy
      LEFT JOIN medicine_category ON pharmacy.medicine_category_id = medicine_category.id
      WHERE pharmacy.id = ? `,
        [id],
      );

      return getPharmaMedicinedetails;
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

  async findGoodMedicineStock(id: string): Promise<Pharmacy | null> {
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
      const getGoodStock = await this.connection.query(
        `select 
      medicine_batch_details.pharmacy_id,
      medicine_batch_details.inward_date AS InwardDate,
      medicine_batch_details.batch_no AS BatchNo,
      medicine_batch_details.expiry AS ExpiryDate,
      medicine_batch_details.packing_qty AS PackingQuantity,
      medicine_batch_details.purchase_price AS PurchaseRate,
      medicine_batch_details.amount AS Amount,
      medicine_batch_details.quantity AS Quantity,
      medicine_batch_details.mrp AS MRP,
      medicine_batch_details.sale_rate AS SalePrice
      FROM medicine_batch_details
      WHERE medicine_batch_details.pharmacy_id = ? `,
        [id],
      );

      return getGoodStock;
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

  async findBadMedicineStock(id: string): Promise<Pharmacy | null> {
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
      const getBadStock = await this.connection.query(
        `select 
      medicine_bad_stock.pharmacy_id,
      medicine_bad_stock.outward_date AS OutwardDate,
      medicine_bad_stock.batch_no AS BatchNo,
      medicine_bad_stock.expiry_date AS ExpiryDate,
      medicine_bad_stock.quantity AS Quantity
      FROM medicine_bad_stock
      WHERE medicine_bad_stock.pharmacy_id = ? `,
        [id],
      );
      return getBadStock;
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

  async createBadMedicineStock(createPharmacy: Pharmacy) {
    try {
      const addBadStock = await this.connection.query(
        `INSERT into medicine_bad_stock(
          medicine_batch_details_id,
          pharmacy_id,
          outward_date,
          expiry_date,
          batch_no,
          quantity,
          note
        ) VALUES (?,?,?,?,?,?,?)`,
        [
          createPharmacy.medicine_batch_details_id,
          createPharmacy.pharmacy_id,
          createPharmacy.outward_date,
          createPharmacy.expiry_date,
          createPharmacy.batch_no,
          createPharmacy.quantity,
          createPharmacy.note,
        ],
      );

      const addedBadStockId = addBadStock.insertId;

      const [dynmedBatchDetails] = await this.dynamicConnection.query(
        'SELECT id FROM medicine_batch_details WHERE hos_medicine_batch_details_id = ? and hospital_id = ?',
        [createPharmacy.medicine_batch_details_id, createPharmacy.Hospital_id],
      );
      const dynmedBatchDetailsId = dynmedBatchDetails.id;
      const [dynPharma] = await this.dynamicConnection.query(
        'SELECT id FROM pharmacy WHERE hos_pharmacy_id = ? and Hospital_id = ?',
        [createPharmacy.pharmacy_id, createPharmacy.Hospital_id],
      );
      const dynPharmaID = dynPharma.id;
      await this.dynamicConnection.query(
        `INSERT into medicine_bad_stock(
          medicine_batch_details_id,
          pharmacy_id,
          outward_date,
          expiry_date,
          batch_no,
          quantity,
          note,
          hospital_id,
          hos_medicine_bad_stock_id
        ) VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          dynmedBatchDetailsId,
          dynPharmaID,
          createPharmacy.outward_date,
          createPharmacy.expiry_date,
          createPharmacy.batch_no,
          createPharmacy.quantity,
          createPharmacy.note,
          createPharmacy.Hospital_id,
          addedBadStockId,
        ],
      );
      return [
        {
          'data ': {
            status: 'success',
            messege: 'Medicine bad stock added successfully ',
            Added_medicine_bad_stock_Values: await this.connection.query(
              'SELECT * FROM medicine_bad_stock WHERE id = ?',
              [addedBadStockId],
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

  async DeleteBadMedicineStock(
    id: number,
    hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM medicine_bad_stock WHERE id = ?',
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
      await this.connection.query(
        'DELETE FROM medicine_bad_stock WHERE id = ?',
        [id],
      );
      await this.dynamicConnection.query(
        'DELETE FROM medicine_bad_stock WHERE hos_medicine_bad_stock_id = ? AND hospital_id = ?',
        [id, hospital_id],
      );

      return [
        {
          status: 'success',
          message: `Medicine bad stock with id: ${id} and associated entries in the dynamic database have been deleted.`,
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

  async removeGoodMedicine(
    id: number,
    hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {

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
      await this.connection.query(
        'DELETE FROM medicine_batch_details WHERE id = ?',
        [id],
      );

      await this.dynamicConnection.query(
        'DELETE FROM medicine_batch_details WHERE hos_medicine_batch_details_id = ? AND hospital_id = ?',
        [id, hospital_id],
      );
      return [
        {
          status: 'success',
          message: `Good Medicine stock with id: ${id} and associated entries in the dynamic database have been deleted.`,
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
}
