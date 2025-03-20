// Sections actions.ts

"use server";
import { Section, SectionForm } from "@/app/lib/definitions";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";

//#region Section
export async function createSection(name: string, tenant_id: string) {
  const newSection: Section = {
    id: "",
    name: name,
    tenant_id: tenant_id,
  };
  try {
    await sql`
        INSERT INTO sections (name, tenant_id)
        VALUES (${newSection.name}, ${newSection.tenant_id})
      `;
  } catch (error) {
    console.error("Failed to create section:", error);
    throw new Error("Failed to create section.");
  }
  revalidatePath("/dashboard/admin/sections");
}

export async function updateSection(section: Section) {
  try {
    await sql`
        UPDATE sections
        SET name = ${section.name}, tenant_id = ${section.tenant_id}
        WHERE id = ${section.id}
      `;
  } catch (error) {
    console.error("Failed to update section:", error);
    throw new Error("Failed to update section.");
  }
  revalidatePath("/admin/sections");
}

export async function deleteSection(name: string, tenantId: string) {
  // const id = '5bce9a5e-73b8-40e1-b8e5-c681b0ef2c2b';
  try {
    await sql`DELETE FROM sections WHERE name = ${name} AND tenant_id = ${tenantId}`;
  } catch (error) {
    console.error("Database Error, Failed to Delete Section:", error);
    throw new Error("Database Error: Failed to Delete Section");
  }
  revalidatePath("/admin");
  // redirect("/admin");
}

export async function deleteSectionById(id: string) {
  try {
    await sql`DELETE FROM sections WHERE id = ${id}`;
  } catch (error) {
    console.error("Database Error, Failed to Delete Section by id:", error);
    throw new Error("Database Error: Failed to Delete Section by id");
  }
  revalidatePath("/admin");
  // redirect("/admin");
}
//#endregion

export async function fetchSections() {
  try {
    const data = await sql<Section>`
              SELECT
          s.id as id,
          s.name as name,
          s.tenant_id as tenant_id
        FROM sections s 
        ORDER BY name ASC
      `;

    const sections = data.rows;
    return sections;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all sections.");
  }
}

export async function fetchSectionsForm() {
  try {

    const data = await sql<SectionForm>`
        SELECT
          s.id as id,
          s.name as name,
          s.tenant_id as tenant_id,
          t.name as tenant_name
        FROM sections s LEFT JOIN tenants t ON s.tenant_id = t.id
        ORDER BY tenant_name ASC
      `;

    const sections = data.rows;
    return sections;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all sections with fetchSectionsForm.");
  }
}

export async function fetchSectionById(id: string) {
  try {
    const data = await sql<SectionForm>`
        SELECT
          s.id as id,
          s.name as name,
          s.tenant_id as tenant_id,
          t.name as tenant_name
        FROM sections s JOIN tenants t ON s.tenant_id = t.id
        WHERE s.id = ${id}
      `;

    const section = data.rows[0];
    return section;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch section by id.");
  }
}
