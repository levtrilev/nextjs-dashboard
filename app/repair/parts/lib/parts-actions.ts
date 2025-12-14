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

export async function fetchPart(id: string) {
  try {
    const data = await pool.query<Part>(
      `
      SELECT
        id,
        name,
        username,
        editing_by_user_id,
        editing_since,
        timestamptz,
        date_created
      FROM parts
      WHERE id = $1
    `,
      [id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения Part по ID:", err);
    throw new Error("Не удалось получить Part:" + String(err));
  }
}

export async function fetchPartForm(id: string) {
  try {
    const data = await pool.query<PartForm>(
      `
      SELECT
        parts.id,
        parts.name,
        parts.username,
        parts.section_id,
        parts.editing_by_user_id,
        parts.editing_since,
        parts.timestamptz,
        sections.name AS section_name
      FROM parts
      LEFT JOIN sections ON parts.section_id = sections.id
      WHERE parts.id = $1
    `,
      [id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения формы Part:", err);
    throw new Error("Не удалось получить данные формы Part.");
  }
}

export async function fetchParts() {
  try {
    const data = await pool.query<Part>(
      `
      SELECT
        id,
        name,
        section_id,
        username,
        timestamptz,
        date_created
      FROM parts
      ORDER BY name ASC
    `,
      []
    );

    return data.rows;
  } catch (err) {
    console.error("Ошибка получения списка задач:", err);
    throw new Error("Не удалось загрузить список задач.");
  }
}

export async function fetchPartsForm() {
  try {
    const data = await pool.query<PartForm>(
      `
      SELECT
        parts.id,
        parts.name,
        parts.username,
        parts.timestamptz
      FROM parts
      ORDER BY parts.name ASC
    `,
      []
    );

    return data.rows;
  } catch (err) {
    console.error("Ошибка получения форм Parts:", err);
    throw new Error("Не удалось загрузить формы Parts:" + String(err));
  }
}

//#endregion

//#region Filtered Parts

export async function fetchFilteredParts(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const parts = await pool.query<PartForm>(
      `
      SELECT
        parts.id,
        parts.name,
        parts.username,
        parts.timestamptz
      FROM parts
      WHERE
        parts.name ILIKE $1
      ORDER BY parts.name ASC
      LIMIT $2 OFFSET $3
    `,
      [`%${query}%`, ITEMS_PER_PAGE, offset]
    );

    return parts.rows;
  } catch (error) {
    console.error("Ошибка фильтрации Объектов(таблица parts):", error);
    throw new Error("Не удалось загрузить отфильтрованные Объекты:" + error);
  }
}

export async function fetchPartsPages(query: string) {
  try {
    const count = await pool.query(
      `
      SELECT COUNT(*) FROM parts
      WHERE parts.name ILIKE $1
    `,
      [`%${query}%`]
    );

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Ошибка подсчёта страниц Parts:", error);
    throw new Error("Не удалось определить количество страниц.");
  }
}

//#endregion

export async function unlockRecord(recordId: string, userId: string) {
  // console.log("unlockRecord user.id: ", userId);
  await pool.query(
    `
      UPDATE parts
      SET editing_by_user_id = NULL, editing_since = NULL
      WHERE id = $1 AND editing_by_user_id = $2;
    `,
    [recordId, userId]
  );
  // revalidatePath(`/records/${recordId}/edit`);
}

export async function tryLockRecord(
  recordId: string,
  userId: string | undefined
) {
  // console.log("tryLockRecord user.id: ", userId);
  const result = await pool.query(
    `
      UPDATE parts
      SET editing_by_user_id = $1, editing_since = NOW()
      WHERE id = $2
        AND (editing_by_user_id IS NULL OR editing_since < NOW() - INTERVAL '30 minutes')
      RETURNING editing_by_user_id;
    `,
    [userId, recordId]
  );

  const isLockedByMe = result.rows.length > 0;
  return { success: true, isEditable: isLockedByMe };
}