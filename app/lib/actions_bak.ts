// "use server";

// import { z } from "zod";
// import { sql } from "@vercel/postgres";
// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";
// import { auth, signIn } from "@/auth";
// import { AuthError } from "next-auth";
import type { Section, User, Tenant, RoleForm } from "@/app/lib/definitions";
// import bcrypt from "bcrypt";

// export type State = {
//   errors?: {
//     customerId?: string[];
//     amount?: string[];
//     status?: string[];
//   };
//   message?: string | null;
// };

// const FormSchema = z.object({
//   id: z.string(),
//   customerId: z.string({
//     invalid_type_error: "Please select a customer.",
//   }),
//   amount: z.coerce
//     .number()
//     .gt(0, { message: "Please enter an amount greater than $0." }),
//   status: z.enum(["pending", "paid"], {
//     invalid_type_error: "Please select an invoice status.",
//   }),
//   date: z.string(),
// });

// const CreateInvoice = FormSchema.omit({ id: true, date: true });
// const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// //#region Invoice
// export async function createInvoice(prevState: State, formData: FormData) {
//   // const { customerId, amount, status } = CreateInvoice.parse({
//   const validatedFields = CreateInvoice.safeParse({
//     customerId: formData.get("customerId"),
//     amount: formData.get("amount"),
//     status: formData.get("status"),
//   });
//   // If form validation fails, return errors early. Otherwise, continue.
//   if (!validatedFields.success) {
//     return {
//       errors: validatedFields.error.flatten().fieldErrors,
//       message: "Missing Fields. Failed to Create Invoice.",
//     };
//   }
//   // Prepare data for insertion into the database
//   const { customerId, amount, status } = validatedFields.data;
//   const amountInCents = amount * 100;
//   const date = new Date().toISOString().split("T")[0];

//   // Insert data into the database
//   try {
//     await sql`
//       INSERT INTO invoices (customer_id, amount, status, date)
//       VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
//     `;
//   } catch (error) {
//     // If a database error occurs, return a more specific error.
//     return {
//       message: "Database Error: Failed to Create Invoice.",
//     };
//   }

//   // Revalidate the cache for the invoices page and redirect the user.
//   revalidatePath("/erp/invoices");
//   redirect("/erp/invoices");
// }

// export async function updateInvoice(
//   id: string,
//   prevState: State,
//   formData: FormData
// ) {
//   //   const { customerId, amount, status } = UpdateInvoice.parse({
//   const validatedFields = UpdateInvoice.safeParse({
//     customerId: formData.get("customerId"),
//     amount: formData.get("amount"),
//     status: formData.get("status"),
//   });

//   // If form validation fails, return errors early. Otherwise, continue.
//   if (!validatedFields.success) {
//     return {
//       errors: validatedFields.error.flatten().fieldErrors,
//       message: "Missing Fields. Failed to Create Invoice.",
//     };
//   }

//   // Prepare data for insertion into the database
//   const { customerId, amount, status } = validatedFields.data;
//   const amountInCents = amount * 100;
//   // lint //  const date = new Date().toISOString().split("T")[0];

//   // Insert data into the database
//   try {
//     await sql`
//       UPDATE invoices
//       SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
//       WHERE id = ${id}
//     `;
//     // lint //   } catch (error) {
//   } catch {
//     // If a database error occurs, return a more specific error.
//     return {
//       message: "Database Error: Failed to Update Invoice.",
//     };
//   }
//   // Revalidate the cache for the invoices page and redirect the user.
//   revalidatePath("/dashboard/invoices");
//   redirect("/dashboard/invoices");
// }

// export async function deleteInvoice(id: string) {
//   try {
//     await sql`DELETE FROM invoices WHERE id = ${id}`;
//     revalidatePath("/dashboard/invoices");
//     // return { message: "Deleted Invoice" };
//   } catch (error) {
//     // return { message: "Database Error: Failed to Delete Invoice" };
//     console.error("Database Error, Failed to Delete Invoice:", error);
//     throw new Error("Database Error: Failed to Delete Invoice");
//   }
// }
// //#endregion

// //#region authenticate
// export async function authenticate(
//   prevState: string | undefined,
//   formData: FormData
// ) {
//   try {
//     await signIn("credentials", formData);
//   } catch (error) {
//     if (error instanceof AuthError) {
//       switch (error.type) {
//         case "CredentialsSignin":
//           return "Invalid credentials.";
//         default:
//           return "Something went wrong.";
//       }
//     }
//     throw error;
//   }
// }
// //#endregion

// export async function getCurrentSections(email: string): Promise<string > {
//   if ( email === "" ) { return ""; }
//   try {
//     const user_sections = await sql<{id: string}>`    
//     SELECT sections.id
// FROM sections
// WHERE sections.id = ANY (
//     SELECT unnest(section_ids)
//     FROM roles
//     WHERE roles.id = ANY (
//         SELECT unnest(role_ids)
//         FROM users
//         WHERE users.email = ${email}
//     )
// )
//     `;
//     // нужно вернуть значение как такое:
//     // const current_sections = "{e21e9372-91c5-4856-a123-b6f3b53efc0f,05a57bc6-1dec-4c60-b430-f70166489422,fba0eac4-f2f8-497b-b15d-53c765eef16e}";
//     const sections_id_array = user_sections.rows.map((section) => section.id);
//     const sections_id_string = sections_id_array.join(",");
//     return "{" + sections_id_string + "}";
//   } catch (error) {
//     console.error("Failed to fetch current_sections:", error);
//     throw new Error("Failed to fetch current_sections.");
//   }
// }


// export async function getUserRoles(user_id: string ): Promise<RoleForm[]>
// {
//   if ( user_id === "" ) { return []; }
//   try {
//     const data = await sql<RoleForm>`    
//     SELECT r.id, r.name, r.description, r.tenant_id, t.name as tenant_name
// FROM roles r
// LEFT JOIN tenants t on r.tenant_id = t.id
// WHERE r.id = ANY (
//     SELECT unnest(role_ids)
//     FROM users
//     WHERE users.id = ${user_id}
//   )
// `;
//     const user_roles = data.rows;
//     return user_roles;
//   } catch (err) {
//     console.error("Database Error:", err);
//     throw new Error("Failed to fetch user_roles");
//   }
// }

// export async function getRoleSections(role_id: string): Promise<{
//   id: string;
//   name: string;
//   tenant_id: string;
//   tenant_name: string;
// }[] > {
//   if ( role_id === "" ) { return []; }
//   try {
//     const data = await sql<{
//       id: string;
//       name: string;
//       tenant_id: string;
//       tenant_name: string;
//   }>`    
//     SELECT s.id, s.name, s.tenant_id, t.name as tenant_name
// FROM sections s
// LEFT JOIN tenants t on s.tenant_id = t.id
// WHERE s.id = ANY (
//     SELECT unnest(section_ids)
//     FROM roles
//     WHERE roles.id = ${role_id}
//   )
// `;
//     const role_sections = data.rows;
//     return role_sections;
//   } catch (err) {
//     console.error("Database Error:", err);
//     throw new Error("Failed to fetch role_sections");
//   }
// }
