// Systems actions

"use server";

import { z } from "zod";
import pool from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SystemForm, System } from "@/app/lib/definitions";

const ITEMS_PER_PAGE = 8;

//#region Create Task

export async function createSystem(system: System) {
  const session = await auth();
  const username = session?.user?.name;
  const date_created = new Date().toISOString();
  const {
    name,
    section_id,
    tenant_id,
    author_id,
  } = system;
  try {
    await pool.query(
      `
      INSERT INTO systems (
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
    console.error("Не удалось создать System:", error);
    throw new Error("Не удалось создать System:" + String(error));
  }

  revalidatePath("/repair/systems");
  // redirect("/repair/systems");
}

//#endregion

//#region Update/Delete System

export async function updateSystem(system: System) {
  const session = await auth();
  const username = session?.user?.name;

  const {
    id,
    name,
    section_id,
    tenant_id,
    author_id,
  } = system;

  try {
    await pool.query(
      `
      UPDATE systems SET
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
    console.error("Не удалось обновить System:", error);
    throw new Error("Ошибка базы данных: Не удалось обновить System: " + error);
  }

  revalidatePath("/repair/systems");
}

export async function deleteSystem(id: string) {
  try {
    await pool.query(`DELETE FROM systems WHERE id = $1`, [id]);
  } catch (error) {
    console.error("Ошибка удаления System:", error);
    throw new Error("Ошибка базы данных: Не удалось удалить System.");
  }
  revalidatePath("/repair/systems");
}

//#endregion

//#region Fetch Systems

export async function fetchSystem(id: string, current_sections: string) {
  try {
    const data = await pool.query<System>(
      `
      WITH your_systems AS ( SELECT * FROM systems where section_id = 
      ANY ($1::uuid[]))

      SELECT
        id,
        name,
        username,
        editing_by_user_id,
        editing_since,
        timestamptz,
        date_created
      FROM your_systems systems
      WHERE id = $2
    `,
      [current_sections, id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения System по ID:", err);
    throw new Error("Не удалось получить System:" + String(err));
  }
}

export async function fetchSystemForm(id: string, current_sections: string) {
  try {
    const data = await pool.query<SystemForm>(
      `
      WITH your_systems AS ( SELECT * FROM systems where section_id = 
      ANY ($1::uuid[]))

      SELECT
        systems.id,
        systems.name,
        systems.username,
        systems.section_id,
        systems.editing_by_user_id,
        systems.editing_since,
        systems.timestamptz,
        sections.name AS section_name
      FROM your_systems systems
      LEFT JOIN sections ON systems.section_id = sections.id
      WHERE systems.id = $2
    `,
      [current_sections, id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения формы System:", err);
    throw new Error("Не удалось получить данные формы System.");
  }
}

export async function fetchSystems(current_sections: string) {
  try {
    const data = await pool.query<System>(
      `
      WITH your_systems AS ( SELECT * FROM systems where section_id = 
      ANY ($1::uuid[]))

      SELECT
        id,
        name,
        section_id,
        username,
        timestamptz,
        date_created
      FROM your_systems systems
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

export async function fetchSystemsForm(current_sections: string) {
  try {
    const data = await pool.query<SystemForm>(
      `
      WITH your_systems AS ( SELECT * FROM systems where section_id = 
      ANY ($1::uuid[]))

      SELECT
        systems.id,
        systems.name,
        systems.section_id,
        systems.username,
        systems.timestamptz,
        sections.name AS section_name
      FROM your_systems systems
      LEFT JOIN sections ON systems.section_id = sections.id
      ORDER BY systems.name ASC
    `,
      [current_sections]
    );

    return data.rows;
  } catch (err) {
    console.error("Ошибка получения форм Systems:", err);
    throw new Error("Не удалось загрузить формы Systems:" + String(err));
  }
}

//#endregion

//#region Filtered Systems

export async function fetchFilteredSystems(query: string, currentPage: number, current_sections: string) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const systems = await pool.query<SystemForm>(
      `
      WITH your_systems AS ( SELECT * FROM systems where section_id = 
      ANY ($1::uuid[]))
        
      SELECT
        systems.id,
        systems.name,
        systems.username,
        systems.timestamptz
      FROM your_systems systems
      WHERE
        systems.name ILIKE $2
      ORDER BY systems.name ASC
      LIMIT $3 OFFSET $4
    `,
      [current_sections, `%${query}%`, ITEMS_PER_PAGE, offset]
    );

    return systems.rows;
  } catch (error) {
    console.error("Ошибка фильтрации Объектов(таблица systems):", error);
    throw new Error("Не удалось загрузить отфильтрованные Объекты:" + error);
  }
}

export async function fetchSystemsPages(query: string, current_sections: string) {
  try {
    const count = await pool.query(
      `
      WITH your_systems AS ( SELECT * FROM systems where section_id = 
      ANY ($1::uuid[]))

      SELECT COUNT(*) FROM your_systems systems
      WHERE systems.name ILIKE $2
    `,
      [current_sections, `%${query}%`]
    );

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Ошибка подсчёта страниц Systems:", error);
    throw new Error("Не удалось определить количество страниц: " + String(error));
  }
}

//#endregion
