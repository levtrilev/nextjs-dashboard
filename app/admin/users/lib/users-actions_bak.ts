
// // Users actions.ts

// "use server";

// import { sql } from "@vercel/postgres";
// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";
import type { User, UserForm } from "@/app/lib/definitions";
// import bcrypt from "bcrypt";

// //#region Users
// // async function createUser(newUser: User) {
// export async function createUser(
//   email: string,
//   password: string,
//   tenant_id: string,
//   is_admin: boolean = false
// ) {
//   const saltOrRounds = 10;
//   const hash = await bcrypt.hash(password, saltOrRounds);

//   const newUser: User = {
//     id: "",
//     name: email,
//     email: email,
//     password: hash,
//     tenant_id: tenant_id,
//     is_admin: is_admin,
//     is_superadmin: is_admin,
//     role_ids: "{}",
//   };
//   // Insert data into the database
//   //   console.log('createUser tenant_id: ' + newUser.tenant_id);
//   try {
//     await sql`
//             INSERT INTO users (name, email, password, is_admin, tenant_id)
//             VALUES (${newUser.name}, ${newUser.email}, ${newUser.password}, ${newUser.is_admin}, ${newUser.tenant_id})
//           `;
//   } catch (error) {
//     console.error("Failed to create user:", error);
//     throw new Error("Failed to create user.");
//   }
//   revalidatePath("/admin");
//   redirect("/admin");
// }

// export async function updateUser(user: User) {
//   // password = ${user.password},
//   try {
//     await sql`
//             UPDATE users
//             SET name = ${user.name}, 
//             email = ${user.email}, 
//             is_admin = ${user.is_admin}, 
//             tenant_id = ${user.tenant_id},
//             role_ids = ${user.role_ids}
//             WHERE id = ${user.id}
//           `;
//   } catch (error) {
//     console.error("Failed to update user:", error);
//     throw new Error("Failed to update user.");
//   }
//   revalidatePath("/admin/users");
// }

// export async function deleteUser(email: string) {
//   // const id = '5bce9a5e-73b8-40e1-b8e5-c681b0ef2c2b';
//   try {
//     await sql`DELETE FROM users WHERE email = ${email}`;
//     //   revalidatePath("/dashboard/invoices");
//     // return { message: "Deleted Invoice" };
//   } catch (error) {
//     // return { message: "Database Error: Failed to Delete Invoice" };
//     console.error("Database Error, Failed to Delete User:", error);
//     throw new Error("Database Error: Failed to Delete User");
//   }
//   revalidatePath("/admin");
//   redirect("/admin");
// }

// export async function deleteUserById(id: string) {
//   try {
//     await sql`DELETE FROM users WHERE id = ${id}`;
//   } catch (error) {
//     console.error("Database Error, Failed to Delete User by id:", error);
//     throw new Error("Database Error: Failed to Delete User by id");
//   }
//   revalidatePath("/admin");
//   redirect("/admin");
// }
// //#endregion

// //#region fetchUsers
// export async function fetchUsersSuperadmin() {
//   try {

//     const data = await sql<UserForm>`
//         SELECT
//           u.id as id,
//           u.name as name,
//           u.email as email,
//           u.is_admin as is_admin,
//           u.is_superadmin as is_superadmin,
//           u.tenant_id as tenant_id,
//           t.name as tenant_name,
//           u.role_ids as role_ids
//         FROM users u JOIN tenants t ON u.tenant_id = t.id
//         ORDER BY tenant_id ASC
//       `;

//     const users = data.rows;
//     return users;
//   } catch (err) {
//     console.error("Database Error:", err);
//     throw new Error("Failed to fetch all users.");
//   }
// }
// export async function fetchUsersAdmin(tenant_id: string) {
//   try {

//     const data = await sql<UserForm>`
//     SELECT
//       u.id as id,
//       u.name as name,
//       u.email as email,
//       u.is_admin as is_admin,
//       u.is_superadmin as is_superadmin,
//       u.tenant_id as tenant_id,
//       t.name as tenant_name,
//       u.role_ids as role_ids
//     FROM users u JOIN tenants t ON u.tenant_id = t.id
//         WHERE u.tenant_id = ${tenant_id}
//         ORDER BY tenant_id ASC
//       `;

//     const users = data.rows;
//     return users;
//   } catch (err) {
//     console.error("Database Error:", err);
//     throw new Error("Failed to fetch all users.");
//   }
// }

// export async function fetchUsersUser(email: string) {
//   try {

//     const data = await sql<UserForm>`
//     SELECT
//       u.id as id,
//       u.name as name,
//       u.email as email,
//       u.is_admin as is_admin,
//       u.is_superadmin as is_superadmin,
//       u.tenant_id as tenant_id,
//       t.name as tenant_name,
//       u.role_ids as role_ids
//         FROM users u JOIN tenants t ON u.tenant_id = t.id
//         WHERE u.email = ${email}
//         ORDER BY tenant_id ASC
//       `;

//     const users = data.rows;
//     return users;
//   } catch (err) {
//     console.error("Database Error:", err);
//     throw new Error("Failed to fetch all users.");
//   }
// }

// export async function fetchUserById(id: string) {
//   try {
//     const data = await sql<UserForm>`
//         SELECT
//           u.id as id,
//           u.name as name,
//           u.email as email,
//           u.is_admin as is_admin,
//           u.is_superadmin as is_superadmin,
//           u.tenant_id as tenant_id,
//           t.name as tenant_name,
//           u.role_ids as role_ids
//         FROM users u JOIN tenants t ON u.tenant_id = t.id
//         WHERE u.id = ${id}
//       `;
// //           u.password as password,
//     const section = data.rows[0];
//     return section;
//   } catch (err) {
//     console.error("Database Error:", err);
//     throw new Error("Failed to fetch user by id.");
//   }
// }

// //#endregion
