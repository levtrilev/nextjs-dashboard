// Claims actions

"use server";

import { z } from "zod";
import pool from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ClaimForm, Claim, Priority } from "@/app/lib/definitions";

const ITEMS_PER_PAGE = 8;

//#region Create Claim

export async function createClaim(claim: Claim) {
  const session = await auth();
  const username = session?.user?.name;
  const date_created = new Date().toISOString();
  const {
    name,
    claim_date,
    priority,
    machine_id,
    location_id,
    system_id,
    repair_todo,
    repair_reason,
    breakdown_reasons,
    emergency_act,
    created_by_person_id,
    approved_date,
    approved_by_person_id,
    accepted_date,
    accepted_by_person_id,
    section_id,
    tenant_id,
    author_id,
  } = claim;
  try {
    await pool.query(
      `
      INSERT INTO claims (
        name, 
    claim_date,
    priority,
    machine_id,
    location_id,
    system_id,
    repair_todo,
    repair_reason,
    breakdown_reasons,
    emergency_act,
    created_by_person_id,
    approved_date,
    approved_by_person_id,
    accepted_date,
    accepted_by_person_id, 
        username, section_id, timestamptz,
        tenant_id, author_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
    `,
      [
        name,
        (claim_date as Date).toISOString(),
        priority,
        machine_id,
        location_id,
        system_id,
        repair_todo,
        repair_reason,
        breakdown_reasons,
        emergency_act,
        created_by_person_id,
        new Date(approved_date as string),
        approved_by_person_id,
        new Date(accepted_date as string),
        accepted_by_person_id,
        username,
        section_id,
        date_created,
        tenant_id,
        author_id,
      ]
    );
  } catch (error) {
    console.error("Не удалось создать Claim:", error);
    throw new Error("Не удалось создать Claim:" + String(error));
  }

  revalidatePath("/repair/claims");
  // redirect("/repair/claims");
}

//#endregion

//#region Update/Delete Claim

export async function updateClaim(claim: Claim) {
  const session = await auth();
  const username = session?.user?.name;

  const {
    id,
    name,
    claim_date,
    created_by_person_id,
    priority,
    machine_id,
    location_id,
    system_id,
    repair_todo,
    repair_reason,
    breakdown_reasons,
    emergency_act,
    approved_date,
    approved_by_person_id,
    accepted_date,
    accepted_by_person_id,
    section_id,
    tenant_id,
    author_id,
  } = claim;

  try {
    await pool.query(
      `
      UPDATE claims SET
        name = $1,
        claim_date = $2,
        created_by_person_id = $3,
        priority = $4,
        machine_id = $5,
        location_id = $6,
        system_id = $7,
        repair_todo = $8,
        repair_reason = $9,
        breakdown_reasons = $10,
        emergency_act = $11,
        approved_date = $12,
        approved_by_person_id = $13,
        accepted_date = $14,
        accepted_by_person_id = $15,
        username = $16,
        section_id = $17,
        tenant_id = $18,
        author_id = $19,
        timestamptz = now()
      WHERE id = $20
    `,
      [
        name,
        (claim_date as Date).toISOString(),
        created_by_person_id,
        priority,
        machine_id,
        location_id,
        system_id,
        repair_todo,
        repair_reason,
        breakdown_reasons,
        emergency_act,
        new Date(approved_date as string),
        approved_by_person_id,
        new Date(accepted_date as string),
        accepted_by_person_id,
        username,
        section_id,
        tenant_id,
        author_id,
        id,
      ]
    );
  } catch (error) {
    console.error("Не удалось обновить Claim:", error);
    throw new Error("Ошибка базы данных: Не удалось обновить Claim: " + error);
  }

  revalidatePath("/repair/claims");
}

export async function deleteClaim(id: string) {
  try {
    await pool.query(`DELETE FROM claims WHERE id = $1`, [id]);
  } catch (error) {
    console.error("Ошибка удаления Claim:", error);
    throw new Error("Ошибка базы данных: Не удалось удалить Claim.");
  }
  revalidatePath("/repair/claims");
}

//#endregion

//#region Fetch Claims

export async function fetchClaim(id: string, current_sections: string) {
  try {
    const data = await pool.query<Claim>(
      `
      WITH your_claims AS ( SELECT * FROM claims where section_id = 
        ANY ($1::uuid[]))

        SELECT
        id,
        name,
    claim_date,
    created_by_person_id,
    priority,
    machine_id,
    location_id,
    system_id,
    repair_todo,
    repair_reason,
    breakdown_reasons,
    emergency_act,
    approved_date,
    approved_by_person_id,
    accepted_date,
    accepted_by_person_id,        
        username,
        editing_by_user_id,
        editing_since,
        timestamptz,
        date_created
      FROM your_claims
      WHERE id = $2
    `,
      [current_sections, id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения Claim по ID:", err);
    throw new Error("Не удалось получить Claim:" + String(err));
  }
}

export async function fetchClaimForm(id: string, current_sections: string) {
  try {
    const data = await pool.query<ClaimForm>(
      `
      WITH your_claims AS ( SELECT * FROM claims where section_id = 
        ANY ($1::uuid[]))

        SELECT
        claims.id,
        claims.name,
    claims.claim_date,
    created_by_person_id,       
    claims.priority,
    claims.machine_id,
    claims.location_id,
    claims.system_id,
    claims.repair_todo,
    claims.repair_reason,
    claims.breakdown_reasons,
    claims.emergency_act,
      claims.approved_date,
      claims.approved_by_person_id,
      claims.accepted_date,
      claims.accepted_by_person_id,         
        claims.username,
        claims.section_id,
        claims.tenant_id,
        claims.author_id,
        claims.editing_by_user_id,
        claims.editing_since,
        claims.timestamptz,
        COALESCE(machines.name, '') as machine_name,
        COALESCE(locations.name, '') as location_name,
        COALESCE(systems.name, '') as system_name,
        COALESCE(create_persons.name, '') as created_by_person_name,
        COALESCE(acc_persons.name, '') as accepted_by_person_name,
        COALESCE(app_persons.name, '') as approved_by_person_name,
        COALESCE(sections.name, '') as section_name,
        COALESCE(units.name, '') as machine_unit_name,
        COALESCE(machines.machine_status, '') as machine_machine_status
      FROM your_claims claims
      LEFT JOIN sections ON claims.section_id = sections.id
      LEFT JOIN machines ON claims.machine_id = machines.id
      LEFT JOIN locations ON claims.location_id = locations.id
      LEFT JOIN systems ON claims.system_id = systems.id
      LEFT JOIN persons create_persons ON claims.created_by_person_id = create_persons.id
      LEFT JOIN persons acc_persons ON claims.accepted_by_person_id = acc_persons.id
      LEFT JOIN persons app_persons ON claims.approved_by_person_id = app_persons.id
      LEFT JOIN units ON machines.unit_id = units.id
      WHERE claims.id = $2
    `,
      [current_sections, id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения формы Claim:", err);
    throw new Error("Не удалось получить данные формы Claim:" + String(err));
  }
}

export async function fetchClaims(current_sections: string) {
  try {
    const data = await pool.query<Claim>(
      `
      WITH your_claims AS ( SELECT * FROM claims where section_id = 
        ANY ($1::uuid[]))

        SELECT
        id,
        name,
    claim_date,
    created_by_person_id,
    priority,
    machine_id,
    location_id,
    system_id,
    repair_todo,
    repair_reason,
    breakdown_reasons,
    emergency_act,
    approved_date,
    approved_by_person_id,
    accepted_date,
    accepted_by_person_id,          
        section_id,
        tenant_id,
        author_id,
        username,
        timestamptz,
        date_created
      FROM your_claims
      ORDER BY name ASC
    `,
      [current_sections]
    );

    return data.rows;
  } catch (err) {
    console.error("Ошибка получения списка заявок:", err);
    throw new Error("Не удалось загрузить список заявок:" + String(err));
  }
}

export async function fetchClaimsForm(current_sections: string) {
  try {
    const data = await pool.query<ClaimForm>(
      `
      WITH your_claims AS ( SELECT * FROM claims where section_id = 
        ANY ($1::uuid[]))

        SELECT
        claims.id,
        claims.name,
    claims.claim_date,
    claims.created_by_person_id,
    claims.priority,
    claims.machine_id,
    claims.location_id,
    claims.system_id,
    claims.repair_todo,
    claims.repair_reason,
    claims.breakdown_reasons,
    claims.emergency_act,
      claims.approved_date,
      claims.approved_by_person_id,
      claims.accepted_date,
      claims.accepted_by_person_id,        
        claims.username,
        claims.section_id,
        claims.tenant_id,
        claims.author_id,
        claims.editing_by_user_id,
        claims.editing_since,
        claims.timestamptz,
        COALESCE(machines.name, '') as machine_name,
        COALESCE(locations.name, '') as location_name,
        COALESCE(systems.name, '') as system_name,
        COALESCE(create_persons.name, '') as created_by_person_name,
        COALESCE(acc_persons.name, '') as accepted_by_person_name,
        COALESCE(app_persons.name, '') as approved_by_person_name,
        COALESCE(sections.name, '') as section_name,
        COALESCE(units.name, '') as machine_unit_name,
        COALESCE(machines.machine_status, '') as machine_machine_status
      FROM your_claims claims
      LEFT JOIN sections ON claims.section_id = sections.id
      LEFT JOIN machines ON claims.machine_id = machines.id
      LEFT JOIN locations ON claims.location_id = locations.id
      LEFT JOIN systems ON claims.system_id = systems.id
      LEFT JOIN persons create_persons ON claims.created_by_person_id = create_persons.id
      LEFT JOIN persons acc_persons ON claims.accepted_by_person_id = acc_persons.id
      LEFT JOIN persons app_persons ON claims.approved_by_person_id = app_persons.id
      LEFT JOIN units ON machines.unit_id = units.id
      ORDER BY claims.name ASC
    `,
      [current_sections]
    );

    return data.rows;
  } catch (err) {
    console.error("Ошибка получения форм Claims:", err);
    throw new Error("Не удалось загрузить формы Claims:" + String(err));
  }
}

//#endregion

//#region Filtered Claims

export async function fetchFilteredClaims(
  query: string,
  currentPage: number,
  current_sections: string,
  machine_id: string = "00000000-0000-0000-0000-000000000000"
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const claims = await pool.query<ClaimForm>(
      `
      WITH your_claims AS ( SELECT * FROM claims where section_id = 
        ANY ($1::uuid[]))

        SELECT
        claims.id,
        claims.name,
    claims.claim_date,
    claims.created_by_person_id,
    claims.priority,
    claims.machine_id,
    claims.location_id,
    claims.system_id,
    claims.repair_todo,
    claims.repair_reason,
    claims.breakdown_reasons,
    claims.emergency_act,
      claims.approved_date,
      claims.approved_by_person_id,
      claims.accepted_date,
      claims.accepted_by_person_id,        
        claims.username,
        claims.section_id,
        claims.tenant_id,
        claims.author_id,
        claims.editing_by_user_id,
        claims.editing_since,
        claims.timestamptz,
        sections.name AS section_name,
    machines.name AS machine_name,
    locations.name AS location_name,
    systems.name AS system_name,
    create_persons.name AS created_by_person_name,
    acc_persons.name AS accepted_by_person_name,
    app_persons.name AS approved_by_person_name,
    units.name as machine_unit_name,
    machines.machine_status as machine_machine_status
      FROM your_claims claims
      LEFT JOIN sections ON claims.section_id = sections.id
      LEFT JOIN machines ON claims.machine_id = machines.id
      LEFT JOIN locations ON claims.location_id = locations.id
      LEFT JOIN persons create_persons ON claims.created_by_person_id = create_persons.id
      LEFT JOIN persons acc_persons ON claims.accepted_by_person_id = acc_persons.id
      LEFT JOIN persons app_persons ON claims.approved_by_person_id = app_persons.id
      LEFT JOIN systems ON claims.system_id = systems.id
      LEFT JOIN units ON machines.unit_id = units.id
      WHERE
        claims.name ILIKE $2
        AND ($3 = '00000000-0000-0000-0000-000000000000'::uuid OR claims.machine_id = $3)
      ORDER BY claims.name ASC
      LIMIT $4 OFFSET $5
    `,
      [current_sections, `%${query}%`, machine_id, ITEMS_PER_PAGE, offset]
    );

    return claims.rows;
  } catch (error) {
    console.error("Ошибка фильтрации Claims (таблица claims):", error);
    throw new Error(
      "Не удалось загрузить отфильтрованные Claims:" + String(error)
    );
  }
}

export async function fetchClaimsPages(
  query: string,
  current_sections: string
) {
  try {
    const count = await pool.query(
      `
      WITH your_claims AS ( SELECT * FROM claims where section_id = 
        ANY ($1::uuid[]))

        SELECT COUNT(*) FROM your_claims claims
      WHERE claims.name ILIKE $2
    `,
      [current_sections, `%${query}%`]
    );

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Ошибка подсчёта страниц Claims:", error);
    throw new Error("Не удалось определить количество страниц.");
  }
}

//#endregion
