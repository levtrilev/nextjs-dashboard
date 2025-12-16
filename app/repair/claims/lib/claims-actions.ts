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
    repair_todo,
    repair_reason,
    breakdown_reasons,
    emergency_act,
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
    repair_todo,
    repair_reason,
    breakdown_reasons,
    emergency_act,
        username, section_id, timestamptz,
        tenant_id, author_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `,
      [name,
    (claim_date as Date).toISOString(),
    priority,
    machine_id,
    location_id,
    repair_todo,
    repair_reason,
    breakdown_reasons,
    emergency_act,         
        username, section_id, date_created, tenant_id, author_id]
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

  const { id, name,
    claim_date,
    priority,
    machine_id,
    location_id,
    repair_todo,
    repair_reason,
    breakdown_reasons,
    emergency_act, 
      section_id, tenant_id, author_id } = claim;

  try {
    await pool.query(
      `
      UPDATE claims SET
        name = $1,
        claim_date = $2,
        priority = $3,
        machine_id = $4,
        location_id = $5,
        repair_todo = $6,
        repair_reason = $7,
        breakdown_reasons = $8,
        emergency_act = $9,
        username = $10,
        section_id = $11,
        tenant_id = $12,
        author_id = $13,
        timestamptz = now()
      WHERE id = $14
    `,
      [name,
    claim_date,
    priority,
    machine_id,
    location_id,
    repair_todo,
    repair_reason,
    breakdown_reasons,
    emergency_act, 
      username, section_id, tenant_id, author_id, id]
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

export async function fetchClaim(id: string, 
  current_sections: string) {
  try {
    const data = await pool.query<Claim>(
      `
      WITH your_claims AS ( SELECT * FROM claims where section_id = 
        ANY ($1::uuid[]))

        SELECT
        id,
        name,
    claim_date,
    priority,
    machine_id,
    location_id,
    repair_todo,
    repair_reason,
    breakdown_reasons,
    emergency_act,        
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

export async function fetchClaimForm(id: string, 
  current_sections: string) {
  try {
    const data = await pool.query<ClaimForm>(
      `
      WITH your_claims AS ( SELECT * FROM claims where section_id = 
        ANY ($1::uuid[]))

        SELECT
        claims.id,
        claims.name,
    claims.claim_date,        
    claims.priority,
    claims.machine_id,
    claims.location_id,
    claims.repair_todo,
    claims.repair_reason,
    claims.breakdown_reasons,
    claims.emergency_act,        
        claims.username,
        claims.section_id,
        claims.tenant_id,
        claims.author_id,
        claims.editing_by_user_id,
        claims.editing_since,
        claims.timestamptz,
        sections.name AS section_name,
        COALESCE(machines.name, '') as machine_name,
        COALESCE(locations.name, '') as location_name,
        COALESCE(sections.name, '') as section_name
      FROM your_claims claims
      LEFT JOIN sections ON claims.section_id = sections.id
      LEFT JOIN machines ON claims.machine_id = machines.id
      LEFT JOIN locations ON claims.location_id = locations.id
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
    priority,
    machine_id,
    location_id,
    repair_todo,
    repair_reason,
    breakdown_reasons,
    emergency_act,          
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
    console.error("Ошибка получения списка задач:", err);
    throw new Error("Не удалось загрузить список задач:" + String(err));
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
    claims.priority,
    claims.machine_id,
    claims.location_id,
    claims.repair_todo,
    claims.repair_reason,
    claims.breakdown_reasons,
    claims.emergency_act,        
        claims.username,
        claims.section_id,
        claims.tenant_id,
        claims.author_id,
        claims.editing_by_user_id,
        claims.editing_since,
        claims.timestamptz,
        COALESCE(machines.name, '') as machine_name,
        COALESCE(locations.name, '') as location_name,
        COALESCE(sections.name, '') as section_name
    machines.name AS machine_name,
    locations.name AS location_name
      FROM your_claims claims
      LEFT JOIN sections ON claims.section_id = sections.id
      LEFT JOIN machines ON claims.machine_id = machines.id
      LEFT JOIN locations ON claims.location_id = locations.id
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

export async function fetchFilteredClaims(query: string, currentPage: number, 
  current_sections: string) {
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
    claims.priority,
    claims.machine_id,
    claims.location_id,
    claims.repair_todo,
    claims.repair_reason,
    claims.breakdown_reasons,
    claims.emergency_act,        
        claims.username,
        claims.section_id,
        claims.tenant_id,
        claims.author_id,
        claims.editing_by_user_id,
        claims.editing_since,
        claims.timestamptz,
        sections.name AS section_name,
    machines.name AS machine_name,
    locations.name AS location_name
      FROM your_claims claims
      LEFT JOIN sections ON claims.section_id = sections.id
      LEFT JOIN machines ON claims.machine_id = machines.id
      LEFT JOIN locations ON claims.location_id = locations.id
      WHERE
        claims.name ILIKE $2
      ORDER BY claims.name ASC
      LIMIT $3 OFFSET $4
    `,
      [current_sections, `%${query}%`, ITEMS_PER_PAGE, offset]
    );

    return claims.rows;
  } catch (error) {
    console.error("Ошибка фильтрации Claims (таблица claims):", error);
    throw new Error("Не удалось загрузить отфильтрованные Claims:" + String(error));
  }
}

export async function fetchClaimsPages(query: string, 
  current_sections: string) {
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
