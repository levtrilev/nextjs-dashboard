// Units actions

"use server";

import pool from "@/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { UnitForm, Unit } from "@/app/lib/definitions";

const ITEMS_PER_PAGE = 8;

//#region Create Unit

export async function createUnit(unit: Unit) {
  const session = await auth();
  const username = session?.user?.name;
  const date_created = new Date().toISOString();
  const {
    name,
    object_id,
    section_id,
    tenant_id,
    author_id,
  } = unit;
  try {
    await pool.query(
      `
      INSERT INTO units (
        name, object_id,
        username, section_id, timestamptz,
        tenant_id, author_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
      [
        name,
        object_id,
        username,
        section_id,
        date_created,
        tenant_id,
        author_id,
      ]
    );
  } catch (error) {
    console.error("Не удалось создать Unit:", error);
    throw new Error("Не удалось создать Unit:" + String(error));
  }

  revalidatePath("/repair/units");
}

//#endregion

//#region Update/Delete Unit

export async function updateUnit(unit: Unit) {
  const session = await auth();
  const username = session?.user?.name;

  const {
    id,
    object_id,
    name,
    section_id,
    tenant_id,
    author_id,
  } = unit;

  try {
    await pool.query(
      `
      UPDATE units SET
        name = $1,
        object_id = $7,
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
        object_id,
      ]
    );
  } catch (error) {
    console.error("Не удалось обновить Unit:", error);
    throw new Error("Ошибка базы данных: Не удалось обновить Unit: " + error);
  }

  revalidatePath("/repair/units");
}

export async function deleteUnit(id: string) {
  try {
    await pool.query(`DELETE FROM units WHERE id = $1`, [id]);
  } catch (error) {
    console.error("Ошибка удаления Unit:", error);
    throw new Error("Ошибка базы данных: Не удалось удалить Unit.");
  }
  revalidatePath("/repair/units");
}

//#endregion

//#region Fetch Units

export async function fetchUnit(id: string) {
  try {
    const data = await pool.query<Unit>(
      `
      SELECT
        id,
        name,
        object_id,
        username,
        editing_by_user_id,
        editing_since,
        timestamptz,
        date_created
      FROM units
      WHERE id = $1
    `,
      [id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения Unit по ID:", err);
    throw new Error("Не удалось получить Unit:" + String(err));
  }
}

export async function fetchUnitForm(id: string) {
  try {
    const data = await pool.query<UnitForm>(
      `
      SELECT
        units.id,
        units.name,
        units.object_id,
        units.username,
        units.section_id,
        units.editing_by_user_id,
        units.editing_since,
        units.timestamptz,
        objects.name AS object_name,
        sections.name AS section_name
      FROM units
      LEFT JOIN sections ON units.section_id = sections.id
      LEFT JOIN objects ON units.object_id = objects.id
      WHERE units.id = $1
    `,
      [id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения формы Unit:", err);
    throw new Error("Не удалось получить данные формы Unit.");
  }
}

export async function fetchUnits() {
  try {
    const data = await pool.query<Unit>(
      `
      SELECT
        id,
        name,
        object_id,
        section_id,
        username,
        timestamptz,
        date_created
      FROM units
      ORDER BY name ASC
    `,
      []
    );

    return data.rows;
  } catch (err) {
    console.error("Ошибка получения списка Units:", err);
    throw new Error("Не удалось загрузить список Units.");
  }
}

export async function fetchUnitsForm() {
  try {
    const data = await pool.query<UnitForm>(
      `
      SELECT
        units.id,
        units.name,
        objects.name AS object_name,
        units.username,
        units.timestamptz
      FROM units
      LEFT JOIN objects ON units.object_id = objects.id
      ORDER BY units.name ASC
    `,
      []
    );

    return data.rows;
  } catch (err) {
    console.error("Ошибка получения форм Units:", err);
    throw new Error("Не удалось загрузить формы Units:" + String(err));
  }
}

//#endregion

//#region Filtered Units

export async function fetchFilteredUnits(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const units = await pool.query<UnitForm>(
      `
      SELECT
        units.id,
        units.name,
        objects.name AS object_name,
        units.username,
        units.timestamptz
      FROM units
      LEFT JOIN objects ON units.object_id = objects.id
      WHERE
        units.name ILIKE $1
      ORDER BY units.name ASC
      LIMIT $2 OFFSET $3
    `,
      [`%${query}%`, ITEMS_PER_PAGE, offset]
    );

    return units.rows;
  } catch (error) {
    console.error("Ошибка фильтрации Units:", error);
    throw new Error("Не удалось загрузить отфильтрованные Units:" + error);
  }
}

export async function fetchUnitsPages(query: string) {
  try {
    const count = await pool.query(
      `
      SELECT COUNT(*) FROM units
      WHERE units.name ILIKE $1
    `,
      [`%${query}%`]
    );

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Ошибка подсчёта страниц Units:", error);
    throw new Error("Не удалось определить количество страниц.");
  }
}

//#endregion

export async function unlockRecord(recordId: string, userId: string) {
  await pool.query(
    `
      UPDATE units
      SET editing_by_user_id = NULL, editing_since = NULL
      WHERE id = $1 AND editing_by_user_id = $2;
    `,
    [recordId, userId]
  );
}

export async function tryLockRecord(
  recordId: string,
  userId: string | undefined
) {
  const result = await pool.query(
    `
      UPDATE units
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