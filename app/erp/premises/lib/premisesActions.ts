// Premises actions

"use server";

import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Premise, PremiseForm, RegionForm } from "@/app/lib/definitions";
import { SetStateAction } from "react";

const ITEMS_PER_PAGE = 8;



// export type PremiseErrState = {
//   errors?: {
//     name?: string[];
//     description?: string[];
//     cadastral_number?: string[];
//     square?: string[];
//     address?: string[];
//     address_alt?: string[];
//     type?: string[];
//     status?: string[];
//     status_until?: string[];
//     region_name?: string[];
//     owner_name?: string[];
//     operator_name?: string[];
//     section_name?: string[];
//   };
//   message?: string | null;
// };




//#region Update Delete Premise

export async function deletePremise(id: string) {
  try {
    await sql`DELETE FROM premises WHERE id = ${id}`;
  } catch (error) {
    console.error("Database Error, Failed to Delete premise:", error);
    throw new Error("Database Error: Failed to Delete premise");
  }
  revalidatePath("/erp/premises");
}

export async function createPremise(
  premise: PremiseForm,
) {

    try {
    await sql`
      INSERT INTO premises (name, description, cadastral_number, square, address, address_alt, 
      type, status, status_until, region_id, owner_id, operator_id, section_id, username, date_created)
      VALUES (
      ${premise.name}, 
      ${premise.description}, 
      ${premise.cadastral_number}, 
      ${premise.square}, 
      ${premise.address}, 
      ${premise.address_alt}, 
      ${premise.type}, 
      ${premise.status}, 
      ${premise.status_until.toISOString()}, 
      ${premise.region_id}, 
      ${premise.owner_id}, 
      ${premise.operator_id}, 
      ${premise.section_id}, 
      ${premise.username}, 
      ${premise.date_created ? premise.date_created.toISOString() : new Date().toISOString()}
    )
    `;
  } catch (error) {
    console.error("Failed to create premise:", error);
    // throw new Error("Failed to create newLegalEntity.");
    return {
      message: "Database Error: Failed to create new premise.",
      // errors: undefined,
    };
  }
  revalidatePath("/erp/premises");
  redirect("/erp/premises");
}
export async function updatePremise(premise: Premise) {
  const date = new Date().toISOString(); //.split("T")[0]

  const session = await auth();
  const username = session?.user?.name;
  // const section_id = "e21e9372-91c5-4856-a123-b6f3b53efc0f";

  try {
    await sql`
UPDATE premises
SET 
    name = ${premise.name},
    description = ${premise.description},
    cadastral_number = ${premise.cadastral_number},
    square = ${premise.square},
    address = ${premise.address},
    address_alt = ${premise.address_alt},
    type = ${premise.type},
    status = ${premise.status},
    status_until = ${premise.status_until.toISOString()},
    region_id = ${premise.region_id},
    owner_id = ${premise.owner_id},
    operator_id = ${premise.operator_id},
    section_id = ${premise.section_id},
    username = ${username}
WHERE id = ${premise.id};
    `;
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
    const data = await sql<Premise>`
    WITH your_premises AS ( SELECT * FROM premises where section_id = 
ANY (${current_sections}::uuid[]))

      SELECT
        id,
        name,
        description,
        cadastral_number,
        square,
        address,
        address_alt,
        type,
        status,
        status_until,
        region_id,
        owner_id,
        operator_id,
        section_id,
        username,
        timestamptz,
        date_created
      FROM your_premises premises
      WHERE id = ${id}
    `;

    const premise = data.rows[0];
    return premise;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch premise!");
  }
}
export async function fetchPremiseForm(id: string, current_sections: string) {
  try {
    const data = await sql<PremiseForm>`
      WITH your_premises AS ( SELECT * FROM premises where section_id = 
        ANY (${current_sections}::uuid[]))

      SELECT
        p.id,
        p.name,
        p.description,
        p.cadastral_number,
        p.square,
        p.address,
        p.address_alt,
        p.type,
        p.status,
        p.status_until,
        p.region_id,
        p.owner_id,
        p.operator_id,
        p.section_id,
        p.username,
        p.timestamptz,
        p.date_created,
          COALESCE(r.name, '') as region_name,
          COALESCE(le_owner.name, '') as owner_name,
          COALESCE(le_operator.name, '') as operator_name,
          COALESCE(s.name, '') as section_name
      FROM your_premises p
      LEFT JOIN sections s on p.section_id = s.id
      LEFT JOIN regions r on p.region_id = r.id
      LEFT JOIN legal_entities le_owner ON p.owner_id = le_owner.id
      LEFT JOIN legal_entities le_operator ON p.operator_id = le_operator.id
      WHERE p.id = ${id}
    `;

    const premise = data.rows[0];
    return premise;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch premise!");
  }
}
export async function fetchPremises(current_sections: string) {
  try {
    const data = await sql<Premise>`
      WITH your_premises AS ( SELECT * FROM premises where section_id = 
        ANY (${current_sections}::uuid[]))

      SELECT
        id,
        name,
        description,
        cadastral_number,
        square,
        address,
        address_alt,
        type,
        status,
        status_until,
        region_id,
        owner_id,
        operator_id,
        section_id,
        username,
        timestamptz,
        date_created
      FROM your_premises premises
      ORDER BY name ASC
    `;

    const premises = data.rows;
    return premises;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all premises.");
  }
}

export async function fetchPremisesForm(current_sections: string) {
  try {
    const data = await sql<PremiseForm>`
      WITH your_premises AS ( SELECT * FROM premises where section_id = 
        ANY (${current_sections}::uuid[]))

      SELECT
        p.id,
        p.name,
        p.description,
        p.cadastral_number,
        p.square,
        p.address,
        p.address_alt,
        p.type,
        p.status,
        p.status_until,
        p.region_id,
        p.owner_id,
        p.operator_id,
        p.section_id,
        p.username,
        p.timestamptz,
        p.date_created,
          COALESCE(r.name, '') as region_name,
          COALESCE(le_owner.name, '') as owner_name,
          COALESCE(le_operator.name, '') as operator_name,
          COALESCE(s.name, '') as section_name
      FROM your_premises p
      LEFT JOIN sections s on p.section_id = s.id
      LEFT JOIN regions r on p.region_id = r.id
      LEFT JOIN legal_entities le_owner ON p.owner_id = le_owner.id
      LEFT JOIN legal_entities le_operator ON p.operator_id = le_operator.id
      ORDER BY name ASC
    `;

    const premises = data.rows;
    return premises;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all premises.");
  }
}
export async function fetchFilteredPremises(
  query: string,
  currentPage: number,
  current_sections: string
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const premises = await sql<PremiseForm>`
      WITH your_premises AS ( SELECT * FROM premises where section_id = 
        ANY (${current_sections}::uuid[]))

      SELECT
        p.id,
        p.name,
        p.description,
        p.cadastral_number,
        p.square,
        p.address,
        p.address_alt,
        p.type,
        p.status,
        p.status_until,
        p.region_id,
        p.owner_id,
        p.operator_id,
        p.section_id,
        p.username,
        p.timestamptz,
        p.date_created,
          r.name as region_name,
          le_owner.name as owner_name,
          le_operator.name as operator_name,
          s.name as section_name
      FROM your_premises p
      LEFT JOIN sections s on p.section_id = s.id
      LEFT JOIN regions r on p.region_id = r.id
      LEFT JOIN legal_entities le_owner ON p.owner_id = le_owner.id
      LEFT JOIN legal_entities le_operator ON p.operator_id = le_operator.id

      WHERE
        p.name ILIKE ${`%${query}%`} OR
        p.description ILIKE ${`%${query}%`} OR
        p.address ILIKE ${`%${query}%`} OR
        p.address_alt ILIKE ${`%${query}%`}
      ORDER BY name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return premises.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch premises.");
  }
}

export async function fetchPremisesPages(query: string, current_sections: string) {
  try {
    const count = await sql`
    WITH your_premises AS ( SELECT * FROM premises where section_id = 
      ANY (${current_sections}::uuid[]))

    SELECT COUNT(*)
    FROM your_premises premises
    WHERE
        name ILIKE ${`%${query}%`} OR
        description ILIKE ${`%${query}%`} OR
        address ILIKE ${`%${query}%`} OR
        address_alt ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of premises.");
  }
}

//#endregion
