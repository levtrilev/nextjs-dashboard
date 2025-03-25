
// Regions actions

"use server";

import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Region, RegionForm } from "@/app/lib/definitions";

const ITEMS_PER_PAGE = 8;

//#region CreateRegion

export type RegionState = {
  errors?: {
    name?: string[];
    capital?: string[];
    area?: string[];
    code?: string[];
    section_id?: string[];
  };
  message?: string | null;
};

const RegionFormSchema = z.object({
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

const CreateRegion = RegionFormSchema.omit({ id: true });
const UpdateRegion = RegionFormSchema.omit({ id: true });

export async function createRegion(
  prevState: RegionState,
  formData: FormData
) {
  const validatedFields = CreateRegion.safeParse({
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
      message: "Неверные данные! Failed to Create region.",
    };
  }
  // Prepare data for insertion into the database
  const {
    name,
    capital,
    area,
    code,
  } = validatedFields.data;
  // SELECT event_time_tz AT TIME ZONE 'Europe/Moscow' FROM example;
  const date = new Date().toISOString();  //.split("T")[0]
  // const is_customer = str_is_customer === "true" ? true : false;
  // const is_supplier = str_is_supplier === "true" ? false : true;

  const  session = await auth();
  const username = session?.user?.name;
  const section_id = "e21e9372-91c5-4856-a123-b6f3b53efc0f";
  try {
    await sql`
      INSERT INTO regions (name, capital, area, code, section_id, username, date)
      VALUES (${name}, ${capital}, ${area}, ${code}, ${section_id}, ${username}, ${date}) 
    `;
  } catch (error) {
    console.error("Failed to create newRegion:", error);
    // throw new Error("Failed to create newLegalEntity.");
    return {
      message: "Database Error: Failed to Create newRegion.",
      // errors: undefined,
    };
  }
  revalidatePath("/erp/regions");
  redirect("/erp/regions");
}

//#endregion

//#region Update Delete Region

export async function deleteRegion(id: string) {
  try {
    await sql`DELETE FROM regions WHERE id = ${id}`;
  } catch (error) {
    console.error("Database Error, Failed to Delete Region:", error);
    throw new Error("Database Error: Failed to Delete Region");
  }
  revalidatePath("/erp/regions");
}

export async function updateRegion(region: Region) {
  const date = new Date().toISOString(); //.split("T")[0]

  const session = await auth();
  const username = session?.user?.name;
  // const section_id = "e21e9372-91c5-4856-a123-b6f3b53efc0f";

  try {
    await sql`
UPDATE regions
SET 
    name = ${region.name},
    capital = ${region.capital},
    area = ${region.area},
    code = ${region.code},
    section_id = ${region.section_id},
    username = ${username},
    date = ${date}
WHERE id = ${region.id};
    `;
  } catch (error) {
    console.error("Failed to update region:", error);
    throw new Error("Failed to update region.");
  }
  revalidatePath("/erp/regions");
}

//#endregion

//#region fetchRegion

export async function fetchRegion(id: string) {
  try {
    const data = await sql<Region>`
      SELECT
        id,
        name,
        capital,
        area,
        code,
        section_id,
        username,
        timestamptz,
        date
      FROM regions
      WHERE id = ${id}
    `;

    const region = data.rows[0];
    return region;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch region by id.");
  }
}
export async function fetchRegionForm(id: string) {
  try {
    const data = await sql<RegionForm>`
      SELECT
        regions.id,
        regions.name,
        regions.capital,
        regions.area,
        regions.code,
        regions.section_id,
        regions.username,
        regions.timestamptz,
        regions.date,
        s.name as section_name
      FROM regions
      LEFT JOIN sections s on regions.section_id = s.id
      WHERE regions.id = ${id}
    `;

    const region = data.rows[0];
    return region;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch region by id.");
  }
}
export async function fetchRegions() {
  try {
    const data = await sql<Region>`
      SELECT
        id,
        name,
        capital,
        area,
        code,
        section_id,
        username,
        timestamptz,
        date
      FROM regions
      ORDER BY name ASC
    `;

    const regions = data.rows;
    return regions;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all regions.");
  }
}

export async function fetchRegionsForm() {
  try {
    const data = await sql<RegionForm>`
      SELECT
        regions.id,
        regions.name,
        regions.capital,
        regions.area,
        regions.code,
        regions.section_id,
        regions.username,
        regions.timestamptz,
        regions.date,
        s.name as section_name
      FROM regions
      LEFT JOIN sections s on regions.section_id = s.id
      ORDER BY name ASC
    `;

    const regions = data.rows;
    return regions;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all regions.");
  }
}
export async function fetchFilteredRegions(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const regions = await sql<RegionForm>`
      SELECT
        regions.id,
        regions.name,
        regions.capital,
        regions.area,
        regions.code,
        regions.section_id,
        regions.username,
        regions.timestamptz,
        regions.date,
        s.name as section_name
      FROM regions
      LEFT JOIN sections s on regions.section_id = s.id
      WHERE
        regions.name ILIKE ${`%${query}%`} OR
        regions.capital ILIKE ${`%${query}%`} OR
        regions.area ILIKE ${`%${query}%`} OR
        regions.code ILIKE ${`%${query}%`}
      ORDER BY name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return regions.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch regions.");
  }
}

export async function fetchRegionsPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM regions
    WHERE
        regions.name ILIKE ${`%${query}%`} OR
        regions.capital ILIKE ${`%${query}%`} OR
        regions.area ILIKE ${`%${query}%`} OR
        regions.code ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of regions.");
  }
}

//#endregion