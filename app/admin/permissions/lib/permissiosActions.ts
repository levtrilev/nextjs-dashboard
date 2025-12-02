// Roles actions.ts

"use server";
import { Permission } from "@/app/lib/definitions";
import pool from "@/db"; // Импорт пула подключений
import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";

//#region fetchDoctypes

export async function fetchPermissionsSuperadmin() {
  try {
    const data = await pool.query<Permission>(
      `SELECT id, role_id, role_name, doctype, doctype_name, full_access, author, can_delete, 
      can_recall, reader, access_by_tags, or_tags, and_tags, no_tags, tenant_id, tenant_name
        FROM doctype_role_permissions
        ORDER BY doctype_name ASC`
    );

    return data.rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch permissions: " + err);
  }
}
export async function fetchPermissionsAdmin(tenant_id: string) {
  try {
    const data = await pool.query<Permission>(
      `SELECT id, role_id, role_name, doctype, doctype_name, full_access, author, can_delete, 
      can_recall, reader, access_by_tags, or_tags, and_tags, no_tags, tenant_id, tenant_name
        FROM doctype_role_permissions
        WHERE tenant_id = $1
        ORDER BY doctype_name ASC`,
      [tenant_id]
    );

    return data.rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch permissions: " + err);
  }
}

export async function fetchPermission(id: string) {
  try {
    const data = await pool.query<Permission>(
      `SELECT id, role_id, role_name, doctype, doctype_name, full_access, author, can_delete, 
      can_recall, reader, access_by_tags, or_tags, and_tags, no_tags, tenant_id, tenant_name
        FROM doctype_role_permissions
        WHERE id = $1`,
      [id]
    );

    return data.rows[0];
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch permission: " + err);
  }
}
//#endregion

export async function fetchDoctypes() {
  try {
    const data = await pool.query<{ table_name: string }>(
      `SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name NOT IN ('users', 'roles', 'sections', 'tenants', 'users-id-num', 'doctype_role_permissions')
        ORDER BY table_name ASC`
    );

    return data.rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch doctypes: " + err);
  }
}

// createDocRolePermission

export async function createDocRolePermission(
  doctype: string,
  doctype_name: string,
  role_id: string,
  role_name: string,
  tenant_id: string,
  tenant_name: string
) {
  try {
    const result = await pool.query(
      `INSERT INTO doctype_role_permissions (doctype, doctype_name, role_id, role_name, tenant_id, tenant_name)
       VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id       
    `,
      [doctype, doctype_name, role_id, role_name, tenant_id, tenant_name]
    );
    const id = result.rows[0].id;
    revalidatePath("/admin/doctypes");
    return id;
  } catch (error) {
    console.error("Failed to create DocRolePermission:", error);
    throw new Error("Failed to create DocRolePermission:" + error);
  }

  revalidatePath("/admin/doctypes");
}

export async function deletePermission(id: string) {
  try {
    await pool.query(`DELETE FROM doctype_role_permissions WHERE id = $1`, [
      id,
    ]);
  } catch (error) {
    console.error("Database Error, Failed to delete DocRolePermission:", error);
    throw new Error(
      "Database Error: Failed to delete DocRolePermission: " + error
    );
  }

  revalidatePath("/admin/doctypes");
}

//updatePermission
export async function updatePermission(permission: Permission) {
  try {
    await pool.query(
      `UPDATE doctype_role_permissions
       SET 
       id = $1, role_id = $2, role_name = $3, doctype = $4, doctype_name = $5, 
       full_access = $6, author = $7, can_delete = $8, can_recall = $9, reader = $10, 
       access_by_tags = $11, or_tags = $12, and_tags = $13, no_tags = $14, 
       tenant_id = $15, tenant_name = $16
       WHERE id = $1`,
      [
        permission.id,
        permission.role_id,
        permission.role_name,
        permission.doctype,
        permission.doctype_name,
        permission.full_access,
        permission.author,
        permission.can_delete,
        permission.can_recall,
        permission.reader,
        permission.access_by_tags,
        permission.or_tags,
        permission.and_tags,
        permission.no_tags,
        permission.tenant_id,
        permission.tenant_name,
      ]
    );
  } catch (error) {
    console.error("Failed to update permission:", error);
    throw new Error("Failed to update permission: " + error);
  }
}
