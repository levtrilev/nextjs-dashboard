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

export async function fetchWork(id: string, current_sections: string) {
  try {
    const data = await pool.query<Work>(
      `
      WITH your_works AS ( SELECT * FROM works where section_id = 
      ANY ($1::uuid[]))

      SELECT
        id,
        name,
        username,
        editing_by_user_id,
        editing_since,
        timestamptz,
        date_created
      FROM your_works works
      WHERE id = $2
    `,
      [current_sections, id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения Work по ID:", err);
    throw new Error("Не удалось получить Work:" + String(err));
  }
}

export async function fetchWorkForm(id: string, current_sections: string) {
  try {
    const data = await pool.query<WorkForm>(
      `
      WITH your_works AS ( SELECT * FROM works where section_id = 
      ANY ($1::uuid[]))

      SELECT
        works.id,
        works.name,
        works.username,
        works.section_id,
        works.editing_by_user_id,
        works.editing_since,
        works.timestamptz,
        sections.name AS section_name
      FROM your_works works
      LEFT JOIN sections ON works.section_id = sections.id
      WHERE works.id = $2
    `,
      [current_sections, id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения формы Work:", err);
    throw new Error("Не удалось получить данные формы Work:" + String(err));
  }
}

export async function fetchWorks(current_sections: string) {
  try {
    const data = await pool.query<Work>(
      `
      WITH your_works AS ( SELECT * FROM works where section_id = 
      ANY ($1::uuid[]))

      SELECT
        id,
        name,
        section_id,
        username,
        timestamptz,
        date_created
      FROM your_works works
      ORDER BY name ASC
    `,
      [current_sections]
    );

    return data.rows;
  } catch (err) {
    console.error("Ошибка получения списка задач:", err);
    throw new Error("Не удалось загрузить список задач:" + String(err));
  }
}

export async function fetchWorksForm(current_sections: string) {
  try {
    const data = await pool.query<WorkForm>(
      `
      WITH your_works AS ( SELECT * FROM works where section_id = 
      ANY ($1::uuid[]))

      SELECT
        works.id,
        works.name,
        works.username,
        works.timestamptz
      FROM your_works works
      ORDER BY works.name ASC
    `,
      [current_sections]
    );

    return data.rows;
  } catch (err) {
    console.error("Ошибка получения форм Works:", err);
    throw new Error("Не удалось загрузить формы Works:" + String(err));
  }
}

//#endregion

//#region Filtered Works

export async function fetchFilteredWorks(query: string, currentPage: number, current_sections: string) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const works = await pool.query<WorkForm>(
      `
      WITH your_works AS ( SELECT * FROM works where section_id = 
      ANY ($1::uuid[]))

      SELECT
        works.id,
        works.name,
        works.username,
        works.timestamptz
      FROM your_works works
      WHERE
        works.name ILIKE $2
      ORDER BY works.name ASC
      LIMIT $3 OFFSET $4
    `,
      [current_sections, `%${query}%`, ITEMS_PER_PAGE, offset]
    );

    return works.rows;
  } catch (error) {
    console.error("Ошибка фильтрации Объектов(таблица works):", error);
    throw new Error("Не удалось загрузить отфильтрованные Объекты:" + String(error));
  }
}

export async function fetchWorksPages(query: string, current_sections: string) {
  try {
    const count = await pool.query(
      `
      WITH your_works AS ( SELECT * FROM works where section_id = 
      ANY ($1::uuid[]))

      SELECT COUNT(*) FROM your_works works
      WHERE works.name ILIKE $2
    `,
      [current_sections, `%${query}%`]
    );

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Ошибка подсчёта страниц Works:", error);
    throw new Error("Не удалось определить количество страниц: " + String(error));
  }
}

//#endregion
