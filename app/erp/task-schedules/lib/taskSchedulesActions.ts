// TaskSchedules actions

"use server";

import pool from "@/db"; // Импорт пула подключений
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Premise, PremiseForm, TaskSchedule, TaskScheduleForm } from "@/app/lib/definitions";

const ITEMS_PER_PAGE = 8;

//#region Update Delete TaskSchedule

export async function deleteTaskSchedule(id: string) {
  try {
    await pool.query("DELETE FROM task_schedules WHERE id = $1", [id]);
  } catch (error) {
    console.error("Database Error, Failed to Delete TaskSchedule:", error);
    throw new Error("Database Error: Failed to Delete TaskSchedule");
  }
  revalidatePath("/erp/task-schedules");
}

export async function createTaskSchedule(
  taskSchedule: TaskScheduleForm,
) {
  const {
    name,
    description,
    premise_id,
    schedule_owner_id,
    date_start,
    date,
    date_end,
    section_id,
    username,
    date_created,
  } = taskSchedule;

  try {
    await pool.query(
      `INSERT INTO task_schedules (
        name, description, premise_id, schedule_owner_id, 
        date, date_start, date_end, section_id, username, date_created
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      )`,
      [
        name,
        description,
        premise_id,
        schedule_owner_id,
        date_start.toISOString(),
        date.toISOString(),
        date_end.toISOString(),
        section_id,
        username,
        date_created ? date_created.toISOString() : new Date().toISOString(),
      ]
    );
  } catch (error) {
    console.error("Failed to create taskSchedule:", error);
    return {
      message: "Database Error: Failed to create new taskSchedule.",
    };
  }
  revalidatePath("/erp/task-schedules");
  redirect("/erp/task-schedules");
}

export async function updateTaskSchedule(taskSchedule: TaskSchedule) {
  const date = new Date().toISOString();
  const session = await auth();
  const username = session?.user?.name;

  const {
    id,
    name,
    description,
    premise_id,
    schedule_owner_id,
    date: dateField,
    date_start,
    date_end,
    section_id,
  } = taskSchedule;

  try {
    await pool.query(
      `UPDATE task_schedules
       SET 
         name = $1,
         description = $2,
         premise_id = $3,
         schedule_owner_id = $4,
         date = $5,
         date_start = $6,
         date_end = $7,
         section_id = $8,
         username = $9
       WHERE id = $10`,
      [
        name,
        description,
        premise_id,
        schedule_owner_id,
        dateField.toISOString(),
        date_start.toISOString(),
        date_end.toISOString(),
        section_id,
        username,
        id,
      ]
    );
  } catch (error) {
    console.error("Failed to update task_schedule:", error);
    throw new Error("Failed to update task_schedule.");
  }
  revalidatePath("/erp/task-schedules");
}

//#endregion

//#region fetchTaskSchedule

export async function fetchTaskSchedule(id: string, current_sections: string) {
  try {
    const result = await pool.query<TaskSchedule>(
      `WITH your_task_schedules AS (
         SELECT * FROM task_schedules 
         WHERE section_id = ANY ($1::uuid[])
       )
       SELECT
         id, name, description, premise_id, schedule_owner_id,
         date, date_start, date_end, section_id, username, timestamptz, date_created
       FROM your_task_schedules
       WHERE id = $2`,
      [current_sections, id]
    );

    return result.rows[0];
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch task_schedule!");
  }
}

export async function fetchTaskScheduleForm(id: string, current_sections: string) {
  try {
    const result = await pool.query<TaskScheduleForm>(
      `WITH your_task_schedules AS (
         SELECT * FROM task_schedules 
         WHERE section_id = ANY ($1::uuid[])
       )
       SELECT
         ts.id, ts.name, ts.description, ts.premise_id, ts.schedule_owner_id,
         ts.date, ts.date_start, ts.date_end, ts.section_id, ts.username,
         ts.timestamptz, ts.date_created,
         COALESCE(p.name, '') as premise_name,
         COALESCE(le.name, '') as schedule_owner_name,
         COALESCE(s.name, '') as section_name
       FROM your_task_schedules ts
       LEFT JOIN sections s ON ts.section_id = s.id
       LEFT JOIN legal_entities le ON ts.schedule_owner_id = le.id
       LEFT JOIN premises p ON ts.premise_id = p.id
       WHERE ts.id = $2`,
      [current_sections, id]
    );

    return result.rows[0];
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch task_schedule!");
  }
}

export async function fetchTaskSchedulesForm(current_sections: string) {
  try {
    const result = await pool.query<TaskScheduleForm>(
      `WITH your_task_schedules AS (
         SELECT * FROM task_schedules 
         WHERE section_id = ANY ($1::uuid[])
       )
       SELECT
         ts.id, ts.name, ts.description, ts.premise_id, ts.schedule_owner_id,
         ts.date, ts.date_start, ts.date_end, ts.section_id, ts.username,
         ts.timestamptz, ts.date_created,
         COALESCE(p.name, '') as premise_name,
         COALESCE(le.name, '') as schedule_owner_name,
         COALESCE(s.name, '') as section_name
       FROM your_task_schedules ts
       LEFT JOIN sections s ON ts.section_id = s.id
       LEFT JOIN legal_entities le ON ts.schedule_owner_id = le.id
       LEFT JOIN premises p ON ts.premise_id = p.id
       ORDER BY ts.name ASC`,
      [current_sections]
    );

    return result.rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all task_schedules.");
  }
}

export async function fetchFilteredTaskSchedules(
  query: string,
  currentPage: number,
  current_sections: string
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const searchTerm = `%${query}%`;

  try {
    const result = await pool.query<TaskScheduleForm>(
      `WITH your_task_schedules AS (
         SELECT * FROM task_schedules 
         WHERE section_id = ANY ($1::uuid[])
       )
       SELECT
         ts.id, ts.name, ts.description, ts.premise_id, ts.schedule_owner_id,
         ts.date, ts.date_start, ts.date_end, ts.section_id, ts.username,
         ts.timestamptz, ts.date_created,
         COALESCE(p.name, '') as premise_name,
         COALESCE(le.name, '') as schedule_owner_name,
         COALESCE(s.name, '') as section_name
       FROM your_task_schedules ts
       LEFT JOIN sections s ON ts.section_id = s.id
       LEFT JOIN legal_entities le ON ts.schedule_owner_id = le.id
       LEFT JOIN premises p ON ts.premise_id = p.id
       WHERE
         ts.name ILIKE $2 OR
         ts.description ILIKE $3 OR
         p.name ILIKE $4 OR
         le.name ILIKE $5
       ORDER BY ts.name ASC
       LIMIT $6 OFFSET $7`,
      [current_sections, searchTerm, searchTerm, searchTerm, searchTerm, ITEMS_PER_PAGE, offset]
    ) as { rows: TaskScheduleForm[] };

    return result.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch task_schedules.");
  }
}

export async function fetchTaskSchedulesPages(query: string, current_sections: string) {
  const searchTerm = `%${query}%`;

  try {
    const result = await pool.query(
      `WITH your_task_schedules AS (
         SELECT * FROM task_schedules 
         WHERE section_id = ANY ($1::uuid[])
       )
       SELECT COUNT(*)
       FROM your_task_schedules ts
       LEFT JOIN sections s ON ts.section_id = s.id
       LEFT JOIN legal_entities le ON ts.schedule_owner_id = le.id
       LEFT JOIN premises p ON ts.premise_id = p.id
       WHERE
         ts.name ILIKE $2 OR
         ts.description ILIKE $3 OR
         p.name ILIKE $4 OR
         le.name ILIKE $5`,
      [current_sections, searchTerm, searchTerm, searchTerm, searchTerm]
    );

    const totalPages = Math.ceil(Number(result.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of task_schedules.");
  }
}

//#endregion