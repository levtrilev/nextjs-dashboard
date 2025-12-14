// Machines actions

"use server";

import { z } from "zod";
import pool from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MachineForm, Machine } from "@/app/lib/definitions";

const ITEMS_PER_PAGE = 8;

//#region Create Task

export async function createMachine(machine: Machine) {
  const session = await auth();
  const username = session?.user?.name;
  const date_created = new Date().toISOString();
  const {
    name,
    section_id,
    tenant_id,
    author_id,
  } = machine;
  try {
    await pool.query(
      `
      INSERT INTO machines (
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
    console.error("Не удалось создать Machine:", error);
    throw new Error("Не удалось создать Machine:" + String(error));
  }

  revalidatePath("/repair/machines");
  // redirect("/repair/machines");
}

//#endregion

//#region Update/Delete Machine

export async function updateMachine(machine: Machine) {
  const session = await auth();
  const username = session?.user?.name;

  const {
    id,
    name,
    section_id,
    tenant_id,
    author_id,
  } = machine;

  try {
    await pool.query(
      `
      UPDATE machines SET
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
    console.error("Не удалось обновить Machine:", error);
    throw new Error("Ошибка базы данных: Не удалось обновить Machine: " + error);
  }

  revalidatePath("/repair/machines");
}

export async function deleteMachine(id: string) {
  try {
    await pool.query(`DELETE FROM machines WHERE id = $1`, [id]);
  } catch (error) {
    console.error("Ошибка удаления Machine:", error);
    throw new Error("Ошибка базы данных: Не удалось удалить Machine.");
  }
  revalidatePath("/repair/machines");
}

//#endregion

//#region Fetch Machines

export async function fetchMachine(id: string) {
  try {
    const data = await pool.query<Machine>(
      `
      SELECT
        id,
        name,
        username,
        editing_by_user_id,
        editing_since,
        timestamptz,
        date_created
      FROM machines
      WHERE id = $1
    `,
      [id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения Machine по ID:", err);
    throw new Error("Не удалось получить Machine:" + String(err));
  }
}

export async function fetchMachineForm(id: string) {
  try {
    const data = await pool.query<MachineForm>(
      `
      SELECT
        machines.id,
        machines.name,
        machines.username,
        machines.section_id,
        machines.editing_by_user_id,
        machines.editing_since,
        machines.timestamptz,
        sections.name AS section_name
      FROM machines
      LEFT JOIN sections ON machines.section_id = sections.id
      WHERE machines.id = $1
    `,
      [id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения формы Machine:", err);
    throw new Error("Не удалось получить данные формы Machine.");
  }
}

export async function fetchMachines() {
  try {
    const data = await pool.query<Machine>(
      `
      SELECT
        id,
        name,
        section_id,
        username,
        timestamptz,
        date_created
      FROM machines
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

export async function fetchMachinesForm() {
  try {
    const data = await pool.query<MachineForm>(
      `
      SELECT
        machines.id,
        machines.name,
        machines.username,
        machines.timestamptz
      FROM machines
      ORDER BY machines.name ASC
    `,
      []
    );

    return data.rows;
  } catch (err) {
    console.error("Ошибка получения форм Machines:", err);
    throw new Error("Не удалось загрузить формы Machines:" + String(err));
  }
}

//#endregion

//#region Filtered Machines

export async function fetchFilteredMachines(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const machines = await pool.query<MachineForm>(
      `
      SELECT
        machines.id,
        machines.name,
        machines.username,
        machines.timestamptz
      FROM machines
      WHERE
        machines.name ILIKE $1
      ORDER BY machines.name ASC
      LIMIT $2 OFFSET $3
    `,
      [`%${query}%`, ITEMS_PER_PAGE, offset]
    );

    return machines.rows;
  } catch (error) {
    console.error("Ошибка фильтрации Объектов(таблица machines):", error);
    throw new Error("Не удалось загрузить отфильтрованные Объекты:" + error);
  }
}

export async function fetchMachinesPages(query: string) {
  try {
    const count = await pool.query(
      `
      SELECT COUNT(*) FROM machines
      WHERE machines.name ILIKE $1
    `,
      [`%${query}%`]
    );

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Ошибка подсчёта страниц Machines:", error);
    throw new Error("Не удалось определить количество страниц.");
  }
}

//#endregion

export async function unlockRecord(recordId: string, userId: string) {
  // console.log("unlockRecord user.id: ", userId);
  await pool.query(
    `
      UPDATE machines
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
      UPDATE machines
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