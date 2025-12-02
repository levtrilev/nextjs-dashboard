// Roles actions.ts

"use server";
import { Role, RoleForm } from "@/app/lib/definitions";
import pool from "@/db"; // Импорт пула подключений
import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";

//#region fetchRoles

export async function fetchRoles() {
  try {
    const data = await pool.query<Role>(
      `SELECT 
        id,
        tenant_id,
        name,
        section_ids,
        section_names,
        COALESCE(description, '') AS description
      FROM roles
      ORDER BY name ASC`
    );

    return data.rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all roles " + err);
  }
}

export async function fetchRole(id: string) {
  try {
    const data = await pool.query<Role>(
      `SELECT 
        id,
        name,
        tenant_id,
        section_ids,
        section_names,
        COALESCE(description, '') AS description
      FROM roles
      WHERE id = $1`,
      [id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch role " + err);
  }
}

export async function fetchRoleForm(id: string) {
  try {
    const data = await pool.query<RoleForm>(
      `SELECT 
        r.id,
        r.name,
        r.tenant_id,
        r.section_ids,
        r.section_names,
        t.name as tenant_name,
        COALESCE(r.description, '') AS description
      FROM roles r
      LEFT JOIN tenants t on r.tenant_id = t.id
      WHERE r.id = $1`,
      [id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch roleForm");
  }
}

export async function fetchRolesFormSuperadmin() {
  try {
    const data = await pool.query<RoleForm>(
      `SELECT 
        r.id,
        r.name,
        r.tenant_id,
        r.section_ids,
        array_to_string(r.section_names, ', ') AS section_names,
        t.name as tenant_name,
        COALESCE(r.description, '') AS description
      FROM roles r
      LEFT JOIN tenants t on r.tenant_id = t.id
      ORDER BY t.name`
    );

    return data.rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all roles (Form): " + err);
  }
}

export async function fetchRolesFormWithSectionSuperadmin(
  section_name: string,
  tenantId: string
) {
  try {
    const data = await pool.query<RoleForm>(
      `SELECT 
      r.id,
      r.name,
      r.tenant_id,
      r.section_ids,
      array_to_string(r.section_names, ', ') AS section_names,
      t.name as tenant_name,
      COALESCE(r.description, '') AS description
    FROM roles r
    LEFT JOIN tenants t ON r.tenant_id = t.id
    WHERE r.section_names @> ARRAY[$1::varchar] AND r.tenant_id = $2
    ORDER BY t.name`,
      [section_name, tenantId]
    );

    return data.rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch roles with sections: " + err);
  }
}

export async function fetchRolesFormAdmin(tenant_id: string) {
  try {
    const data = await pool.query<RoleForm>(
      `SELECT 
        r.id,
        r.name,
        r.tenant_id,
        r.section_ids,
        array_to_string(r.section_names, ', ') AS section_names,
        t.name as tenant_name,
        COALESCE(r.description, '') AS description
      FROM roles r
      LEFT JOIN tenants t on r.tenant_id = t.id
      WHERE r.tenant_id = $1
      ORDER BY t.name`,
      [tenant_id]
    );

    return data.rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all roles (Form)");
  }
}
//#endregion

//#region Roles
export async function createRole(
  name: string,
  description: string,
  tenant_id: string,
  section_ids: string,
  section_names: string
) {
  try {
    const result = await pool.query(
      `INSERT INTO roles (name, description, tenant_id, section_ids, section_names)
       VALUES ($1, $2, $3, $4, $5)
        RETURNING id       
    `,
      [name, description, tenant_id, section_ids, section_names]
    );
    const id = result.rows[0].id;
    return id;
  } catch (error) {
    console.error("Failed to create role:", error);
    throw new Error("Failed to create role:" + error);
  }

  revalidatePath("/admin/roles");
}

export async function updateRole(role: Role) {
  try {
    await pool.query(
      `UPDATE roles
       SET name = $1, description = $2, tenant_id = $3,
           section_ids = $4, section_names = $5
       WHERE id = $6`,
      [
        role.name,
        role.description,
        role.tenant_id,
        role.section_ids,
        role.section_names,
        role.id,
      ]
    );
  } catch (error) {
    console.error("Failed to update role:", error);
    throw new Error("Failed to update role: " + error);
  }

  // revalidatePath("/admin/roles");
  // redirect("/admin/roles");
}

export async function deleteRole(id: string) {
  try {
    await pool.query(`DELETE FROM roles WHERE id = $1`, [id]);
  } catch (error) {
    console.error("Database Error, Failed to delete role:", error);
    throw new Error("Database Error: Failed to delete role: " + error);
  }

  revalidatePath("/admin/roles");
}
//#endregion
