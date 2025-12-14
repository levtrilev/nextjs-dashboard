// Works actions

"use server";

import { z } from "zod";
import pool from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { WorkForm, Work } from "@/app/lib/definitions";

const ITEMS_PER_PAGE = 8;

//#region Create Task

export async function createWork(work: Work) {
  const session = await auth();
  const username = session?.user?.name;
  const date_created = new Date().toISOString();
  const {
    name,
    section_id,
    tenant_id,
    author_id,
  } = work;
  try {
    await pool.query(
      `
      INSERT INTO works (
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
    console.error("Не удалось создать Work:", error);
    throw new Error("Не удалось создать Work:" + String(error));
  }

  revalidatePath("/repair/works");
  // redirect("/repair/works");
}

//#endregion

//#region Update/Delete Work

export async function updateWork(work: Work) {
  const session = await auth();
  const username = session?.user?.name;

  const {
    id,
    name,
    section_id,
    tenant_id,
    author_id,
  } = work;

  try {
    await pool.query(
      `
      UPDATE works SET
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
    console.error("Не удалось обновить Work:", error);
    throw new Error("Ошибка базы данных: Не удалось обновить Work: " + error);
  }

  revalidatePath("/repair/works");
}

export async function deleteWork(id: string) {
  try {
    await pool.query(`DELETE FROM works WHERE id = $1`, [id]);
  } catch (error) {
    console.error("Ошибка удаления Work:", error);
    throw new Error("Ошибка базы данных: Не удалось удалить Work.");
  }
  revalidatePath("/repair/works");
}

//#endregion

//#region Fetch Works

export async function fetchWork(id: string) {
  try {
    const data = await pool.query<Work>(
      `
      SELECT
        id,
        name,
        username,
        editing_by_user_id,
        editing_since,
        timestamptz,
        date_created
      FROM works
      WHERE id = $1
    `,
      [id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения Work по ID:", err);
    throw new Error("Не удалось получить Work:" + String(err));
  }
}

export async function fetchWorkForm(id: string) {
  try {
    const data = await pool.query<WorkForm>(
      `
      SELECT
        works.id,
        works.name,
        works.username,
        works.section_id,
        works.editing_by_user_id,
        works.editing_since,
        works.timestamptz,
        sections.name AS section_name
      FROM works
      LEFT JOIN sections ON works.section_id = sections.id
      WHERE works.id = $1
    `,
      [id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения формы Work:", err);
    throw new Error("Не удалось получить данные формы Work.");
  }
}

export async function fetchWorks() {
  try {
    const data = await pool.query<Work>(
      `
      SELECT
        id,
        name,
        section_id,
        username,
        timestamptz,
        date_created
      FROM works
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

export async function fetchWorksForm() {
  try {
    const data = await pool.query<WorkForm>(
      `
      SELECT
        works.id,
        works.name,
        works.username,
        works.timestamptz
      FROM works
      ORDER BY works.name ASC
    `,
      []
    );

    return data.rows;
  } catch (err) {
    console.error("Ошибка получения форм Works:", err);
    throw new Error("Не удалось загрузить формы Works:" + String(err));
  }
}

//#endregion

//#region Filtered Works

export async function fetchFilteredWorks(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const works = await pool.query<WorkForm>(
      `
      SELECT
        works.id,
        works.name,
        works.username,
        works.timestamptz
      FROM works
      WHERE
        works.name ILIKE $1
      ORDER BY works.name ASC
      LIMIT $2 OFFSET $3
    `,
      [`%${query}%`, ITEMS_PER_PAGE, offset]
    );

    return works.rows;
  } catch (error) {
    console.error("Ошибка фильтрации Объектов(таблица works):", error);
    throw new Error("Не удалось загрузить отфильтрованные Объекты:" + error);
  }
}

export async function fetchWorksPages(query: string) {
  try {
    const count = await pool.query(
      `
      SELECT COUNT(*) FROM works
      WHERE works.name ILIKE $1
    `,
      [`%${query}%`]
    );

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Ошибка подсчёта страниц Works:", error);
    throw new Error("Не удалось определить количество страниц.");
  }
}

//#endregion

export async function unlockRecord(recordId: string, userId: string) {
  // console.log("unlockRecord user.id: ", userId);
  await pool.query(
    `
      UPDATE works
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
      UPDATE works
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