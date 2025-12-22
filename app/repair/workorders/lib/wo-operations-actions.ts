// Wo_operations actions

"use server";

import { WoOperation, WoOperationForm } from "@/app/lib/definitions";
// import { z } from "zod";
import pool from "@/db";
// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";
// import { WorkorderForm, Workorder } from "@/app/lib/definitions";

// const ITEMS_PER_PAGE = 8;

//#region Create wo_operation

export async function createWoOperation(wo_operation: {
  id: string;
  name: string;
  workorder_id: string;
  work_id: string;
  operation_id: string;
  hours_norm: number;
  hours_fact: number;
  completed: boolean;
  section_id: string;
}): Promise<string> {
  const { name, workorder_id, work_id, operation_id, hours_norm, hours_fact, completed, section_id } =
    wo_operation;
  console.log("createWoOperation section_id: " + section_id);
  try {
    const result = await pool.query(
      `
      INSERT INTO wo_operations (
    name,
    workorder_id,
    work_id,
    operation_id,
    hours_norm,
    hours_fact,
    completed,
    section_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::uuid)
       returning id
    `,
      [name, workorder_id, work_id, operation_id, hours_norm, hours_fact, completed, section_id]
    );
    const id = result.rows[0].id;
    return id;
  } catch (error) {
    console.error("Не удалось создать wo_operation:", error);
    throw new Error("Не удалось создать wo_operation:" + String(error));
  }

  //   revalidatePath("/repair/workorders");
}

//#endregion

//#region Update/Delete wo_operation

export async function updateWoOperation(wo_operation: WoOperation) {
  const {
    id,
    name,
    workorder_id,
    work_id,
    operation_id,
    hours_norm,
    hours_fact,
    completed,
    section_id,
  } = wo_operation;

  try {
    await pool.query<WoOperation>(
      `
      UPDATE wo_operations 
      SET
    name = $2,
    workorder_id = $3,
    work_id = $4,
    operation_id = $5,
    hours_norm = $6,
    hours_fact = $7,
    completed = $8,
    section_id = $9
      WHERE id = $1
    `,
    [name, workorder_id, work_id, operation_id, hours_norm, hours_fact, completed, section_id]

    );
  } catch (error) {
    console.error("Не удалось обновить wo_operation:", error);
    throw new Error(
      "Ошибка базы данных: Не удалось обновить wo_operation: " + String(error)
    );
  }

  //   revalidatePath("/repair/workorders");
}

export async function deleteWoOperation(id: string) {
  try {
    await pool.query(`DELETE FROM wo_operations WHERE id = $1`, [id]);
  } catch (error) {
    console.error("Ошибка удаления wo_operation:", error);
    throw new Error(
      "Ошибка базы данных: Не удалось удалить wo_operation: " + String(error)
    );
  }
  //   revalidatePath("/repair/workorders");
}

//#endregion

export async function fetchWoOperationsForm(
  workorder_id: string,
  current_sections: string
) {
  try {
    const data = await pool.query<WoOperationForm>(
      `
      WITH your_wo_operations AS ( SELECT * FROM wo_operations where section_id = 
        ANY ($1::uuid[]))

        SELECT
    wo_operations.id,
    wo_operations.name,
    wo_operations.workorder_id,
    wo_operations.work_id,
    wo_operations.operation_id,
    wo_operations.hours_norm,
    wo_operations.hours_fact,
    wo_operations.completed,
    wo_operations.section_id,        
        COALESCE(sections.name, '') AS section_name,
        COALESCE(workorders.name, '') AS workorder_name,
        COALESCE(operations.name, '') AS operation_name,
        COALESCE(works.name, '') AS work_name
      FROM your_wo_operations wo_operations 
      LEFT JOIN sections ON wo_operations.section_id = sections.id
      LEFT JOIN workorders ON wo_operations.workorder_id = workorders.id
      LEFT JOIN works ON wo_operations.work_id = works.id
      LEFT JOIN operations ON wo_operations.operation_id = operations.id
          WHERE wo_operations.workorder_id = $2
    `,
      [current_sections, workorder_id]
    );

    return data.rows;
  } catch (err) {
    console.error("Ошибка получения формы wo_operations:", err);
    throw new Error("Не удалось получить данные формы wo_operations.");
  }
}
