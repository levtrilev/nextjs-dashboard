// Roles actions.ts

"use server";
import { Role, RoleForm } from "@/app/lib/definitions";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

//#region fetchRoles

export async function fetchRoles() {
  try {
    const data = await sql<Role>`
      SELECT
        id,
        tenant_id,
        name,
        section_ids,
        array_to_string(r.section_names, ', ') AS section_names,
      COALESCE(description, '') AS description
      FROM roles
      ORDER BY name ASC
    `;

    const roles = data.rows;
    return roles;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all roles.");
  }
}

export async function fetchRole(id: string) {
  try {
    const data = await sql<Role>`
      SELECT
        id,
        name,
        tenant_id,
        section_ids,
        array_to_string(r.section_names, ', ') AS section_names,
      COALESCE(description, '') AS description
      FROM roles
      WHERE id = ${id}
    `;

    const role = data.rows[0];
    return role;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch role");
  }
}

export async function fetchRoleForm(id: string) {
  try {
    const data = await sql<RoleForm>`
      SELECT
        r.id,
        r.name,
        r.tenant_id,
        r.section_ids,
        array_to_string(r.section_names, ', ') AS section_names,
        t.name as tenant_name,
      COALESCE(r.description, '') AS description
      FROM roles r
      LEFT JOIN tenants t on r.tenant_id = t.id
      WHERE r.id = ${id}
    `;

    const role = data.rows[0];
    return role;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch roleForm");
  }
}

export async function fetchRolesForm() {
  try {
    const data = await sql<RoleForm>`
      SELECT
        r.id,
        r.name,
        r.tenant_id,
        r.section_ids,
        array_to_string(r.section_names, ', ') AS section_names,
        t.name as tenant_name,
      COALESCE(r.description, '') AS description
      FROM roles r
      LEFT JOIN tenants t on r.tenant_id = t.id
      ORDER BY t.name
    `;

    const roles = data.rows;
    return roles;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all roles (Form)");
  }
}
//#endregion

//#region Roles
export async function createRole(name: string, description: string, tenant_id: string, section_ids: string, section_names: string) {
    // const newRole: Role = {
    //   id: '',
    //   tenant_id: tenant_id,
    //   name: name,
    //   description: description,
    //   section_ids: '{}',
    // };
    try {
      await sql`
        INSERT INTO roles (name, description, tenant_id, section_ids)
        VALUES (${name}, ${description}, ${tenant_id}, ${section_ids})
      `;
    } catch (error) {
      console.error("Failed to create role:", error);
      throw new Error("Failed to create role.");
    }
    revalidatePath("/admin/roles");
    // redirect("/admin/roles");
  }
  
  export async function updateRole(role: Role) {
    // console.log("at updateRole: role.section_ids: ", role.section_ids);
    try {
      await sql`
        UPDATE roles
        SET name = ${role.name}, description = ${role.description}, tenant_id = ${role.tenant_id}, section_ids = ${role.section_ids}, section_names = ${role.section_names}
        WHERE id = ${role.id}
      `;
    } catch (error) {
      console.error("Failed to update role:", error);
      throw new Error("Failed to update role.");
    }
    revalidatePath("/admin/roles");
    redirect("/admin/roles");
  }
  
  export async function deleteRole(id: string) {
    try {
      await sql`DELETE FROM tenants WHERE id = ${id}`;
    } catch (error) {
      console.error("Database Error, Failed to delete role:", error);
      throw new Error("Database Error: Failed to delete role");
    }
    revalidatePath("/admin/roles");
  }
  //#endregion
  