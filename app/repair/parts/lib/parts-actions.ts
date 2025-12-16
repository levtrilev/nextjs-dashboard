// Parts actions

"use server";

import { z } from "zod";
import pool from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PartForm, Part } from "@/app/lib/definitions";

const ITEMS_PER_PAGE = 8;

//#region Create Task

export async function createPart(part: Part) {
  const session = await auth();
  const username = session?.user?.name;
  const date_created = new Date().toISOString();
  const {
    name,
    section_id,
    tenant_id,
    author_id,
  } = part;
  try {
    await pool.query(
      `
      INSERT INTO parts (
        name, 
        username, section_id, timestamptz,
        tenant_id, author_id
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `,
      [
        name,
        username,
        section_id,
        date_created,
        tenant_id,
        author_id,
      ]
    );
  } catch (error) {
    console.error("Не удалось создать Part:", error);
    throw new Error("Не удалось создать Part:" + String(error));
  }

  revalidatePath("/repair/parts");
  // redirect("/repair/parts");
}

//#endregion

//#region Update/Delete Part

export async function updatePart(part: Part) {
  const session = await auth();
  const username = session?.user?.name;

  const {
    id,
    name,
    section_id,
    tenant_id,
    author_id,
  } = part;

  try {
    await pool.query(
      `
      UPDATE parts SET
        name = $1,
        username = $2,
        section_id = $4,
        tenant_id = $5,
        author_id = $6,
        timestamptz = now()
      WHERE id = $3
    `,
      [
        name,
        username,
        id,
        section_id,
        tenant_id,
        author_id,
      ]
    );
  } catch (error) {
    console.error("Не удалось обновить Part:", error);
    throw new Error("Ошибка базы данных: Не удалось обновить Part: " + error);
  }

  revalidatePath("/repair/parts");
}

export async function deletePart(id: string) {
  try {
    await pool.query(`DELETE FROM parts WHERE id = $1`, [id]);
  } catch (error) {
    console.error("Ошибка удаления Part:", error);
    throw new Error("Ошибка базы данных: Не удалось удалить Part.");
  }
  revalidatePath("/repair/parts");
}

//#endregion

//#region Fetch Parts

export async function fetchPart(id: string, current_sections: string) {
  try {
    const data = await pool.query<Part>(
      `
      WITH your_parts AS ( SELECT * FROM parts where section_id = 
        ANY ($1::uuid[]))

        SELECT
        id,
        name,
        username,
        editing_by_user_id,
        editing_since,
        timestamptz,
        date_created
      FROM your_parts parts
      WHERE id = $2
    `,
      [current_sections, id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения Part по ID:", err);
    throw new Error("Не удалось получить Part:" + String(err));
  }
}

export async function fetchPartForm(id: string, current_sections: string) {
  try {
    const data = await pool.query<PartForm>(
      `
      WITH your_parts AS ( SELECT * FROM parts where section_id = 
        ANY ($1::uuid[]))

        SELECT
        parts.id,
        parts.name,
        parts.username,
        parts.section_id,
        parts.editing_by_user_id,
        parts.editing_since,
        parts.timestamptz,
        sections.name AS section_name
      FROM your_parts parts
      LEFT JOIN sections ON parts.section_id = sections.id
      WHERE parts.id = $2
    `,
      [current_sections, id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения формы Part:", err);
    throw new Error("Не удалось получить данные формы Part:" + String(err));
  }
}

export async function fetchParts(current_sections: string) {
  try {
    const data = await pool.query<Part>(
      `
      WITH your_parts AS ( SELECT * FROM parts where section_id = 
        ANY ($1::uuid[]))
        
        SELECT
        id,
        name,
        section_id,
        username,
        timestamptz,
        date_created
      FROM your_parts parts
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

export async function fetchPartsForm(current_sections: string) {
  try {
    const data = await pool.query<PartForm>(
      `
      WITH your_parts AS ( SELECT * FROM parts where section_id = 
        ANY ($1::uuid[]))
        
        SELECT
        parts.id,
        parts.name,
        parts.username,
        parts.timestamptz
      FROM your_parts parts
      ORDER BY parts.name ASC
    `,
      [current_sections]
    );

    return data.rows;
  } catch (err) {
    console.error("Ошибка получения форм Parts:", err);
    throw new Error("Не удалось загрузить формы Parts:" + String(err));
  }
}

//#endregion

//#region Filtered Parts

export async function fetchFilteredParts(query: string, currentPage: number, current_sections: string) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const parts = await pool.query<PartForm>(
      `
      WITH your_parts AS ( SELECT * FROM parts where section_id = 
        ANY ($1::uuid[]))
        
        SELECT
        parts.id,
        parts.name,
        parts.username,
        parts.timestamptz
      FROM your_parts parts
      WHERE
        parts.name ILIKE $2
      ORDER BY parts.name ASC
      LIMIT $3 OFFSET $4
    `,
      [current_sections, `%${query}%`, ITEMS_PER_PAGE, offset]
    );

    return parts.rows;
  } catch (error) {
    console.error("Ошибка фильтрации Объектов(таблица parts):", error);
    throw new Error("Не удалось загрузить отфильтрованные Объекты:" + error);
  }
}

export async function fetchPartsPages(query: string, current_sections: string) {
  try {
    const count = await pool.query(
      `
      WITH your_parts AS ( SELECT * FROM parts where section_id = 
      ANY ($1::uuid[]))
              
      SELECT COUNT(*) FROM your_parts parts
      WHERE parts.name ILIKE $2
    `,
      [current_sections, `%${query}%`]
    );

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Ошибка подсчёта страниц Parts:", error);
    throw new Error("Не удалось определить количество страниц.");
  }
}

//#endregion
