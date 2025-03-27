// Premises actions

"use server";

import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Premise, PremiseForm, RegionForm } from "@/app/lib/definitions";

const ITEMS_PER_PAGE = 8;

//#Premises CreatePremise

// export type PremiseForm = {
// id: string;
// name: string;
// description: string;
// cadastral_number: string;
// address: string;
// address_alt: string;
// type: string;
// status: string;
// status_until: DateTime;
// region_id: string;
// owner_id: string;
// operator_id: string;
// section_id: string;
// username: string;
// timestamptz: string;
// date_created: DateTime;
// region_name: string;
// owner_name: string;
// operator_name: string;
// section_name: string;
// };

export type PremiseState = {
  errors?: {
    name?: string[];
    description: string[];
    cadastral_number: string[];
    square: string[];
    address: string[];
    address_alt: string[];
    type: string[];
    status: string[];
    status_until: string[];
    region_name: string[];
    owner_name: string[];
    operator_name: string[];
    section_name: string[];
  };
  message?: string | null;
};

const PremiseFormSchema = z.object({
  id: z.string(),
  name: z.string().min(2, {
    message: "Название должно содержать не менее 2-х символов.",
  }),
  capital: z.string().min(2, {
    message: "Поле Столица должно содержать не менее 2-х символов.",
  }),
  area: z.string().min(2, {
    message: "Поле Округ должно содержать не менее 2-х символов.",
  }),
  code: z.string().min(1, {
    message: "Поле Код должно содержать не менее 1 символа.",
  }),
  section_id: z.string().min(2, {
    message: "Поле Раздел должно содержать не менее 2-х символов.",
  }),
});

const CreatePremise = PremiseFormSchema.omit({ id: true });
const UpdatePremise = PremiseFormSchema.omit({ id: true });

export async function createPremise(
  prevState: PremiseState,
  formData: FormData
) {
  const validatedFields = CreatePremise.safeParse({
    name: formData.get("name"),
    capital: formData.get("capital"),
    area: formData.get("area"),
    code: formData.get("code"),
    section_id: formData.get("section_id"),
  });
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Неверные данные! Failed to Create Premise.",
    };
  }
  // Prepare data for insertion into the database
  const { name, capital, area, code, section_id } = validatedFields.data;
  // SELECT event_time_tz AT TIME ZONE 'Europe/Moscow' FROM example;
  const date = new Date().toISOString(); //.split("T")[0]
  // const is_customer = str_is_customer === "true" ? true : false;
  // const is_supplier = str_is_supplier === "true" ? false : true;

  const session = await auth();
  const username = session?.user?.name;
  // const section_id = "e21e9372-91c5-4856-a123-b6f3b53efc0f";
  try {
    await sql`
      INSERT INTO regions (name, capital, area, code, section_id, username, date)
      VALUES (${name}, ${capital}, ${area}, ${code}, ${section_id}, ${username}, ${date}) 
    `;
  } catch (error) {
    console.error("Failed to create newRegion:", error);
    // throw new Error("Failed to create newLegalEntity.");
    return {
      message: "Database Error: Failed to Create newPremise.",
      // errors: undefined,
    };
  }
  revalidatePath("/erp/premises");
  redirect("/erp/premises");
}

//#endregion

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
    status_until = ${premise.status_until},
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

export async function fetchPremise(id: string) {
  try {
    const data = await sql<Premise>`
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
      FROM premises
      WHERE id = ${id}
    `;

    const premise = data.rows[0];
    return premise;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch premise!");
  }
}
export async function fetchPremiseForm(id: string) {
  try {
    const data = await sql<PremiseForm>`
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
      FROM premises p
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
export async function fetchPremises() {
  try {
    const data = await sql<Premise>`
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
      FROM premises
      ORDER BY name ASC
    `;

    const premises = data.rows;
    return premises;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all premises.");
  }
}

export async function fetchPremisesForm() {
  try {
    const data = await sql<RegionForm>`
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
          COALESCE(s.name as section_name, '')
      FROM premises p
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
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const premises = await sql<PremiseForm>`
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
      FROM premises p
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

export async function fetchPremisesPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM premises
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
