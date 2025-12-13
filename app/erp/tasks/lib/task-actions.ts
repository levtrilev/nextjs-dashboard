// Tasks actions

"use server";

import { z } from "zod";
import pool from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Task, TaskForm } from "@/app/lib/definitions";

const ITEMS_PER_PAGE = 8;

//#region Create Task

// export type TaskState = {
//   errors?: {
//     name?: string[];
//     date_start?: string[];
//     date_end?: string[];
//     task_schedule_id?: string[];
//     period_days?: string[];
//     section_id?: string[];
//   };
//   message?: string | null;
// };

// const TaskFormSchema = z.object({
//   id: z.string().optional(),
//   name: z.string().min(2, {
//     message: "Название должно содержать не менее 2 символов.",
//   }),
//   date_start: z.union([z.string(), z.date()]),
//   date_end: z.union([z.string(), z.date()]),
//   task_schedule_id: z.string().uuid(),
//   is_periodic: z.boolean(),
//   period_days: z.number().nullable(),
//   section_id: z.string().min(1, {
//     message: "Раздел обязателен.",
//   }),
// });

// const CreateTask = TaskFormSchema.omit({ id: true });
// const UpdateTask = TaskFormSchema.omit({});

// export async function createTask(
//   formData: FormData
// ) {
//   const validatedFields = CreateTask.safeParse({
//     name: formData.get("name"),
//     date_start: formData.get("date_start") || undefined,
//     date_end: formData.get("date_end") || undefined,
//     task_schedule_id: formData.get("task_schedule_id") || "",
//     is_periodic: formData.get("is_periodic") === "true",
//     period_days: Number(formData.get("period_days")) || null,
//     section_id: formData.get("section_id") || "",
//   });

//   if (!validatedFields.success) {
//     return {
//       errors: validatedFields.error.flatten().fieldErrors,
//       message: "Ошибка валидации. Не удалось создать задачу.",
//     };
//   }

//   const {
//     name,
//     date_start,
//     date_end,
//     task_schedule_id,
//     is_periodic,
//     period_days,
//     section_id,
//   } = validatedFields.data;

export async function createTask(task: Task) {
  const session = await auth();
  const username = session?.user?.name;
  const date_created = new Date().toISOString();
  const {
    name,
    date_start,
    date_end,
    task_schedule_id,
    is_periodic,
    period_days,
    section_id,
  } = task;
  try {
    await pool.query(
      `
      INSERT INTO tasks (
        name, date_start, date_end, task_schedule_id,
        is_periodic, period_days, 
        username, section_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
      [
        name,
        date_start,
        date_end,
        task_schedule_id,
        is_periodic,
        period_days,
        username,
        section_id,
      ]
    );
  } catch (error) {
    console.error("Не удалось создать задачу:", error);
    return {
      message: "Ошибка базы данных: Не удалось создать задачу: " + error,
    };
  }

  revalidatePath("/erp/tasks");
  redirect("/erp/tasks");
}

//#endregion

//#region Update/Delete Task

export async function updateTask(task: Task) {
  const session = await auth();
  const username = session?.user?.name;

  const {
    id,
    name,
    date_start,
    date_end,
    task_schedule_id,
    is_periodic,
    period_days,
    section_id,
  } = task;

  try {
    await pool.query(
      `
      UPDATE tasks SET
        name = $1,
        date_start = $2,
        date_end = $3,
        task_schedule_id = $4,
        is_periodic = $5,
        period_days = $6,
        username = $7,
        section_id = $9,
        timestamptz = now()
      WHERE id = $8
    `,
      [
        name,
        date_start,
        date_end,
        task_schedule_id,
        is_periodic,
        period_days,
        username,
        id,
        section_id,
      ]
    );
  } catch (error) {
    console.error("Не удалось обновить задачу:", error);
    throw new Error("Ошибка базы данных: Не удалось обновить задачу: " + error);
  }

  revalidatePath("/erp/tasks");
}

export async function deleteTask(id: string) {
  try {
    await pool.query(`DELETE FROM tasks WHERE id = $1`, [id]);
  } catch (error) {
    console.error("Ошибка удаления задачи:", error);
    throw new Error("Ошибка базы данных: Не удалось удалить задачу.");
  }
  revalidatePath("/erp/tasks");
}

//#endregion

//#region Fetch Tasks

export async function fetchTask(id: string) {
  try {
    const data = await pool.query<Task>(
      `
      SELECT
        id,
        name,
        date_start,
        date_end,
        task_schedule_id,
        is_periodic,
        period_days,
        username,
        editing_by_user_id,
        editing_since,
        timestamptz,
        date_created
      FROM tasks
      WHERE id = $1
    `,
      [id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения задачи по ID:", err);
    throw new Error("Не удалось получить задачу.");
  }
}

export async function fetchTaskForm(id: string) {
  try {
    const data = await pool.query<TaskForm>(
      `
      SELECT
        tasks.id,
        tasks.name,
        tasks.date_start,
        tasks.date_end,
        tasks.task_schedule_id,
        tasks.is_periodic,
        tasks.period_days,
        tasks.username,
        tasks.editing_by_user_id,
        tasks.editing_since,
        tasks.timestamptz,
        sections.name AS section_name,
        task_schedules.name AS task_schedule_name
      FROM tasks
      LEFT JOIN sections ON tasks.section_id = sections.id
      LEFT JOIN task_schedules ON tasks.task_schedule_id = task_schedules.id
      WHERE tasks.id = $1
    `,
      [id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения формы задачи:", err);
    throw new Error("Не удалось получить данные формы задачи.");
  }
}

export async function fetchTasks() {
  try {
    const data = await pool.query<Task>(
      `
      SELECT
        id,
        name,
        date_start,
        date_end,
        task_schedule_id,
        is_periodic,
        period_days,
        section_id,
        username,
        timestamptz,
        date_created
      FROM tasks
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

export async function fetchTasksForm() {
  try {
    const data = await pool.query<TaskForm>(
      `
      SELECT
        tasks.id,
        tasks.name,
        tasks.date_start,
        tasks.date_end,
        tasks.task_schedule_id,
        tasks.is_periodic,
        tasks.period_days,
        tasks.username,
        tasks.timestamptz
      FROM tasks
      ORDER BY tasks.name ASC
    `,
      []
    );

    return data.rows;
  } catch (err) {
    console.error("Ошибка получения форм задач:", err);
    throw new Error("Не удалось загрузить формы задач.");
  }
}

export async function fetchScheduleTasksForm(schedule_id: string) {
  try {
    const data = await pool.query<TaskForm>(
      `
      SELECT
        tasks.id,
        tasks.name,
        tasks.date_start,
        tasks.date_end,
        tasks.task_schedule_id,
        tasks.is_periodic,
        tasks.period_days,
        tasks.username,
        tasks.timestamptz
      FROM tasks
      WHERE tasks.task_schedule_id = $1
      ORDER BY tasks.name ASC
    `,
      [schedule_id]
    );

    return data.rows;
  } catch (err) {
    console.error("Ошибка получения форм задач:", err);
    throw new Error("Не удалось загрузить формы задач.");
  }
}

//#endregion

//#region Filtered Tasks

export async function fetchFilteredTasks(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const tasks = await pool.query<TaskForm>(
      `
      SELECT
        tasks.id,
        tasks.name,
        tasks.date_start,
        tasks.date_end,
        tasks.task_schedule_id,
        tasks.is_periodic,
        tasks.period_days,
        tasks.username,
        tasks.timestamptz
      FROM tasks
      WHERE
        tasks.name ILIKE $1
      ORDER BY tasks.name ASC
      LIMIT $2 OFFSET $3
    `,
      [`%${query}%`, ITEMS_PER_PAGE, offset]
    );

    return tasks.rows;
  } catch (error) {
    console.error("Ошибка фильтрации задач:", error);
    throw new Error("Не удалось загрузить отфильтрованные задачи.");
  }
}

export async function fetchTasksPages(query: string) {
  try {
    const count = await pool.query(
      `
      SELECT COUNT(*) FROM tasks
      WHERE tasks.name ILIKE $1
    `,
      [`%${query}%`]
    );

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Ошибка подсчёта страниц задач:", error);
    throw new Error("Не удалось определить количество страниц.");
  }
}

//#endregion

export async function unlockRecord(recordId: string, userId: string) {
  // console.log("unlockRecord user.id: ", userId);
  await pool.query(
    `
      UPDATE tasks
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
      UPDATE tasks
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
