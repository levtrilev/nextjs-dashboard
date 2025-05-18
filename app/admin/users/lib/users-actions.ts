// Users actions.ts

"use server";

import pool from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { User, UserForm } from "@/app/lib/definitions";
import bcrypt from "bcrypt";

//#region Users
export async function createUser(
  email: string,
  password: string,
  tenant_id: string,
  is_admin: boolean = false
) {
  const saltOrRounds = 10;
  const hash = await bcrypt.hash(password, saltOrRounds);

  const newUser: User = {
    id: "",
    name: email,
    email: email,
    password: hash,
    tenant_id: tenant_id,
    is_admin: is_admin,
    is_superadmin: is_admin,
    role_ids: "{}",
  };

  try {
    await pool.query(
      `INSERT INTO users (name, email, password, is_admin, tenant_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [newUser.name, newUser.email, newUser.password, newUser.is_admin, newUser.tenant_id]
    );
  } catch (error) {
    console.error("Failed to create user:", error);
    throw new Error("Failed to create user.");
  }
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateUser(user: User) {
  try {
    await pool.query(
      `UPDATE users
       SET name = $1, 
           email = $2, 
           is_admin = $3, 
           tenant_id = $4,
           role_ids = $5
       WHERE id = $6`,
      [user.name, user.email, user.is_admin, user.tenant_id, user.role_ids, user.id]
    );
  } catch (error) {
    console.error("Failed to update user:", error);
    throw new Error("Failed to update user.");
  }
  revalidatePath("/admin/users");
}

export async function deleteUser(email: string) {
  try {
    await pool.query(
      `DELETE FROM users WHERE email = $1`,
      [email]
    );
  } catch (error) {
    console.error("Database Error, Failed to Delete User:", error);
    throw new Error("Database Error: Failed to Delete User");
  }
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteUserById(id: string) {
  try {
    await pool.query(
      `DELETE FROM users WHERE id = $1`,
      [id]
    );
  } catch (error) {
    console.error("Database Error, Failed to Delete User by id:", error);
    throw new Error("Database Error: Failed to Delete User by id");
  }
  revalidatePath("/admin");
  redirect("/admin");
}
//#endregion

//#region fetchUsers
export async function fetchUsersSuperadmin() {
  try {
    const result = await pool.query<UserForm>(
      `SELECT
         u.id as id,
         u.name as name,
         u.email as email,
         u.is_admin as is_admin,
         u.is_superadmin as is_superadmin,
         u.tenant_id as tenant_id,
         t.name as tenant_name,
         u.role_ids as role_ids
       FROM users u 
       JOIN tenants t ON u.tenant_id = t.id
       ORDER BY tenant_id ASC`
    );

    return result.rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all users.");
  }
}

export async function fetchUsersAdmin(tenant_id: string) {
  try {
    const result = await pool.query<UserForm>(
      `SELECT
         u.id as id,
         u.name as name,
         u.email as email,
         u.is_admin as is_admin,
         u.is_superadmin as is_superadmin,
         u.tenant_id as tenant_id,
         t.name as tenant_name,
         u.role_ids as role_ids
       FROM users u 
       JOIN tenants t ON u.tenant_id = t.id
       WHERE u.tenant_id = $1
       ORDER BY tenant_id ASC`,
      [tenant_id]
    );

    return result.rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all users.");
  }
}

export async function fetchUsersUser(email: string) {
  try {
    const result = await pool.query<UserForm>(
      `SELECT
         u.id as id,
         u.name as name,
         u.email as email,
         u.is_admin as is_admin,
         u.is_superadmin as is_superadmin,
         u.tenant_id as tenant_id,
         t.name as tenant_name,
         u.role_ids as role_ids
       FROM users u 
       JOIN tenants t ON u.tenant_id = t.id
       WHERE u.email = $1
       ORDER BY tenant_id ASC`,
      [email]
    );

    return result.rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all users.");
  }
}

export async function fetchUserById(id: string) {
  try {
    const result = await pool.query<UserForm>(
      `SELECT
         u.id as id,
         u.name as name,
         u.email as email,
         u.is_admin as is_admin,
         u.is_superadmin as is_superadmin,
         u.tenant_id as tenant_id,
         t.name as tenant_name,
         u.role_ids as role_ids
       FROM users u 
       JOIN tenants t ON u.tenant_id = t.id
       WHERE u.id = $1`,
      [id]
    );

    return result.rows[0];
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch user by id.");
  }
}
//#endregion