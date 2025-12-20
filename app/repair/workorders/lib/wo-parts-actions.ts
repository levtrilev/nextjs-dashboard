// Wo_parts actions

"use server";

import { WoPart, WoPartForm } from "@/app/lib/definitions";
// import { z } from "zod";
import pool from "@/db";
// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";
// import { WorkorderForm, Workorder } from "@/app/lib/definitions";

// const ITEMS_PER_PAGE = 8;

//#region Create wo_operation

export async function createWoPart(wo_part: WoPart) {

  const { name, workorder_id, work_id, part_id, quantity, section_id } =
    wo_part;
  try {
    await pool.query(
      `
      INSERT INTO wo_parts (
    name,
    workorder_id,
    work_id,
    part_id,
    quantity,
    section_id
      ) VALUES ($1, $2, $3, $4, $5, $6)
       returning id
    `,
      [name, workorder_id, work_id, part_id, quantity, section_id]
    );
  } catch (error) {
    console.error("Не удалось создать wo_part:", error);
    throw new Error("Не удалось создать wo_part:" + String(error));
  }

  //   revalidatePath("/repair/workorders");
}

//#endregion

//#region Update/Delete wo_operation

export async function updateWoPart(wo_operation: WoPart) {

  const {
    id,
    name,
    workorder_id,
    work_id,
    part_id,
    quantity,
    section_id,
  } = wo_operation;

  try {
    await pool.query<WoPart>(
      `
      UPDATE wo_parts 
      SET
    name = $2,
    workorder_id = $3,
    work_id = $4,
    part_id = $5,
    quantity = $6,
    section_id = $7
      WHERE id = $1
    `,
      [id, name, workorder_id, work_id, part_id, quantity, section_id]
    );
  } catch (error) {
    console.error("Не удалось обновить wo_operation:", error);
    throw new Error(
      "Ошибка базы данных: Не удалось обновить wo_operation: " + String(error)
    );
  }

//   revalidatePath("/repair/workorders");
}

export async function deleteWoPart(id: string) {
  try {
    await pool.query(`DELETE FROM wo_parts WHERE id = $1`, [id]);
  } catch (error) {
    console.error("Ошибка удаления wo_part:", error);
    throw new Error("Ошибка базы данных: Не удалось удалить wo_part: " + String(error));
  }
//   revalidatePath("/repair/workorders");
}

//#endregion

export async function fetchWoPartsForm(workorder_id: string, current_sections: string) {
  try {
    const data = await pool.query<WoPartForm>(
      `
      WITH your_wo_parts AS ( SELECT * FROM wo_parts where section_id = 
        ANY ($1::uuid[]))

        SELECT
    wo_parts.id,
    wo_parts.name,
    wo_parts.workorder_id,
    wo_parts.work_id,
    wo_parts.part_id,
    wo_parts.quantity,
    wo_parts.section_id,        
        COALESCE(sections.name, '') AS section_name,
        COALESCE(workorders.name, '') AS workorder_name,
        COALESCE(parts.name, '') AS part_name,
        COALESCE(works.name, '') AS work_name
      FROM your_wo_parts wo_parts 
      LEFT JOIN sections ON wo_parts.section_id = sections.id
      LEFT JOIN workorders ON wo_parts.workorder_id = workorders.id
      LEFT JOIN works ON wo_parts.work_id = works.id
      LEFT JOIN parts ON wo_parts.part_id = parts.id
          WHERE wo_parts.workorder_id = $2
    `,
      [current_sections, workorder_id]
    );

    return data.rows;
  } catch (err) {
    console.error("Ошибка получения формы wo_parts:", err);
    throw new Error("Не удалось получить данные формы wo_parts.");
  }
}
