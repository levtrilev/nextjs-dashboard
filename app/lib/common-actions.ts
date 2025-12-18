"use server";

import { z } from "zod";
import pool from "@/db"; // Replaced with pool import
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { AuthError } from "next-auth";
import type { Section, User, Tenant, RoleForm } from "@/app/lib/definitions";
import bcrypt from "bcrypt";

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Please select a customer.",
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select an invoice status.",
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

//#region Invoice
export async function createInvoice(prevState: State, formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  try {
    await pool.query(
      `INSERT INTO invoices (customer_id, amount, status, date)
       VALUES ($1, $2, $3, $4)`,
      [customerId, amountInCents, status, date]
    );
  } catch (error) {
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }

  revalidatePath("/erp/invoices");
  redirect("/erp/invoices");
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Invoice.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await pool.query(
      `UPDATE invoices
       SET customer_id = $1, amount = $2, status = $3
       WHERE id = $4`,
      [customerId, amountInCents, status, id]
    );
  } catch {
    return {
      message: "Database Error: Failed to Update Invoice.",
    };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  try {
    await pool.query("DELETE FROM invoices WHERE id = $1", [id]);
    revalidatePath("/dashboard/invoices");
  } catch (error) {
    console.error("Database Error, Failed to Delete Invoice:", error);
    throw new Error("Database Error: Failed to Delete Invoice");
  }
}
//#endregion

//#region authenticate
export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}
//#endregion

export async function getCurrentSections(email: string): Promise<string> {
  if (email === "") {
    return "" //[]; //""
  }

  try {
    const result = (await pool.query<Section>(
      `SELECT sections.id
       FROM sections
       WHERE sections.id = ANY (
         SELECT unnest(section_ids)
         FROM roles
         WHERE roles.id = ANY (
           SELECT unnest(role_ids)
           FROM users
           WHERE users.email = $1
         )
       )`,
      [email]
    )) as { rows: Section[] };

    const sections_id_array = result.rows.map((section) => section.id);
    const sections_id_string = sections_id_array.join(",");
    return "{" + sections_id_string + "}";
    // const sections_id_array = result.rows.map((section) => section.id);
    // return sections_id_array;
  } catch (error) {
    console.error("Failed to fetch current_sections:", error);
    throw new Error("Failed to fetch current_sections: " + String(error));
  }
}

export async function getUserRoles(user_id: string): Promise<RoleForm[]> {
  if (user_id === "") {
    return [];
  }

  try {
    const result = await pool.query(
      `SELECT r.id, r.name, r.description, r.tenant_id, t.name as tenant_name
       FROM roles r
       LEFT JOIN tenants t ON r.tenant_id = t.id
       WHERE r.id = ANY (
         SELECT unnest(role_ids)
         FROM users
         WHERE users.id = $1
       )`,
      [user_id]
    );

    return result.rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch user_roles");
  }
}

export async function getRoleSections(role_id: string): Promise<
  {
    id: string;
    name: string;
    tenant_id: string;
    tenant_name: string;
  }[]
> {
  if (role_id === "") {
    return [];
  }

  try {
    const result = await pool.query(
      `SELECT s.id, s.name, s.tenant_id, t.name as tenant_name
       FROM sections s
       LEFT JOIN tenants t ON s.tenant_id = t.id
       WHERE s.id = ANY (
         SELECT unnest(section_ids)
         FROM roles
         WHERE roles.id = $1
       )`,
      [role_id]
    );

    return result.rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch role_sections");
  }
}

// Простая проверка имени таблицы для предотвращения SQL-инъекций
function isValidTableName(tableName: string): boolean {
  // Разрешаем только буквы, цифры и подчеркивания
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName);
}

export async function getFeshRecord(
  // pool: Pool,
  tableName: string,
  recordId: string
): Promise<{ editing_by_user_id: string; editing_by_user_email: string }> {
  if (!isValidTableName(tableName)) {
    throw new Error(`Invalid table name: ${tableName}`);
  }

  const queryText = `
    SELECT ${tableName}.editing_by_user_id, users.email AS editing_by_user_email
    FROM ${tableName}
    LEFT JOIN users ON ${tableName}.editing_by_user_id = users.id
    WHERE ${tableName}.id = $1
  `;

  const res = await pool.query(queryText, [recordId]);
  return res.rows[0] || { editing_by_user_id: "", editing_by_user_email: "" };
}

export async function tryLockRecord(
  tableName: string,
  recordId: string,
  userId: string | undefined
) {
  if (!isValidTableName(tableName)) {
    throw new Error(`Invalid table name: ${tableName}`);
  }

  const result = await pool.query(
    `
      UPDATE ${tableName}
      SET editing_by_user_id = $1, editing_since = NOW()
      WHERE id = $2
        AND (editing_by_user_id IS NULL OR editing_since < NOW() - INTERVAL '30 minutes')
      RETURNING editing_by_user_id;
    `,
    [userId, recordId]
  );

  const isLockedByMe = result.rows.length > 0;
  return { success: true, isEditable: isLockedByMe };
}

export async function unlockRecord(
  tableName: string,
  recordId: string,
  userId: string
) {
  if (!isValidTableName(tableName)) {
    throw new Error(`Invalid table name: ${tableName}`);
  }

  await pool.query(
    `
      UPDATE ${tableName}
      SET editing_by_user_id = NULL, editing_since = NULL
      WHERE id = $1 AND editing_by_user_id = $2;
    `,
    [recordId, userId]
  );
}
