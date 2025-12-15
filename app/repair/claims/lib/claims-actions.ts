// Claims actions

"use server";

import { z } from "zod";
import pool from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ClaimForm, Claim } from "@/app/lib/definitions";

const ITEMS_PER_PAGE = 8;

//#region Create Claim

export async function createClaim(claim: Claim) {
  const session = await auth();
  const username = session?.user?.name;
  const date_created = new Date().toISOString();
  const {
    name,
    section_id,
    tenant_id,
    author_id,
  } = claim;
  try {
    await pool.query(
      `
      INSERT INTO claims (
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
    section_id,
    tenant_id,
    author_id,
  } = claim;

  try {
    await pool.query(
      `
      UPDATE claims SET
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

export async function fetchClaim(id: string) {
  try {
    const data = await pool.query<Claim>(
      `
      SELECT
        id,
        name,
        username,
        editing_by_user_id,
        editing_since,
        timestamptz,
        date_created
      FROM claims
      WHERE id = $1
    `,
      [id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения Claim по ID:", err);
    throw new Error("Не удалось получить Claim:" + String(err));
  }
}

export async function fetchClaimForm(id: string) {
  try {
    const data = await pool.query<ClaimForm>(
      `
      SELECT
        claims.id,
        claims.name,
        claims.username,
        claims.section_id,
        claims.editing_by_user_id,
        claims.editing_since,
        claims.timestamptz,
        sections.name AS section_name
      FROM claims
      LEFT JOIN sections ON claims.section_id = sections.id
      WHERE claims.id = $1
    `,
      [id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Ошибка получения формы Claim:", err);
    throw new Error("Не удалось получить данные формы Claim.");
  }
}

export async function fetchClaims() {
  try {
    const data = await pool.query<Claim>(
      `
      SELECT
        id,
        name,
        section_id,
        username,
        timestamptz,
        date_created
      FROM claims
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

export async function fetchClaimsForm() {
  try {
    const data = await pool.query<ClaimForm>(
      `
      SELECT
        claims.id,
        claims.name,
        claims.username,
        claims.timestamptz
      FROM claims
      ORDER BY claims.name ASC
    `,
      []
    );

    return data.rows;
  } catch (err) {
    console.error("Ошибка получения форм Claims:", err);
    throw new Error("Не удалось загрузить формы Claims:" + String(err));
  }
}

//#endregion

//#region Filtered Claims

export async function fetchFilteredClaims(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const claims = await pool.query<ClaimForm>(
      `
      SELECT
        claims.id,
        claims.name,
        claims.username,
        claims.timestamptz
      FROM claims
      WHERE
        claims.name ILIKE $1
      ORDER BY claims.name ASC
      LIMIT $2 OFFSET $3
    `,
      [`%${query}%`, ITEMS_PER_PAGE, offset]
    );

    return claims.rows;
  } catch (error) {
    console.error("Ошибка фильтрации Claims (таблица claims):", error);
    throw new Error("Не удалось загрузить отфильтрованные Claims:" + error);
  }
}

export async function fetchClaimsPages(query: string) {
  try {
    const count = await pool.query(
      `
      SELECT COUNT(*) FROM claims
      WHERE claims.name ILIKE $1
    `,
      [`%${query}%`]
    );

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Ошибка подсчёта страниц Claims:", error);
    throw new Error("Не удалось определить количество страниц.");
  }
}

//#endregion
