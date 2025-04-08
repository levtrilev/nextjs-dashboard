// TaskSchedules actions

"use server";

import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Premise, PremiseForm, TaskSchedule, TaskScheduleForm } from "@/app/lib/definitions";

const ITEMS_PER_PAGE = 8;


//#region Update Delete TaskSchedule

export async function deleteTaskSchedule(id: string) {
  try {
    await sql`DELETE FROM task_schedules WHERE id = ${id}`;
  } catch (error) {
    console.error("Database Error, Failed to Delete TaskSchedule:", error);
    throw new Error("Database Error: Failed to Delete TaskSchedule");
  }
  revalidatePath("/erp/task-schedules");
}

export async function createTaskSchedule(
  taskSchedule: TaskScheduleForm,
) {

    try {
    await sql`
      INSERT INTO task_schedules (name, description, premise_id, schedule_owner_id, date, date_start, 
      date_end, section_id, username, date_created)
      VALUES (
      ${taskSchedule.name}, 
      ${taskSchedule.description}, 
      ${taskSchedule.premise_id}, 
      ${taskSchedule.schedule_owner_id},
      ${taskSchedule.date_start.toISOString()}, 
      ${taskSchedule.date.toISOString()}, 
      ${taskSchedule.date_end.toISOString()}, 
      ${taskSchedule.section_id}, 
      ${taskSchedule.username}, 
      ${taskSchedule.date_created ? taskSchedule.date_created.toISOString() : new Date().toISOString()}
    )
    `;
  } catch (error) {
    console.error("Failed to create taskSchedule:", error);
    // throw new Error("Failed to create taskSchedule.");
    return {
      message: "Database Error: Failed to create new taskSchedule.",
      // errors: undefined,
    };
  }
  revalidatePath("/erp/task-schedules");
  redirect("/erp/task-schedules");
}

export async function updateTaskSchedule(taskSchedule: TaskSchedule) {
  const date = new Date().toISOString(); //.split("T")[0]

  const session = await auth();
  const username = session?.user?.name;
  // const section_id = "e21e9372-91c5-4856-a123-b6f3b53efc0f";

  try {
    await sql`
UPDATE task_schedules
SET 
    name = ${taskSchedule.name},
    description = ${taskSchedule.description},
    premise_id = ${taskSchedule.premise_id},
    schedule_owner_id = ${taskSchedule.schedule_owner_id},
    date = ${taskSchedule.date.toISOString()},
    date_start = ${taskSchedule.date_start.toISOString()},
    date_end = ${taskSchedule.date_end.toISOString()},
    section_id = ${taskSchedule.section_id},
    username = ${username}
WHERE id = ${taskSchedule.id};
    `;
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
    const data = await sql<TaskSchedule>`
    WITH your_task_schedules AS ( SELECT * FROM task_schedules where section_id = 
ANY (${current_sections}::uuid[]))

      SELECT
        id,
        name,
        description,
        premise_id,
        schedule_owner_id,
        date, 
        date_start, 
        date_end,
        section_id,
        username,
        timestamptz,
        date_created
      FROM your_task_schedules task_schedules
      WHERE id = ${id}
    `;

    const task_schedule = data.rows[0];
    return task_schedule;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch task_schedule!");
  }
}
export async function fetchTaskScheduleForm(id: string, current_sections: string) {
  try {
    const data = await sql<TaskScheduleForm>`
    WITH your_task_schedules AS ( SELECT * FROM task_schedules where section_id = 
      ANY (${current_sections}::uuid[]))

      SELECT
        ts.id,
        ts.name,
        ts.description,
        ts.premise_id,
        ts.schedule_owner_id,
        ts.date, 
        ts.date_start, 
        ts.date_end,
        ts.section_id,
        ts.username,
        ts.timestamptz,
        ts.date_created,
          COALESCE(p.name, '') as premise_name,
          COALESCE(le.name, '') as schedule_owner_name,
          COALESCE(s.name, '') as section_name
      FROM your_task_schedules ts
      LEFT JOIN sections s on ts.section_id = s.id
      LEFT JOIN legal_entities le ON ts.schedule_owner_id = le.id
      LEFT JOIN premises p ON ts.premise_id = p.id
      WHERE ts.id = ${id}
    `;

    const task_schedule = data.rows[0];
    return task_schedule;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch task_schedule!");
  }
}

export async function fetchTaskSchedulesForm(current_sections: string) {
  try {
    const data = await sql<TaskScheduleForm>`
    WITH your_task_schedules AS ( SELECT * FROM task_schedules where section_id = 
      ANY (${current_sections}::uuid[]))

      SELECT
        ts.id,
        ts.name,
        ts.description,
        ts.premise_id,
        ts.schedule_owner_id,
        ts.date, 
        ts.date_start, 
        ts.date_end,
        ts.section_id,
        ts.username,
        ts.timestamptz,
        ts.date_created,
          COALESCE(p.name, '') as premise_name,
          COALESCE(le.name, '') as schedule_owner_name,
          COALESCE(s.name, '') as section_name
      FROM your_task_schedules ts
      LEFT JOIN sections s on ts.section_id = s.id
      LEFT JOIN legal_entities le ON ts.schedule_owner_id = le.id
      LEFT JOIN premises p ON ts.premise_id = p.id
      ORDER BY name ASC
    `;

    const task_schedules = data.rows;
    return task_schedules;
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

  try {
    const data = await sql<TaskScheduleForm>`
    WITH your_task_schedules AS ( SELECT * FROM task_schedules where section_id = 
      ANY (${current_sections}::uuid[]))

      SELECT
        ts.id,
        ts.name,
        ts.description,
        ts.premise_id,
        ts.schedule_owner_id,
        ts.date, 
        ts.date_start, 
        ts.date_end,
        ts.section_id,
        ts.username,
        ts.timestamptz,
        ts.date_created,
          COALESCE(p.name, '') as premise_name,
          COALESCE(le.name, '') as schedule_owner_name,
          COALESCE(s.name, '') as section_name
      FROM your_task_schedules ts
      LEFT JOIN sections s on ts.section_id = s.id
      LEFT JOIN legal_entities le ON ts.schedule_owner_id = le.id
      LEFT JOIN premises p ON ts.premise_id = p.id

      WHERE
        ts.name ILIKE ${`%${query}%`} OR
        ts.description ILIKE ${`%${query}%`} OR
        p.name ILIKE ${`%${query}%`} OR
        le.name ILIKE ${`%${query}%`}
      ORDER BY ts.name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return data.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch task_schedules.");
  }
}

export async function fetchTaskSchedulesPages(query: string, current_sections: string) {
  try {
    const count = await sql`
    WITH your_task_schedules AS ( SELECT * FROM task_schedules where section_id = 
      ANY (${current_sections}::uuid[]))

    SELECT COUNT(*)

      FROM your_task_schedules ts
      LEFT JOIN sections s on ts.section_id = s.id
      LEFT JOIN legal_entities le ON ts.schedule_owner_id = le.id
      LEFT JOIN premises p ON ts.premise_id = p.id

      WHERE
        ts.name ILIKE ${`%${query}%`} OR
        ts.description ILIKE ${`%${query}%`} OR
        p.name ILIKE ${`%${query}%`} OR
        le.name ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of task_schedules.");
  }
}

//#endregion
