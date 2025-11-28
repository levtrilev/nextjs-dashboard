// Sections actions.ts

"use server";
import { Section, SectionForm } from "@/app/lib/definitions";
import pool from "@/db"; // Импорт пула
import { revalidatePath } from "next/cache";

//#region Section
export async function createSection(name: string, tenant_id: string): Promise<string> {
  const newSection: Section = {
    id: "",
    name: name,
    tenant_id: tenant_id,
  };
  try {
    const result = await pool.query(`
        INSERT INTO sections (name, tenant_id)
        VALUES ($1, $2)
        RETURNING id
      `, [newSection.name, newSection.tenant_id]);
    newSection.id = result.rows[0].id;
    return (newSection.id);  
  } catch (error) {
    console.error("Failed to create section:", error);
    throw new Error("Failed to create section: " + error);
  }
  revalidatePath("/admin/sections");
}

export async function updateSection(section: Section) {
  try {
    await pool.query(`
        UPDATE sections
        SET name = $1, tenant_id = $2
        WHERE id = $3
      `, [section.name, section.tenant_id, section.id]); // Параметры $1-$3
  } catch (error) {
    console.error("Failed to update section:", error);
    throw new Error("Failed to update section: " + error);
  }
  revalidatePath("/admin/sections");
}

export async function deleteSection(name: string, tenantId: string) {
  try {
    await pool.query(`
      DELETE FROM sections 
      WHERE name = $1 AND tenant_id = $2
    `, [name, tenantId]); // Параметры $1, $2
  } catch (error) {
    console.error("Database Error, Failed to Delete Section:", error);
    throw new Error("Database Error: Failed to Delete Section:" + error);
  }
  revalidatePath("/admin");
}

export async function deleteSectionById(id: string) {
  try {
    await pool.query(`
      DELETE FROM sections 
      WHERE id = $1
    `, [id]); // Параметр $1
  } catch (error) {
    console.error("Database Error, Failed to Delete Section by id:", error);
    throw new Error("Database Error: Failed to Delete Section by id");
  }
  revalidatePath("/admin");
}
//#endregion

export async function fetchSections_deprecated() {
  try {
    const result = await pool.query<Section>(`
      SELECT
        s.id as id,
        s.name as name,
        s.tenant_id as tenant_id
      FROM sections s 
      ORDER BY name ASC
    `); // Простой SELECT без параметров

    return result.rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all sections.");
  }
}

export async function fetchSectionsFormSuperadmin() {
  try {
    const result = await pool.query<SectionForm>(`
      SELECT
        s.id as id,
        s.name as name,
        s.tenant_id as tenant_id,
        t.name as tenant_name
      FROM sections s 
      LEFT JOIN tenants t ON s.tenant_id = t.id
      ORDER BY tenant_name ASC
    `); // Простой JOIN без параметров

    return result.rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all sections with fetchSectionsForm.");
  }
}

export async function fetchSectionsFormAdmin(tenant_id: string) {
  try {
    const result = await pool.query<SectionForm>(`
      SELECT
        s.id as id,
        s.name as name,
        s.tenant_id as tenant_id,
        t.name as tenant_name
      FROM sections s 
      LEFT JOIN tenants t ON s.tenant_id = t.id
      WHERE s.tenant_id = $1
      ORDER BY tenant_name ASC
    `, [tenant_id]); // Параметр $1

    return result.rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all sections with fetchSectionsForm.");
  }
}

export async function fetchSectionsForm(current_sections: string) {
  try {
    const result = await pool.query<SectionForm>(`
      SELECT
        s.id as id,
        s.name as name,
        s.tenant_id as tenant_id,
        t.name as tenant_name
      FROM sections s 
      LEFT JOIN tenants t ON s.tenant_id = t.id
      WHERE s.id = ANY ($1::uuid[])
      ORDER BY tenant_name ASC
    `, [current_sections]); // Параметр $1 с кастом

    return result.rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all sections with fetchSectionsForm.");
  }
}

export async function fetchSectionById(id: string) {
  try {
    const result = await pool.query<SectionForm>(`
      SELECT
        s.id as id,
        s.name as name,
        s.tenant_id as tenant_id,
        t.name as tenant_name
      FROM sections s 
      JOIN tenants t ON s.tenant_id = t.id
      WHERE s.id = $1
    `, [id]); // Параметр $1

    return result.rows[0];
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch section by id.");
  }
}