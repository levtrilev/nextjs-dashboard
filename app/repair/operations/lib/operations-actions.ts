// Operations actions

"use server";

import { z } from "zod";
import pool from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OperationForm, Operation } from "@/app/lib/definitions";

const ITEMS_PER_PAGE = 8;

//#region Create Task

export async function createOperation(operation: Operation) {
  const session = await auth();
  const username = session?.user?.name;
  const date_created = new Date().toISOString();
  const {
    name,
    work_id,
    section_id,
    tenant_id,
    author_id,
  } = operation;
  try {
    await pool.query(
      `
      INSERT INTO operations (
        name, work_id,
        username, section_id, timestamptz,
        tenant_id, author_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
      [
        name,
        work_id,
        username,
        section_id,
        date_created,
        tenant_id,
        author_id,
      ]
    );
  } catch (error) {
    console.error("Не удалось создать Operation:", error);
    throw new Error("Не удалось создать Operation:" + String(error));
  }

  revalidatePath("/repair/operations");
  // redirect("/repair/operations");
}

//#endregion

//#region Update/Delete Operation

export async function updateOperation(operation: Operation) {
  const session = await auth();
  const username = session?.user?.name;

  const {
    id,
    name,
    work_id,
    section_id,
    tenant_id,
    author_id,
  } = operation;

  try {
    await pool.query(
      `
      UPDATE operations SET
        name = $2,
        work_id = $3,
        username = $4,
        section_id = $5,
        tenant_id = $6,
        author_id = $7,
        timestamptz = now()
      WHERE id = $1
    `,
      [
        id,
        name,
        work_id,
        username,
        section_id,
        tenant_id,
        author_id,
      ]
    );
  } catch (error) {
    console.error("Не удалось обновить Operation:", error);
    throw new Error("Ошибка базы данных: Не удалось обновить Operation: " + error);
  }

  revalidatePath("/repair/operations");
}

export async function deleteOperation(id: string) {
  try {
    await pool.query(`DELETE FROM operations WHERE id = $1`, [id]);
  } catch (error) {
    console.error("Ошибка удаления Operation:", error);
    throw new Error("Ошибка базы данных: Не удалось удалить Operation.");
  }
  revalidatePath("/repair/operations");
}

//#endregion

//#region Fetch Operations

export async function fetchOperation(id: string, 
  current_sections: string) {
  try {
    const data = await pool.query<Operation>(
      `
      WITH your_operations AS ( SELECT * FROM operations where section_id = 
        ANY ($1::uuid[]))

        SELECT
        id,
        name,
        work_id,
        username,
        editing_by_user_id,
        editing_since,
        timestamptz,
        date_created
      FROM your_operations
      WHERE id = $2
    `,
      [current_sections, id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения Operation по ID:", err);
    throw new Error("Не удалось получить Operation:" + String(err));
  }
}

export async function fetchOperationForm(id: string, 
  current_sections: string) {
  try {
    const data = await pool.query<OperationForm>(
      `
      WITH your_operations AS ( SELECT * FROM operations where section_id = 
        ANY ($1::uuid[]))

        SELECT
        operations.id,
        operations.name,
        operations.work_id,
        operations.username,
        operations.section_id,
        operations.editing_by_user_id,
        operations.editing_since,
        operations.timestamptz,
        COALESCE(sections.name, '') as section_name,
        COALESCE(works.name, '') as work_name
      FROM your_operations operations
      LEFT JOIN sections ON operations.section_id = sections.id
      LEFT JOIN works ON operations.work_id = works.id
      WHERE operations.id = $2
    `,
      [current_sections, id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения формы Operation:", err);
    throw new Error("Не удалось получить данные формы Operation.");
  }
}

export async function fetchOperations(current_sections: string) {
  try {
    const data = await pool.query<Operation>(
      `
      WITH your_operations AS ( SELECT * FROM operations where section_id = 
        ANY ($1::uuid[]))

        SELECT
        id,
        name,
        work_id,
        section_id,
        username,
        timestamptz,
        work_id,
        date_created
      FROM your_operations
      ORDER BY name ASC
    `,
      [current_sections]
    );

    return data.rows;
  } catch (err) {
    console.error("Ошибка получения списка задач:", err);
    throw new Error("Не удалось загрузить список задач.");
  }
}

export async function fetchOperationsForm(current_sections: string) {
  try {
    const data = await pool.query<OperationForm>(
      `
      WITH your_operations AS ( SELECT * FROM operations where section_id = 
        ANY ($1::uuid[]))

      SELECT
        operations.id,
        operations.name,
        operations.work_id,
        operations.username,
        operations.timestamptz,
        COALESCE(sections.name, '') as section_name,
        COALESCE(works.name, '') as work_name
      FROM your_operations operations
      LEFT JOIN sections ON operations.section_id = sections.id
      LEFT JOIN works ON operations.work_id = works.id
      ORDER BY operations.name ASC
    `,
      [current_sections]
    );

    return data.rows;
  } catch (err) {
    console.error("Ошибка получения форм Operations:", err);
    throw new Error("Не удалось загрузить формы Operations:" + String(err));
  }
}

//#endregion

//#region Filtered Operations

export async function fetchFilteredOperations(query: string, currentPage: number, 
  current_sections: string) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const operations = await pool.query<OperationForm>(
      `
      WITH your_operations AS ( SELECT * FROM operations where section_id = 
        ANY ($1::uuid[]))

        SELECT
        operations.id,
        operations.name,
        operations.work_id,
        operations.username,
        operations.timestamptz,
        COALESCE(sections.name, '') as section_name,
        COALESCE(works.name, '') as work_name
      FROM your_operations operations
      LEFT JOIN sections ON operations.section_id = sections.id
      LEFT JOIN works ON operations.work_id = works.id
      WHERE
        operations.name ILIKE $2
      ORDER BY operations.name ASC
      LIMIT $3 OFFSET $4
    `,
      [current_sections, `%${query}%`, ITEMS_PER_PAGE, offset]
    );

    return operations.rows;
  } catch (error) {
    console.error("Ошибка фильтрации Operations (таблица operations):", error);
    throw new Error("Не удалось загрузить отфильтрованные Operations:" + error);
  }
}

export async function fetchOperationsPages(query: string, 
  current_sections: string) {
  try {
    const count = await pool.query(
      `
      WITH your_operations AS ( SELECT * FROM operations where section_id = 
        ANY ($1::uuid[]))

        SELECT COUNT(*) FROM your_operations operations
      WHERE operations.name ILIKE $2
    `,
      [current_sections, `%${query}%`]
    );

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Ошибка подсчёта страниц Operations:", error);
    throw new Error("Не удалось определить количество страниц: " + String(error));
  }
}

//#endregion