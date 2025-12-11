// Premises actions

"use server";
// import { z } from "zod";
import pool from "@/db"; // Используем пул подключений
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Premise, PremiseForm, RegionForm } from "@/app/lib/definitions";
// import { SetStateAction } from "react";

const ITEMS_PER_PAGE = 8;

//#region Update Delete Premise
export async function deletePremise(id: string) {
  try {
    await pool.query("DELETE FROM premises WHERE id = $1", [id]); // Параметризованный запрос
  } catch (error) {
    console.error("Database Error, Failed to Delete premise:", error);
    throw new Error("Database Error: Failed to Delete premise");
  }
  revalidatePath("/erp/premises");
}

export async function createPremise(premise: PremiseForm) {
  const dateCreated = premise.date_created
    ? premise.date_created.toISOString()
    : new Date().toISOString();

  try {
    await pool.query(
      `
      INSERT INTO premises (
        name, description, cadastral_number, square, address, address_alt, 
        type, status, status_until, region_id, owner_id, operator_id, section_id, 
        tenant_id, username, user_tags, access_tags, date_created
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      )`,
      [
        premise.name,
        premise.description,
        premise.cadastral_number,
        premise.square,
        premise.address,
        premise.address_alt,
        premise.type,
        premise.status,
        premise.status_until.toISOString(),
        premise.region_id,
        premise.owner_id,
        premise.operator_id,
        premise.section_id,
        premise.tenant_id,
        premise.username,
        JSON.stringify(premise.user_tags),
        JSON.stringify(premise.access_tags),
        dateCreated,
      ]
    );
  } catch (error) {
    console.error("Failed to create premise:", error);
    return {
      message: "Database Error: Failed to create new premise.",
    };
  }
  revalidatePath("/erp/premises");
  // redirect("/erp/premises");
}

export async function updatePremise(premise: Premise) {
  const session = await auth();
  const username = session?.user?.name;
    // console.log("premise userTags: " + JSON.stringify(premise.user_tags),);
    console.log("premise tenant_id: " + JSON.stringify(premise.tenant_id),);

  try {
    await pool.query(
      `
      UPDATE premises
      SET 
        name = $1,
        description = $2,
        cadastral_number = $3,
        square = $4,
        address = $5,
        address_alt = $6,
        type = $7,
        status = $8,
        status_until = $9,
        region_id = $10,
        owner_id = $11,
        operator_id = $12,
        section_id = $13,
        tenant_id = $14,
        username = $15,
        user_tags = $16,
        access_tags = $17
      WHERE id = $18`,
      [
        premise.name,
        premise.description,
        premise.cadastral_number,
        premise.square,
        premise.address,
        premise.address_alt,
        premise.type,
        premise.status,
        premise.status_until.toISOString(),
        premise.region_id,
        premise.owner_id,
        premise.operator_id,
        premise.section_id,
        premise.tenant_id,
        username,
        JSON.stringify(premise.user_tags),
        JSON.stringify(premise.access_tags),
        premise.id,
      ]
    );
  } catch (error) {
    console.error("Failed to update premise:", error);
    throw new Error("Failed to update premise.");
  }
  revalidatePath("/erp/premises");
}
//#endregion

//#region fetchPremise
export async function fetchPremise(id: string, current_sections: string) {
  try {
    const result = await pool.query<Premise>(
      `
      WITH your_premises AS (
        SELECT * FROM premises 
        WHERE section_id = ANY ($1::uuid[])
      )
      SELECT
        id, name, description, cadastral_number, square, address, address_alt,
        type, status, status_until, region_id, owner_id, operator_id, section_id,
        tenant_id, username, timestamptz, date_created, p.user_tags, p.access_tags
      FROM your_premises
      WHERE id = $2`,
      [current_sections, id]
    );

    return result.rows[0];
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch premise!");
  }
}

export async function fetchPremiseForm(id: string, current_sections: string) {
  try {
    const result = await pool.query<PremiseForm>(
      `
      WITH your_premises AS (
        SELECT * FROM premises 
        WHERE section_id = ANY ($1::uuid[])
      )
      SELECT
        p.id, p.name, p.description, p.cadastral_number, p.square, p.address, p.address_alt,
        p.type, p.status, p.status_until, p.region_id, p.owner_id, p.operator_id, p.section_id,
        p.tenant_id, p.username, p.timestamptz, p.date_created, p.user_tags, p.access_tags,
        COALESCE(r.name, '') as region_name,
        COALESCE(le_owner.name, '') as owner_name,
        COALESCE(le_operator.name, '') as operator_name,
        COALESCE(s.name, '') as section_name
      FROM your_premises p
      LEFT JOIN sections s ON p.section_id = s.id
      LEFT JOIN regions r ON p.region_id = r.id
      LEFT JOIN legal_entities le_owner ON p.owner_id = le_owner.id
      LEFT JOIN legal_entities le_operator ON p.operator_id = le_operator.id
      WHERE p.id = $2`,
      [current_sections, id]
    );

    return result.rows[0];
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch premise!");
  }
}
//#endregion

//#region fetchPremises
export async function fetchPremises(current_sections: string) {
  try {
    const result = await pool.query<Premise>(
      `
      WITH your_premises AS (
        SELECT * FROM premises 
        WHERE section_id = ANY ($1::uuid[])
      )
      SELECT
        id, name, description, cadastral_number, square, address, address_alt,
        type, status, status_until, region_id, owner_id, operator_id, section_id,
        tenant_id, username, timestamptz, date_created
      FROM your_premises
      ORDER BY name ASC`,
      [current_sections]
    );

    return result.rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all premises.");
  }
}

export async function fetchPremisesForm(current_sections: string) {
  try {
    const result = await pool.query<PremiseForm>(
      `
      WITH your_premises AS (
        SELECT * FROM premises 
        WHERE section_id = ANY ($1::uuid[])
      )
      SELECT
        p.id, p.name, p.description, p.cadastral_number, p.square, p.address, p.address_alt,
        p.type, p.status, p.status_until, p.region_id, p.owner_id, p.operator_id, p.section_id,
        p.tenant_id, p.username, p.timestamptz, p.date_created,
        COALESCE(r.name, '') as region_name,
        COALESCE(le_owner.name, '') as owner_name,
        COALESCE(le_operator.name, '') as operator_name,
        COALESCE(s.name, '') as section_name
      FROM your_premises p
      LEFT JOIN sections s ON p.section_id = s.id
      LEFT JOIN regions r ON p.region_id = r.id
      LEFT JOIN legal_entities le_owner ON p.owner_id = le_owner.id
      LEFT JOIN legal_entities le_operator ON p.operator_id = le_operator.id
      ORDER BY name ASC`,
      [current_sections]
    );

    return result.rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all premises.");
  }
}
//#endregion

//#region Search
export async function fetchFilteredPremises(
  query: string,
  currentPage: number,
  current_sections: string
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const searchQuery = `%${query}%`;

  try {
    const result = (await pool.query<PremiseForm>(
      `
      WITH your_premises AS (
        SELECT * FROM premises 
        WHERE section_id = ANY ($1::uuid[])
      )
      SELECT
        p.id, p.name, p.description, p.cadastral_number, p.square, p.address, p.address_alt,
        p.type, p.status, p.status_until, p.region_id, p.owner_id, p.operator_id, p.section_id,
        p.tenant_id, p.username, p.timestamptz, p.date_created,
        r.name as region_name,
        le_owner.name as owner_name,
        le_operator.name as operator_name,
        s.name as section_name
      FROM your_premises p
      LEFT JOIN sections s ON p.section_id = s.id
      LEFT JOIN regions r ON p.region_id = r.id
      LEFT JOIN legal_entities le_owner ON p.owner_id = le_owner.id
      LEFT JOIN legal_entities le_operator ON p.operator_id = le_operator.id
      WHERE
        p.name ILIKE $2 OR
        p.description ILIKE $2 OR
        p.address ILIKE $2 OR
        p.address_alt ILIKE $2
      ORDER BY name ASC
      LIMIT $3 OFFSET $4`,
      [current_sections, searchQuery, ITEMS_PER_PAGE, offset]
    )) as { rows: PremiseForm[] };

    return result.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch premises.");
  }
}

export async function fetchPremisesPages(
  query: string,
  current_sections: string
) {
  const searchQuery = `%${query}%`;

  try {
    const result = await pool.query(
      `
      WITH your_premises AS (
        SELECT * FROM premises 
        WHERE section_id = ANY ($1::uuid[])
      )
      SELECT COUNT(*)
      FROM your_premises
      WHERE
        name ILIKE $2 OR
        description ILIKE $2 OR
        address ILIKE $2 OR
        address_alt ILIKE $2`,
      [current_sections, searchQuery]
    );

    const totalPages = Math.ceil(Number(result.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of premises.");
  }
}
//#endregion
