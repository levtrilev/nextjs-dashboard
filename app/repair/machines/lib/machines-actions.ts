// Machines actions

"use server";

// import { z } from "zod";
import pool from "@/db";
import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";
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
    model,
    number,
    machine_status,
    unit_id,
    location_id,
    section_id,
    tenant_id,
    author_id,
  } = machine;
  try {
    await pool.query(
      `
      INSERT INTO machines (
        name, model, number, machine_status, unit_id, location_id,
        username, section_id, timestamptz,
        tenant_id, author_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `,
      [
        name,
        model,
        number,
        machine_status,
        unit_id,
        location_id,
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
    model,
    number,
    machine_status,
    unit_id,
    location_id,
    section_id,
    tenant_id,
    author_id,
    doc_status,
  } = machine;

  try {
    await pool.query(
      `
      UPDATE machines SET
        name = $1, model = $2, number = $3, machine_status = $4, unit_id = $5, location_id = $6,
        username = $7,
        section_id = $9,
        tenant_id = $10,
        author_id = $11,
        doc_status = $12,
        timestamptz = now()
      WHERE id = $8
    `,
      [
        name,
        model,
        number,
        machine_status,
        unit_id,
        location_id,
        username,
        id,
        section_id,
        tenant_id,
        author_id,
        doc_status,
      ]
    );
  } catch (error) {
    console.error("Не удалось обновить Machine:", error);
    throw new Error(
      "Ошибка базы данных: Не удалось обновить Machine: " + String(error)
    );
  }

  revalidatePath("/repair/machines");
}

export async function deleteMachine(id: string) {
  try {
    await pool.query(`DELETE FROM machines WHERE id = $1`, [id]);
  } catch (error) {
    console.error("Ошибка удаления Machine:", error);
    throw new Error(
      "Ошибка базы данных: Не удалось удалить Machine: " + String(error)
    );
  }
  revalidatePath("/repair/machines");
}

//#endregion

//#region Fetch Machines

export async function fetchMachine(id: string, current_sections: string) {
  try {
    const data = await pool.query<Machine>(
      `
      WITH your_machines AS ( SELECT * FROM machines where section_id = 
        ANY ($1::uuid[]))

      SELECT
        id,
        name, model, number, machine_status, unit_id, location_id,
        username,
        editing_by_user_id,
        editing_since,
        timestamptz,
        date_created,
        section_id,
        tenant_id,
        author_id,
        editor_id,
        doc_status
      FROM your_machines
      WHERE id = $2
    `,
      [current_sections, id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения Machine по ID:", err);
    throw new Error("Не удалось получить Machine:" + String(err));
  }
}

export async function fetchMachineForm(id: string, current_sections: string) {
  try {
    const data = await pool.query<MachineForm>(
      `
      WITH your_machines AS ( SELECT * FROM machines where section_id = 
        ANY ($1::uuid[]))

      SELECT
        machines.id,
        machines.name, machines.name, machines.model, machines.number, machines.machine_status, machines.unit_id, machines.location_id,
        machines.username,
        machines.section_id,
        machines.tenant_id,
        machines.author_id,
        machines.editor_id,
        machines.doc_status,
        machines.editing_by_user_id,
        machines.editing_since,
        machines.timestamptz,
        sections.name AS section_name,
        COALESCE(units.name, '') as unit_name,
        COALESCE(locations.name, '') as location_name
      FROM your_machines machines
      LEFT JOIN sections ON machines.section_id = sections.id
      LEFT JOIN units ON machines.unit_id = units.id
      LEFT JOIN locations ON machines.location_id = locations.id
      WHERE machines.id = $2
    `,
      [current_sections, id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения формы Machine:", err);
    throw new Error("Не удалось получить данные формы Machine: " + String(err));
  }
}

export async function fetchMachines(current_sections: string) {
  try {
    const data = await pool.query<Machine>(
      `
      WITH your_machines AS ( SELECT * FROM machines where section_id = 
        ANY ($1::uuid[]))

      SELECT
        id,
        name, model, number, machine_status, unit_id, location_id,
        section_id,
        tenant_id,
        author_id,
        editor_id,
        doc_status,
        username,
        timestamptz,
        date_created
      FROM your_machines
      ORDER BY name ASC
    `,
      [current_sections]
    );

    return data.rows;
  } catch (err) {
    console.error("Ошибка получения списка задач:", err);
    throw new Error("Не удалось загрузить список задач: " + String(err));
  }
}

export async function fetchMachinesForm(current_sections: string) {
  try {
    const data = await pool.query<MachineForm>(
      `
      WITH your_machines AS ( SELECT * FROM machines where section_id = 
        ANY ($1::uuid[]))

      SELECT
        machines.id,
        machines.name,
        machines.unit_id,
        machines.location_id,
        machines.machine_status,
        machines.model,
        machines.number,
        machines.section_id,
        machines.tenant_id,
        machines.author_id,
        machines.editor_id,
        machines.doc_status,
        machines.date_created,
        machines.username,
        machines.timestamptz,
        sections.name AS section_name,
        COALESCE(units.name, '') as unit_name,
        COALESCE(locations.name, '') as location_name
      FROM your_machines machines
      LEFT JOIN sections ON machines.section_id = sections.id
      LEFT JOIN units ON machines.unit_id = units.id
      LEFT JOIN locations ON machines.location_id = locations.id
      ORDER BY machines.name ASC
    `,
      [current_sections]
    );

    return data.rows;
  } catch (err) {
    console.error("Ошибка получения форм Machines:", err);
    throw new Error("Не удалось загрузить формы Machines:" + String(err));
  }
}

//#endregion

//#region Filtered Machines

export async function fetchFilteredMachines(
  query: string,
  currentPage: number, 
  current_sections: string,
  status: string = 'парк'
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const machines = await pool.query<MachineForm>(
      `
      WITH your_machines AS ( SELECT * FROM machines where section_id = 
        ANY ($1::uuid[]))

      SELECT
        machines.id,
        machines.name,
        machines.unit_id,
        machines.location_id,
        machines.machine_status,
        machines.model,
        machines.number,
        machines.section_id,
        machines.tenant_id,
        machines.author_id,
        machines.editor_id,
        machines.doc_status,
        machines.username,
        machines.timestamptz,
        sections.name AS section_name,
        COALESCE(units.name, '') as unit_name,
        COALESCE(locations.name, '') as location_name
      FROM your_machines machines
      LEFT JOIN sections ON machines.section_id = sections.id
      LEFT JOIN units ON machines.unit_id = units.id
      LEFT JOIN locations ON machines.location_id = locations.id
      WHERE
        machines.name ILIKE $2 
        AND ($5 = 'парк' OR $5 = 'персонал' OR machines.machine_status = $5)
      ORDER BY machines.name ASC
      LIMIT $3 OFFSET $4
    `,
      [current_sections, `%${query}%`, ITEMS_PER_PAGE, offset, status]
    );

    return machines.rows;
  } catch (error) {
    console.error("Ошибка фильтрации Объектов(таблица machines):", error);
    throw new Error(
      "Не удалось загрузить отфильтрованные Объекты: " + String(error)
    );
  }
}

export async function fetchMachinesPages(query: string, current_sections: string) {
  try {
    const count = await pool.query(
      `
      WITH your_machines AS ( SELECT * FROM machines where section_id = 
        ANY ($1::uuid[]))

      SELECT COUNT(*) FROM your_machines
      WHERE your_machines.name ILIKE $2
    `,
      [current_sections, `%${query}%`]
    );

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Ошибка подсчёта страниц Machines:", error);
    throw new Error(
      "Не удалось определить количество страниц: " + String(error)
    );
  }
}

//#endregion
