import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { PhpInventory } from "./entities/php-inventory.entity";

@Injectable()
export class PhpInventoryService {
  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }


  findAll() {
    return `This action returns all phpInventory`;
  }

  async findAllitems() {
    const getItems = await this.connection.query(`
select item.name,
item.id,
  item.unit,
  item.description,
  item_category.item_category,
  (coalesce(sum(item_stock.quantity),0)-coalesce(sum(item_issue.quantity),0)) quantityAvailable
  from item 
  left join item_category on item_category.id = item.item_category_id
  left join item_stock on item_stock.item_id = item.id
  left join item_issue on item_issue.item_id = item.id`)
    return getItems
  }

  async findAllitems_stock() {
    const getItems = await this.connection.query(`
    select 
item_stock.id,
item.name,item_category.item_category,
item_supplier.item_supplier,
item_store.item_store,
item_stock.date,
item_stock.description,
item_stock.quantity,
item_stock.purchase_price
from item_stock 
left join item on item.id = item_stock.item_id
left join item_supplier on item_supplier.id = item_stock.supplier_id
left join item_category on item_category.id = item.item_category_id
left join item_store on item_store = item_store.id = item_stock.store_id`)
    return getItems
  }

  async findAllitems_issue() {
    const getItems = await this.connection.query(`
        
select 
item_issue.id,
item.name,item_category.item_category,
concat(item_issue.issue_date," - ",item_issue.return_date) "issue-return",
concat(staff.name," ",staff.surname,"(",staff.employee_id,")") issueTo,
item_issue.issue_by,
item_issue.quantity,
case
when item_issue.is_returned = 0 then "Returned"
when item_issue.is_returned = 1 then "need to return"
end
as status
from item_issue
left join item on item.id = item_issue.item_id
left join item_category on item_category.id = item_issue.item_category_id
left join staff on staff.id = item_issue.issue_to

`)
    return getItems
  }

  async createItem(createPhpInventoryDto: PhpInventory) {
    try {
      const [getAdminItemCategoryId] = await this.dynamicConnection.query(`select id from item_category where Hospital_id = ? and hospital_item_category_id = ?`, [
        createPhpInventoryDto.hospital_id,
        createPhpInventoryDto.item_category_id
      ])
      const addItemHMS = await this.connection.query(`insert into item (name,unit,description,item_category_id,quantity) values (?,?,?,?,?)`, [
        createPhpInventoryDto.item_name,
        createPhpInventoryDto.item_unit,
        createPhpInventoryDto.item_description,
        createPhpInventoryDto.item_category_id,
        0
      ])
      await this.dynamicConnection.query(`insert into item (name,unit,description,item_category_id,quantity,
        hospital_id,hos_item_id) values (?,?,?,?,?,?,?)`, [
        createPhpInventoryDto.item_name,
        createPhpInventoryDto.item_unit,
        createPhpInventoryDto.item_description,
        getAdminItemCategoryId.id,
        0,
        createPhpInventoryDto.hospital_id,
        addItemHMS.insertId
      ])
      return {
        "status": "success",
        "message": "item added successfully"
      }

    } catch (error) {
      return error
    }
  }

  async createItemStock(createPhpInventoryDto: PhpInventory) {
    try {
      await this.dynamicConnection.query(`select id from item_category where Hospital_id = ? and hospital_item_category_id = ?`, [
        createPhpInventoryDto.hospital_id,
        createPhpInventoryDto.item_category_id
      ])
      const [getAdminItemId] = await this.dynamicConnection.query(`select id from item where Hospital_id = ? and hos_item_id = ?`, [
        createPhpInventoryDto.hospital_id,
        createPhpInventoryDto.item_id
      ])
      const [getAdminItemSupplierId] = await this.dynamicConnection.query(`select id from item_supplier where Hospital_id = ? and hospital_item_supplier_id = ?`, [
        createPhpInventoryDto.hospital_id,
        createPhpInventoryDto.item_supplier_id
      ])
      const [getAdminItemStoreId] = await this.dynamicConnection.query(`select id from item_store where Hospital_id = ? and hospital_item_store_id = ?`, [
        createPhpInventoryDto.hospital_id,
        createPhpInventoryDto.item_store_id
      ])
      const addItemHMS = await this.connection.query(`insert into item_stock (item_id,
        supplier_id,
        symbol,
        store_id,
        quantity,
        purchase_price,
        date,
        attachment,
        description) values (?,?,?,?,?,?,?,?,?)`, [
        createPhpInventoryDto.item_id,
        createPhpInventoryDto.item_supplier_id,
        createPhpInventoryDto.symbol,
        createPhpInventoryDto.item_store_id,
        createPhpInventoryDto.item_stock_quantity,
        createPhpInventoryDto.item_stock_purchase_price,
        createPhpInventoryDto.item_stock_date,
        createPhpInventoryDto.item_stock_attachment,
        createPhpInventoryDto.item_stock_description
      ])
      await this.dynamicConnection.query(`insert into item_stock (item_id,
        supplier_id,
        symbol,
        store_id,
        quantity,
        purchase_price,
        date,
        attachment,
        description,hospital_id,
        hos_item_stock_id) values (?,?,?,?,?,?,?,?,?,?,?)`, [
        getAdminItemId.id,
        getAdminItemSupplierId.id,
        createPhpInventoryDto.symbol,
        getAdminItemStoreId.id,
        createPhpInventoryDto.item_stock_quantity,
        createPhpInventoryDto.item_stock_purchase_price,
        createPhpInventoryDto.item_stock_date,
        createPhpInventoryDto.item_stock_attachment,
        createPhpInventoryDto.item_stock_description,
        createPhpInventoryDto.hospital_id,
        addItemHMS.insertId
      ])
      return {
        "status": "success",
        "message": "item-stock added successfully"
      }

    } catch (error) {
      return error
    }
  }

  async createItemIssue(createPhpInventoryDto: PhpInventory) {

    try {
      const [getAdminItemCategoryId] = await this.dynamicConnection.query(`select id from item_category where Hospital_id = ? and hospital_item_category_id = ?`, [
        createPhpInventoryDto.hospital_id,
        createPhpInventoryDto.item_category_id
      ])

      const [getAdminItemId] = await this.dynamicConnection.query(`select id from item where Hospital_id = ? and hos_item_id = ?`, [
        createPhpInventoryDto.hospital_id,
        createPhpInventoryDto.item_id
      ])
      const [getstaffEmail] = await this.connection.query(`select email from staff where id = ?`, [createPhpInventoryDto.issue_to_staff_id])
      const [getAdminStaffId] = await this.dynamicConnection.query(`select id from staff where email = ?`, [getstaffEmail.email])
      const addItemHMS = await this.connection.query(`insert into item_issue (issue_type,
        issue_to,
        issue_by,
        issue_date,
        return_date, 
        item_category_id,
        item_id,
        quantity,
        note
        ) values (?,?,?,?,?,?,?,?,?)`, [
        createPhpInventoryDto.issue_role_id,
        createPhpInventoryDto.issue_to_staff_id,
        createPhpInventoryDto.issued_by,
        createPhpInventoryDto.issue_date,
        createPhpInventoryDto.return_date,
        createPhpInventoryDto.item_category_id,
        createPhpInventoryDto.item_id,
        createPhpInventoryDto.issue_quantity,
        createPhpInventoryDto.issue_note
      ])
      try {
        await this.dynamicConnection.query(`insert into item_issue (issue_type,
        issue_to,
        issue_by,
        issue_date,
        return_date,
        item_category_id,
        item_id,
        quantity,
        note,
        hospital_id,
        hos_item_issue_id
        ) values (?,?,?,?,?,?,?,?,?,?,?)`, [
          createPhpInventoryDto.issue_role_id,
          getAdminStaffId.id,
          createPhpInventoryDto.issued_by,
          createPhpInventoryDto.issue_date,
          createPhpInventoryDto.return_date,
          getAdminItemCategoryId.id,
          getAdminItemId.id,
          createPhpInventoryDto.issue_quantity,
          createPhpInventoryDto.issue_note,
          createPhpInventoryDto.hospital_id,
          addItemHMS.insertId
        ])
        return {
          "status": "success",
          "message": "item-issue added successfully"
        }
      } catch (error) {
        return error
      }
    } catch (error) {
      return error
    }
  }

  async updateItems(id: number, createPhpInventoryDto: PhpInventory) {
    try {
      const [getAdminItemCategoryId] = await this.dynamicConnection.query(`select id from item_category where Hospital_id = ? and hospital_item_category_id = ?`, [
        createPhpInventoryDto.hospital_id,
        createPhpInventoryDto.item_category_id
      ])
      await this.connection.query(`update item set name = ?,
        unit = ?,
        description = ?,
        item_category_id = ? where id = ?
        `, [
        createPhpInventoryDto.item_name,
        createPhpInventoryDto.item_unit,
        createPhpInventoryDto.item_description,
        createPhpInventoryDto.item_category_id,
        id
      ])
      await this.dynamicConnection.query(`update item set name = ?,
        unit = ?,
        description = ?,
        item_category_id = ? where hospital_id = ? and hos_item_id = ?`, [
        createPhpInventoryDto.item_name,
        createPhpInventoryDto.item_unit,
        createPhpInventoryDto.item_description,
        getAdminItemCategoryId.id,
        createPhpInventoryDto.hospital_id,
        id
      ])
      return {
        "status": "success",
        "message": "item upated successfully"
      }
    } catch (error) {
      return error
    }
  }

  async updateItemStock(id: number, createPhpInventoryDto: PhpInventory) {

    try {

      const [getAdminItemId] = await this.dynamicConnection.query(`select id from item where Hospital_id = ? and hos_item_id = ?`, [
        createPhpInventoryDto.hospital_id,
        createPhpInventoryDto.item_id
      ])
      const [getAdminItemSupplierId] = await this.dynamicConnection.query(`select id from item_supplier where Hospital_id = ? and hospital_item_supplier_id = ?`, [
        createPhpInventoryDto.hospital_id,
        createPhpInventoryDto.item_supplier_id
      ])
      const [getAdminItemStoreId] = await this.dynamicConnection.query(`select id from item_store where Hospital_id = ? and hospital_item_store_id = ?`, [
        createPhpInventoryDto.hospital_id,
        createPhpInventoryDto.item_store_id
      ])
      await this.connection.query(`update item_stock set item_id = ?,
          supplier_id = ?,
          symbol = ?,
          store_id = ?,
          quantity = ?,
          purchase_price = ?,
          date = ?,
          attachment = ?,
          description = ? where id = ?`, [
        createPhpInventoryDto.item_id,
        createPhpInventoryDto.item_supplier_id,
        createPhpInventoryDto.symbol,
        createPhpInventoryDto.item_store_id,
        createPhpInventoryDto.item_stock_quantity,
        createPhpInventoryDto.item_stock_purchase_price,
        createPhpInventoryDto.item_stock_date,
        createPhpInventoryDto.item_stock_attachment,
        createPhpInventoryDto.item_stock_description,
        id
      ])
      await this.dynamicConnection.query(`update item_stock set item_id = ?,
          supplier_id = ?,
          symbol = ?,
          store_id = ?,
          quantity = ?,
          purchase_price = ?,
          date = ?,
          attachment = ?,
          description = ? where hospital_id = ? and hos_item_stock_id = ?`, [
        getAdminItemId.id,
        getAdminItemSupplierId.id,
        createPhpInventoryDto.symbol,
        getAdminItemStoreId.id,
        createPhpInventoryDto.item_stock_quantity,
        createPhpInventoryDto.item_stock_purchase_price,
        createPhpInventoryDto.item_stock_date,
        createPhpInventoryDto.item_stock_attachment,
        createPhpInventoryDto.item_stock_description,
        createPhpInventoryDto.hospital_id,
        id
      ])
      return {
        "status": "success",
        "message": "item-stock updated successfully"
      }

    } catch (error) {
      return error
    }
  }

  async update(id: number, updatePhpInventoryDto: PhpInventory) {

    try {
      await this.connection.query(`update item_issue set is_returned = 0 where id = ?`, [id])
      await this.dynamicConnection.query(`update item_issue set is_returned = 0 
  where hospital_id = ? and hos_item_issue_id = ?`, [updatePhpInventoryDto.hospital_id, id])
      return {
        "status": "success",
        "message": "item issued successfully"
      }
    } catch (error) {
      return error
    }
  }
  async removeitem(id: number, hospital_id: any) {
    try {
      await this.connection.query(`delete from item where id = ?`, [
        id
      ])
      await this.dynamicConnection.query(`delete from item where  hospital_id = ? and hos_item_id = ? `, [
        hospital_id, id
      ])
      return {
        "status": "success",
        "message": "item deleted successfully"
      }
    } catch (error) {
      return error
    }
  }

  async removeitemStock(id: number, hospital_id: any) {
    try {
      await this.connection.query(`delete from item_stock where id = ?`, [
        id
      ])
      await this.dynamicConnection.query(`delete from item_stock where  hospital_id = ? and hos_item_stock_id = ? `, [
        hospital_id, id
      ])
      return {
        "status": "success",
        "message": "item-stock deleted successfully"
      }
    } catch (error) {
      return error
    }
  }

  async remove(id: number, hospital_id: any) {

    try {
      await this.connection.query(`delete from item_issue where id = ?`, [id])
      await this.dynamicConnection.query(`delete from item_issue where hospital_id = ? and hos_item_issue_id = ?`, [hospital_id, id])
      return {
        "status": "success",
        "message": "issue deleted successfully"
      }

    } catch (error) {
      return error
    }
  }
}
