// Workorders actions

"use server";

import { z } from "zod";
import pool from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { WorkorderForm, Workorder } from "@/app/lib/definitions";

const ITEMS_PER_PAGE = 8;

//#region Create Workorder

export async function createWorkorder(workorder: Workorder) {
  const session = await auth();
  const username = session?.user?.name;
  const date_created = new Date().toISOString();
  const {
    name,
    doc_number,
    doc_date,
    performer_id,
    claim_id,
    section_id,
    tenant_id,
    author_id,
  } = workorder;
  try {
    await pool.query(
      `
      INSERT INTO workorders (
        name,
          doc_number,
          doc_date,
          performer_id, 
        claim_id,
        username, section_id, timestamptz,
        tenant_id, author_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `,
      [name, doc_number, doc_date, performer_id, claim_id, username, section_id, date_created, tenant_id, author_id]
    );
  } catch (error) {
    console.error("Не удалось создать Workorder:", error);
    throw new Error("Не удалось создать Workorder:" + String(error));
  }

  revalidatePath("/repair/workorders");
}

//#endregion

//#region Update/Delete Workorder

export async function updateWorkorder(workorder: Workorder) {
  const session = await auth();
  const username = session?.user?.name;

  const { id, name, doc_number, doc_date, doc_status,
          performer_id, claim_id, section_id, tenant_id, author_id } = workorder;

  try {
    await pool.query(
      `
      UPDATE workorders SET
        name = $2,
        doc_number = $3,
        doc_date = $4,
        doc_status = $5,
        performer_id = $6,
        claim_id = $7,
        username = $8,
        section_id = $9,
        tenant_id = $10,
        author_id = $11,
        timestamptz = now()
      WHERE id = $1
    `,
      [id, name, doc_number, doc_date, doc_status, performer_id, claim_id, username, section_id, tenant_id, author_id]
    );
  } catch (error) {
    console.error("Не удалось обновить Workorder:", error);
    throw new Error(
      "Ошибка базы данных: Не удалось обновить Workorder: " + error
    );
  }

  // revalidatePath("/repair/workorders");
}

export async function deleteWorkorder(id: string) {
  try {
    await pool.query(`DELETE FROM workorders WHERE id = $1`, [id]);
  } catch (error) {
    console.error("Ошибка удаления Workorder:", error);
    throw new Error("Ошибка базы данных: Не удалось удалить Workorder.");
  }
  revalidatePath("/repair/workorders");
}

//#endregion

//#region Fetch Workorders

export async function fetchWorkorder(id: string, current_sections: string) {
  try {
    const data = await pool.query<Workorder>(
      `
      WITH your_workorders AS ( SELECT * FROM workorders where section_id = 
        ANY ($1::uuid[]))

        SELECT
        id,
        name,
          doc_number,
          doc_date,
          doc_status,
          performer_id,
          claim_id,
        username,
        editing_by_user_id,
        editing_since,
        timestamptz,
        date_created
      FROM your_workorders
      WHERE id = $2
    `,
      [current_sections, id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения Workorder по ID:", err);
    throw new Error("Не удалось получить Workorder:" + String(err));
  }
}

export async function fetchWorkorderForm(id: string, current_sections: string) {
  try {
    const data = await pool.query<WorkorderForm>(
      `
      WITH your_workorders AS ( SELECT * FROM workorders where section_id = 
        ANY ($1::uuid[]))

        SELECT
        workorders.id,
        workorders.name,
          workorders.doc_number,
          workorders.doc_date,
          workorders.doc_status,
          workorders.performer_id,
          workorders.claim_id,         
        workorders.claim_id,
        workorders.username,
        workorders.section_id,
        workorders.editing_by_user_id,
        workorders.editing_since,
        workorders.timestamptz,
        COALESCE(sections.name, '') AS section_name,
        COALESCE(claims.name, '') AS claim_name,
        COALESCE(machines.name, '') AS claim_machine_name,
        COALESCE(claims.machine_id, '00000000-0000-0000-0000-000000000000'::uuid) AS claim_machine_id,
        COALESCE(persons.name, '') AS performer_name
      FROM your_workorders workorders
      LEFT JOIN sections ON workorders.section_id = sections.id
      LEFT JOIN claims ON workorders.claim_id = claims.id
      LEFT JOIN machines ON claims.machine_id = machines.id
      LEFT JOIN persons ON workorders.performer_id = persons.id
      WHERE workorders.id = $2
    `,
      [current_sections, id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения формы Workorder:", err);
    throw new Error("Не удалось получить данные формы Workorder.");
  }
}

export async function fetchWorkorders(current_sections: string) {
  try {
    const data = await pool.query<Workorder>(
      `
      WITH your_workorders AS ( SELECT * FROM workorders where section_id = 
        ANY ($1::uuid[]))

        SELECT
        id,
        name,
          doc_number,
          doc_date,
          doc_status,
          performer_id,        
        claim_id,
        section_id,
        username,
        timestamptz,
        date_created
      FROM your_workorders
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

export async function fetchWorkordersForm(current_sections: string) {
  try {
    const data = await pool.query<WorkorderForm>(
      `
      WITH your_workorders AS ( SELECT * FROM workorders where section_id = 
        ANY ($1::uuid[]))

      SELECT
        workorders.id,
        workorders.name,
          workorders.doc_number,
          workorders.doc_date,
          workorders.doc_status,
          workorders.performer_id,
          workorders.claim_id,        
        workorders.claim_id,
        workorders.username,
        workorders.timestamptz,
        COALESCE(sections.name, '') AS section_name,
        COALESCE(claims.name, '') AS claim_name,
        COALESCE(machines.name, '') AS claim_machine_name,
        COALESCE(claims.machine_id, '00000000-0000-0000-0000-000000000000'::uuid) AS claim_machine_id,
        COALESCE(persons.name, '') AS performer_name
      FROM your_workorders workorders
      LEFT JOIN sections ON workorders.section_id = sections.id
      LEFT JOIN claims ON workorders.claim_id = claims.id
      LEFT JOIN machines ON claims.machine_id = machines.id
      LEFT JOIN persons ON workorders.performer_id = persons.id
      ORDER BY workorders.name ASC
    `,
      [current_sections]
    );

    return data.rows;
  } catch (err) {
    console.error("Ошибка получения форм Workorders:", err);
    throw new Error("Не удалось загрузить формы Workorders:" + String(err));
  }
}

//#endregion

//#region Filtered Workorders

export async function fetchFilteredWorkorders(
  query: string,
  currentPage: number,
  current_sections: string
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  // console.log( "current_sections: " + current_sections);
  // const sectionsArray = current_sections
  //     .split(',')
  //     .map(id => id.trim())
  //     .filter(id => id !== '');
  try {
    const workorders = await pool.query<WorkorderForm>(
      `
      WITH your_workorders AS ( SELECT * FROM workorders where section_id = 
        ANY ($1::uuid[]))

        SELECT
        workorders.id,
        workorders.name,
          workorders.doc_number,
          workorders.doc_date,
          workorders.doc_status,
          workorders.performer_id,
          workorders.claim_id,
        workorders.username,
        workorders.timestamptz,
        COALESCE(sections.name, '') AS section_name,
        COALESCE(claims.name, '') AS claim_name,
        COALESCE(machines.name, '') AS claim_machine_name,
        COALESCE(claims.machine_id, '00000000-0000-0000-0000-000000000000'::uuid) AS claim_machine_id,
        COALESCE(persons.name, '') AS performer_name
      FROM your_workorders workorders
      LEFT JOIN sections ON workorders.section_id = sections.id
      LEFT JOIN claims ON workorders.claim_id = claims.id
      LEFT JOIN machines ON claims.machine_id = machines.id
      LEFT JOIN persons ON workorders.performer_id = persons.id
      WHERE
        workorders.name ILIKE $2
      ORDER BY workorders.name ASC
      LIMIT $3 OFFSET $4
    `,
      [current_sections, `%${query}%`, ITEMS_PER_PAGE, offset]
    );

    return workorders.rows;
  } catch (error) {
    console.error("Ошибка фильтрации Workorders (таблица workorders):", error);
    throw new Error("Не удалось загрузить отфильтрованные Workorders:" + error);
  }
}

export async function fetchWorkordersPages(
  query: string,
  current_sections: string
) {
  try {
    const count = await pool.query(
      `
      WITH your_workorders AS ( SELECT * FROM workorders where section_id = 
        ANY ($1::uuid[]))

        SELECT COUNT(*) FROM your_workorders workorders
      WHERE workorders.name ILIKE $2
    `,
      [current_sections, `%${query}%`]
    );

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Ошибка подсчёта страниц Workorders:", error);
    throw new Error(
      "Не удалось определить количество страниц: " + String(error)
    );
  }
}

//#endregion
