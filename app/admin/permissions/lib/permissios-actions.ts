// Roles actions.ts

"use server";
import { getUserRoles } from "@/app/lib/common-actions";
import { DocUserPermissions, Permission } from "@/app/lib/definitions";
import pool from "@/db"; // Импорт пула подключений
import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";

export async function fetchDocUserPermissions(
  user_id: string,
  doctype: string
) {
  try {
    const data = await pool.query<DocUserPermissions>(
      `
      SELECT 
        MAX(p.full_access::INT)::BOOLEAN AS full_access,
        MAX(p.editor::INT)::BOOLEAN AS editor,
        MAX(p.author::INT)::BOOLEAN AS author,
        MAX(p.reader::INT)::BOOLEAN AS reader,
        MAX(p.can_delete::INT)::BOOLEAN AS can_delete,
        MAX(p.access_by_tags::INT)::BOOLEAN AS access_by_tags
      FROM users u
        LEFT JOIN roles r ON r.id = ANY(u.role_ids)
        LEFT JOIN permissions p ON p.role_id = r.id
      WHERE u.id = $1::uuid AND p.doctype = $2
        GROUP BY u.id
      `,
      [user_id, doctype]
    );

    if (data.rows.length > 1) {
      console.log(
        "Multiple permissions found for user " +
          user_id +
          " and doctype " +
          doctype
      );
    }
    if (data.rows.length === 0) {
      // console.log(
      //   "fetchDocUserPermissions: data.rows.length === 0 for user id " +
      //     user_id +
      //     " and doctype " +
      //     doctype
      // );
      return {
        full_access: false,
        editor: false,
        author: false,
        reader: false,
        can_delete: false,
        access_by_tags: false,
      };
    }
    return data.rows[0];
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch permissions: " + err);
  }
}

//#region fetchDoctypes

export async function fetchPermissionsSuperadmin() {
  try {
    const data = await pool.query<Permission>(
      `SELECT id, role_id, role_name, doctype, doctype_name, full_access, editor, author, 
        can_delete, reader, access_by_tags, or_tags, and_tags, no_tags, tenant_id, tenant_name
        FROM permissions
        ORDER BY doctype_name ASC`
    );

    return data.rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch permissions: " + err);
  }
}
export async function fetchPermissionsAdmin(tenant_id: string, role_id?: string) {
  const role_id_uuid = role_id ? role_id : "00000000-0000-0000-0000-000000000000";
  try {
    const data = await pool.query<Permission>(
      `SELECT id, role_id, role_name, doctype, doctype_name, full_access, editor, 
        author, can_delete, reader, access_by_tags, or_tags, and_tags, no_tags, tenant_id, tenant_name
        FROM permissions
        WHERE tenant_id = $1
        AND ($2 = '00000000-0000-0000-0000-000000000000' OR role_id = $2::uuid)
        ORDER BY doctype_name ASC`,
      [tenant_id, role_id_uuid]
    );

    return data.rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch permissions: " + err);
  }
}

export async function fetchRolePermissions(tenant_id: string, role_id?: string) {
  // const role_id_uuid = role_id ? role_id : "00000000-0000-0000-0000-000000000000";
  try {
    const data = await pool.query<Permission>(
      `SELECT id, role_id, role_name, doctype, doctype_name, full_access, editor, 
        author, can_delete, reader, access_by_tags, or_tags, and_tags, no_tags, tenant_id, tenant_name
        FROM permissions
        WHERE tenant_id = $1
        AND role_id = $2::uuid
        ORDER BY doctype_name ASC`,
      [tenant_id, role_id]
    );

    return data.rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch permissions: " + err);
  }
}

export async function fetchUserPermissions(tenant_id: string, user_id: string) {
  // const role_id_uuid = role_id ? role_id : "00000000-0000-0000-0000-000000000000";
  try {
    const user_roles = (await getUserRoles(user_id)).map((role) => role.id);
    const data = await pool.query<Permission>(
      `SELECT id, role_id, role_name, doctype, doctype_name, full_access, editor, 
        author, can_delete, reader, access_by_tags, or_tags, and_tags, no_tags, tenant_id, tenant_name
        FROM permissions
        WHERE tenant_id = $1
        AND role_id = ANY($2::uuid[])
        ORDER BY doctype_name ASC`,
      [tenant_id, user_roles]
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
      `SELECT id, role_id, role_name, doctype, doctype_name, full_access, editor, author, 
        can_delete, reader, access_by_tags, or_tags, and_tags, no_tags, tenant_id, tenant_name
        FROM permissions
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
        AND table_name NOT IN ('users', 'roles', 'sections', 'tenants', 'users-id-num'
        , 'permissions', 'stock_balances', 'stock_movements', 'tags', 'periods')
        ORDER BY table_name ASC`
    );

    return data.rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch doctypes: " + err);
  }
}

// createPermission

export async function createPermission(
  doctype: string,
  doctype_name: string,
  role_id: string,
  role_name: string,
  tenant_id: string,
  tenant_name: string
) {
  if (doctype === "") {
    throw new Error("doctype is required! Необходно указать Тип документа!");
  }
  if (role_id === "") {
    throw new Error("role is required! Необходно указать Роль!");
  }
  try {
    const result = await pool.query(
      `INSERT INTO permissions (doctype, doctype_name, role_id, role_name, tenant_id, tenant_name)
       VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id       
    `,
      [doctype, doctype_name, role_id, role_name, tenant_id, tenant_name]
    );
    const id = result.rows[0].id;
    revalidatePath("/admin/permissions");
    return id;
  } catch (error) {
    console.error("Failed to create Permission:", error);
    throw new Error("Failed to create Permission:" + error);
  }
}

export async function deletePermission(id: string) {
  try {
    await pool.query(`DELETE FROM permissions WHERE id = $1`, [id]);
  } catch (error) {
    console.error("Database Error, Failed to delete Permission:", error);
    throw new Error("Database Error: Failed to delete Permission: " + error);
  }

  revalidatePath("/admin/permissions");
}

//updatePermission
export async function updatePermission(permission: Permission) {
  try {
    await pool.query(
      `UPDATE permissions
       SET 
       id = $1, role_id = $2, role_name = $3, doctype = $4, doctype_name = $5, 
       full_access = $6, editor = $7, author = $8, can_delete = $9, reader = $10, 
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
        permission.editor,
        permission.author,
        permission.can_delete,
        permission.reader,
        permission.access_by_tags,
        JSON.stringify(permission.or_tags),
        JSON.stringify(permission.and_tags),
        JSON.stringify(permission.no_tags),
        permission.tenant_id,
        permission.tenant_name,
      ]
    );
  } catch (error) {
    console.error("Failed to update permission:", error);
    throw new Error("Failed to update permission: " + error);
  }
}
