"use server";
import { VatInvoiceGoodsForm } from "@/app/lib/definitions";
import pool from "@/db";

//#region Create vat-invoice-good
export async function createVatInvoiceGood(good: {
  id: string;
  vat_invoice_id: string;
  row_number: string;
  good_id: string;
  good_name: string;
  quantity: number;
  price: number;
  discount: number;
  amount: number;
  section_id: string;
}): Promise<string> {
  const { vat_invoice_id, row_number, good_id, good_name, quantity, price, discount, amount, section_id } = good;
  try {
    const result = await pool.query(
      `
      INSERT INTO vat_invoice_goods (
        vat_invoice_id,
        row_number,
        good_id,
        good_name,
        quantity,
        price,
        discount,
        amount,
        section_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::uuid)
      RETURNING id
      `,
      [vat_invoice_id, row_number, good_id, good_name, quantity, price, discount, amount, section_id]
    );
    return result.rows[0].id;
  } catch (error) {
    console.error("Не удалось создать vat-invoice-good:", error);
    throw new Error("Не удалось создать vat-invoice-good:" + String(error));
  }
}
//#endregion

//#region Update/Delete vat-invoice-good
export async function updateVatInvoiceGood(good: VatInvoiceGoodsForm) {
  const { id, vat_invoice_id, row_number, good_id, good_name, quantity, price, discount, amount, section_id } = good;
  try {
    await pool.query(
      `
      UPDATE vat_invoice_goods
      SET
        vat_invoice_id = $2,
        row_number = $3,
        good_id = $4,
        good_name = $5,
        quantity = $6,
        price = $7,
        discount = $8,
        amount = $9,
        section_id = $10
      WHERE id = $1
      `,
      [id, vat_invoice_id, row_number, good_id, good_name, quantity, price, discount, amount, section_id]
    );
  } catch (error) {
    console.error("Не удалось обновить vat-invoice-good:", error);
    throw new Error("Ошибка базы данных: Не удалось обновить vat-invoice-good: " + String(error));
  }
}

export async function deleteVatInvoiceGood(id: string) {
  try {
    await pool.query(`DELETE FROM vat_invoice_goods WHERE id = $1`, [id]);
  } catch (error) {
    console.error("Ошибка удаления vat-invoice-good:", error);
    throw new Error("Ошибка базы данных: Не удалось удалить vat-invoice-good: " + String(error));
  }
}
//#endregion

export async function fetchVatInvoiceGoodsForm(vat_invoice_id: string, current_sections: string) {
  try {
    const data = await pool.query<VatInvoiceGoodsForm>(
      `
      WITH your_goods AS ( SELECT * FROM vat_invoice_goods WHERE section_id = ANY ($1::uuid[]))
      SELECT
        g.id,
        g.vat_invoice_id,
        g.row_number,
        g.good_id,
        g.good_name,
        g.quantity,
        g.price,
        g.discount,
        g.amount,
        g.section_id,
        COALESCE(goods.product_code, '') AS product_code,
        COALESCE(goods.brand, '') AS brand,
        COALESCE(goods.measure_unit, '') AS measure_unit
      FROM your_goods g
      LEFT JOIN goods ON g.good_id = goods.id
      WHERE g.vat_invoice_id = $2
      `,
      [current_sections, vat_invoice_id]
    );
    return data.rows;
  } catch (err) {
    console.error("Ошибка получения формы vat-invoice-goods:", err);
    throw new Error("Не удалось получить данные формы vat-invoice-goods.");
  }
}