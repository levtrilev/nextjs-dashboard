// Tenants actions.ts

"use server";
import { Tenant } from "@/app/lib/definitions";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";

//#region fetchTenants

export async function fetchTenantsSuperadmin() {
  try {
    const data = await sql<Tenant>`
      SELECT
        id,
        name,
        active,
        COALESCE(description, '') AS description
      FROM tenants
      ORDER BY name ASC
    `;
    // WHERE active

    const tenants = data.rows;
    return tenants;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all tenants.");
  }
}
export async function fetchTenantsAdmin(tenant_id: string) {
  try {
    const data = await sql<Tenant>`
      SELECT
        id,
        name,
        active,
        COALESCE(description, '') AS description
      FROM tenants
      WHERE id = ${tenant_id}
    `;
    // WHERE active

    const tenants = data.rows;
    return tenants;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all tenants.");
  }
}
export async function fetchTenantById(id: string) {
  try {
    const data = await sql<Tenant>`
      SELECT
        id,
        name,
        active,
        description
      FROM tenants
      WHERE id = ${id}
    `;

    const tenant = data.rows[0];
    return tenant;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch tenant by id.");
  }
}

//#endregion

//#region Tenants
export async function createTenant(name: string, description: string) {
    const newTenant: Tenant = {
      id: "",
      active: true,
      name: name,
      description: description,
    };
    try {
      await sql`
        INSERT INTO tenants (name, description)
        VALUES (${newTenant.name}, ${newTenant.description})
      `;
    } catch (error) {
      console.error("Failed to create tenant:", error);
      throw new Error("Failed to create tenant.");
    }
    revalidatePath("/admin");
    // redirect("/admin");
  }
  
  export async function updateTenant(tenant: Tenant) {
    try {
      await sql`
        UPDATE tenants
        SET name = ${tenant.name}, active = ${tenant.active}, description = ${tenant.description}
        WHERE id = ${tenant.id}
      `;
    } catch (error) {
      console.error("Failed to update tenant:", error);
      throw new Error("Failed to update tenant.");
    }
    revalidatePath("/admin");
  }
  
  export async function deleteTenant(name: string) {
    try {
      await sql`DELETE FROM tenants WHERE name = ${name}`;
    } catch (error) {
      console.error("Database Error, Failed to Delete Tenant:", error);
      throw new Error("Database Error: Failed to Delete Tenant");
    }
    revalidatePath("/admin");
    // redirect("/admin");
  }
  //#endregion
  