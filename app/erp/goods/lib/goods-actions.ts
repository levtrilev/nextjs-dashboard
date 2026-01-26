"use server";
import { z } from "zod";
import pool from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GoodForm, Good } from "@/app/lib/definitions";

const ITEMS_PER_PAGE = 8;

//#region Create Good
export async function createGood(good: Good) {
  const session = await auth();
  const username = session?.user?.name;
  const date_created = new Date().toISOString();
  const {
    name,
    brand,
    product_code,
    supplier_id,
    dimensions_height,
    dimensions_width,
    dimensions_length,
    weight,
    price_retail,
    price_wholesale,
    price_cost,
    section_id,
    tenant_id,
  } = good;

  try {
    await pool.query(
      `
      INSERT INTO goods (
        name,
        brand,
        product_code,
        supplier_id,
        dimensions_height,
        dimensions_width,
        dimensions_length,
        weight,
        price_retail,
        price_wholesale,
        price_cost,
        username,
        section_id,
        timestamptz,
        tenant_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `,
      [
        name,
        brand,
        product_code,
        supplier_id,
        dimensions_height,
        dimensions_width,
        dimensions_length,
        weight,
        price_retail,
        price_wholesale,
        price_cost,
        username,
        section_id,
        date_created,
        tenant_id,
      ]
    );
  } catch (error) {
    console.error("Не удалось создать Good:", error);
    throw new Error("Не удалось создать Good:" + String(error));
  }
  revalidatePath("/erp/goods");
}

//#endregion

//#region Update/Delete Good
export async function updateGood(good: Good) {
  const session = await auth();
  const username = session?.user?.name;
  const {
    id,
    name,
    brand,
    product_code,
    supplier_id,
    dimensions_height,
    dimensions_width,
    dimensions_length,
    weight,
    price_retail,
    price_wholesale,
    price_cost,
    section_id,
    tenant_id,
  } = good;

  try {
    await pool.query(
      `
      UPDATE goods SET
        name = $1,
        brand = $2,
        product_code = $3,
        supplier_id = $4,
        dimensions_height = $5,
        dimensions_width = $6,
        dimensions_length = $7,
        weight = $8,
        price_retail = $9,
        price_wholesale = $10,
        price_cost = $11,
        username = $12,
        section_id = $13,
        tenant_id = $14,
        timestamptz = now()
      WHERE id = $15
      `,
      [
        name,
        brand,
        product_code,
        supplier_id,
        dimensions_height,
        dimensions_width,
        dimensions_length,
        weight,
        price_retail,
        price_wholesale,
        price_cost,
        username,
        section_id,
        tenant_id,
        id,
      ]
    );
  } catch (error) {
    console.error("Не удалось обновить Good:", error);
    throw new Error("Ошибка базы данных: Не удалось обновить Good: " + error);
  }
  revalidatePath("/erp/goods");
}

export async function deleteGood(id: string) {
  try {
    await pool.query(`DELETE FROM goods WHERE id = $1`, [id]);
  } catch (error) {
    console.error("Ошибка удаления Good:", error);
    throw new Error(
      "Ошибка базы данных: Не удалось удалить Good: " + String(error)
    );
  }
  revalidatePath("/erp/goods");
}
//#endregion

//#region Fetch Goods
export async function fetchGood(id: string, current_sections: string) {
  try {
    const data = await pool.query<Good>(
      `
      WITH your_goods AS ( SELECT * FROM goods WHERE section_id = ANY ($1::uuid[]))
      SELECT
        id,
        name,
        brand,
        product_code,
        supplier_id,
        dimensions_height,
        dimensions_width,
        dimensions_length,
        weight,
        price_retail,
        price_wholesale,
        price_cost,
        username,
        editing_by_user_id,
        editing_since,
        timestamptz,
        section_id,
        tenant_id
      FROM your_goods
      WHERE id = $2
      `,
      [current_sections, id]
    );
    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения Good по ID:", err);
    throw new Error("Не удалось получить Good:" + String(err));
  }
}

export async function fetchGoodForm(id: string, current_sections: string) {
  try {
    const data = await pool.query<GoodForm>(
      `
      WITH your_goods AS ( SELECT * FROM goods WHERE section_id = ANY ($1::uuid[]))
      SELECT
        goods.id,
        goods.name,
        goods.brand,
        goods.product_code,
        goods.supplier_id,
        goods.dimensions_height,
        goods.dimensions_width,
        goods.dimensions_length,
        goods.weight,
        goods.price_retail,
        goods.price_wholesale,
        goods.price_cost,
        goods.username,
        goods.section_id,
        goods.tenant_id,
        goods.editing_by_user_id,
        goods.editing_since,
        goods.timestamptz,
        COALESCE(suppliers.name, '') as supplier_name,
        COALESCE(sections.name, '') as section_name
      FROM your_goods goods
      LEFT JOIN sections ON goods.section_id = sections.id
      LEFT JOIN legal_entities suppliers ON goods.supplier_id = suppliers.id
      WHERE goods.id = $2
      `,
      [current_sections, id]
    );
    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения формы Good:", err);
    throw new Error("Не удалось получить данные формы Good:" + String(err));
  }
}

export async function fetchGoods(current_sections: string) {
  try {
    const data = await pool.query<Good>(
      `
      WITH your_goods AS ( SELECT * FROM goods WHERE section_id = ANY ($1::uuid[]))
      SELECT
        id,
        name,
        brand,
        product_code,
        supplier_id,
        dimensions_height,
        dimensions_width,
        dimensions_length,
        weight,
        price_retail,
        price_wholesale,
        price_cost,
        section_id,
        tenant_id,
        username,
        timestamptz
      FROM your_goods
      ORDER BY name ASC
      `,
      [current_sections]
    );
    return data.rows;
  } catch (err) {
    console.error("Ошибка получения списка товаров:", err);
    throw new Error("Не удалось загрузить список товаров:" + String(err));
  }
}

export async function fetchGoodsForm(current_sections: string) {
  try {
    const data = await pool.query<GoodForm>(
      `
      WITH your_goods AS ( SELECT * FROM goods WHERE section_id = ANY ($1::uuid[]))
      SELECT
        goods.id,
        goods.name,
        goods.brand,
        goods.product_code,
        goods.supplier_id,
        goods.dimensions_height,
        goods.dimensions_width,
        goods.dimensions_length,
        goods.weight,
        goods.price_retail,
        goods.price_wholesale,
        goods.price_cost,
        goods.username,
        goods.section_id,
        goods.tenant_id,
        goods.editing_by_user_id,
        goods.editing_since,
        goods.timestamptz,
        COALESCE(suppliers.name, '') as supplier_name,
        COALESCE(sections.name, '') as section_name
      FROM your_goods goods
      LEFT JOIN sections ON goods.section_id = sections.id
      LEFT JOIN legal_entities suppliers ON goods.supplier_id = suppliers.id
      ORDER BY goods.name ASC
      `,
      [current_sections]
    );
    return data.rows;
  } catch (err) {
    console.error("Ошибка получения форм Goods:", err);
    throw new Error("Не удалось загрузить формы Goods:" + String(err));
  }
}
//#endregion

//#region Filtered Goods
export async function fetchFilteredGoods(
  query: string,
  currentPage: number,
  current_sections: string,
  rows_per_page?: number
) {
  const offset = (currentPage - 1) * (rows_per_page || ITEMS_PER_PAGE);
  try {
    const goods = await pool.query<GoodForm>(
      `
      WITH your_goods AS ( SELECT * FROM goods WHERE section_id = ANY ($1::uuid[]))
      SELECT
        goods.id,
        goods.name,
        goods.brand,
        goods.product_code,
        goods.supplier_id,
        goods.dimensions_height,
        goods.dimensions_width,
        goods.dimensions_length,
        goods.weight,
        goods.price_retail,
        goods.price_wholesale,
        goods.price_cost,
        goods.username,
        goods.section_id,
        goods.tenant_id,
        goods.editing_by_user_id,
        goods.editing_since,
        goods.timestamptz,
        sections.name AS section_name,
        suppliers.name AS supplier_name
      FROM your_goods goods
      LEFT JOIN sections ON goods.section_id = sections.id
      LEFT JOIN legal_entities suppliers ON goods.supplier_id = suppliers.id
      WHERE
        goods.name ILIKE $2
      ORDER BY goods.name ASC
      LIMIT $3 OFFSET $4
      `,
      [
        current_sections,
        `%${query}%`,
        rows_per_page || ITEMS_PER_PAGE,
        offset,
      ]
    );
    return goods.rows;
  } catch (error) {
    console.error("Ошибка фильтрации Goods (таблица goods):", error);
    throw new Error(
      "Не удалось загрузить отфильтрованные Goods:" + String(error)
    );
  }
}

export async function fetchGoodsPages(
  query: string,
  current_sections: string,
  rows_per_page?: number
) {
  try {
    const count = await pool.query(
      `
      WITH your_goods AS ( SELECT * FROM goods WHERE section_id = ANY ($1::uuid[]))
      SELECT COUNT(*) FROM your_goods
      WHERE name ILIKE $2
      `,
      [current_sections, `%${query}%`]
    );
    const totalPages = Math.ceil(
      Number(count.rows[0].count) / (rows_per_page || ITEMS_PER_PAGE)
    );
    return totalPages;
  } catch (error) {
    console.error("Ошибка подсчёта страниц Goods:", error);
    throw new Error("Не удалось определить количество страниц.");
  }
}
//#endregion