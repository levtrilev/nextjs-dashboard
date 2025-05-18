// Tenants actions.ts

"use server";
import pool from "@/db"; // Import pool from db module
import { Tenant } from "@/app/lib/definitions";
import { revalidatePath } from "next/cache";

//#region fetchTenants

export async function fetchTenantsSuperadmin() {
  try {
    const data = await pool.query<Tenant>(`
      SELECT
        id,
        name,
        active,
        COALESCE(description, '') AS description
      FROM tenants
      ORDER BY name ASC
    `);
    return data.rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all tenants.");
  }
}

export async function fetchTenantsAdmin(tenant_id: string) {
  try {
    const data = await pool.query<Tenant>(
      `
      SELECT
        id,
        name,
        active,
        COALESCE(description, '') AS description
      FROM tenants
      WHERE id = $1
      `,
      [tenant_id]
    );
    return data.rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all tenants.");
  }
}

export async function fetchTenantById(id: string) {
  try {
    const data = await pool.query<Tenant>(
      `
      SELECT
        id,
        name,
        active,
        description
      FROM tenants
      WHERE id = $1
      `,
      [id]
    );
    return data.rows[0];
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
    await pool.query(
      `
      INSERT INTO tenants (name, description)
      VALUES ($1, $2)
      `,
      [newTenant.name, newTenant.description]
    );
  } catch (error) {
    console.error("Failed to create tenant:", error);
    throw new Error("Failed to create tenant.");
  }
  revalidatePath("/admin");
}

export async function updateTenant(tenant: Tenant) {
  try {
    await pool.query(
      `
      UPDATE tenants
      SET name = $1, active = $2, description = $3
      WHERE id = $4
      `,
      [tenant.name, tenant.active, tenant.description, tenant.id]
    );
  } catch (error) {
    console.error("Failed to update tenant:", error);
    throw new Error("Failed to update tenant.");
  }
  revalidatePath("/admin");
}

export async function deleteTenant(name: string) {
  try {
    await pool.query(
      "DELETE FROM tenants WHERE name = $1",
      [name]
    );
  } catch (error) {
    console.error("Database Error, Failed to Delete Tenant:", error);
    throw new Error("Database Error: Failed to Delete Tenant");
  }
  revalidatePath("/admin");
}
//#endregion