"use server";

import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { AuthError } from "next-auth";
import type { Section, User, Tenant, LegalEntity } from "@/app/lib/definitions";
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
  // const { customerId, amount, status } = CreateInvoice.parse({
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }
  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath("/erp/invoices");
  redirect("/erp/invoices");
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData
) {
  //   const { customerId, amount, status } = UpdateInvoice.parse({
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  // lint //  const date = new Date().toISOString().split("T")[0];

  // Insert data into the database
  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
    // lint //   } catch (error) {
  } catch {
    // If a database error occurs, return a more specific error.
    return {
      message: "Database Error: Failed to Update Invoice.",
    };
  }
  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath("/dashboard/invoices");
    // return { message: "Deleted Invoice" };
  } catch (error) {
    // return { message: "Database Error: Failed to Delete Invoice" };
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

//#region Users
// async function createUser(newUser: User) {
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
  };
  // Insert data into the database
  //   console.log('createUser tenant_id: ' + newUser.tenant_id);
  try {
    await sql`
      INSERT INTO users (name, email, password, is_admin, tenant_id)
      VALUES (${newUser.name}, ${newUser.email}, ${newUser.password}, ${newUser.is_admin}, ${newUser.tenant_id})
    `;
  } catch (error) {
    console.error("Failed to create user:", error);
    throw new Error("Failed to create user.");
  }
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateUser(user: User) {
  // password = ${user.password},
  try {
    await sql`
      UPDATE users
      SET name = ${user.name}, 
      email = ${user.email}, 
      is_admin = ${user.is_admin}, 
      tenant_id = ${user.tenant_id}
      WHERE id = ${user.id}
    `;
  } catch (error) {
    console.error("Failed to update user:", error);
    throw new Error("Failed to update user.");
  }
  revalidatePath("/admin/users");
}

export async function deleteUser(email: string) {
  // const id = '5bce9a5e-73b8-40e1-b8e5-c681b0ef2c2b';
  try {
    await sql`DELETE FROM users WHERE email = ${email}`;
    //   revalidatePath("/dashboard/invoices");
    // return { message: "Deleted Invoice" };
  } catch (error) {
    // return { message: "Database Error: Failed to Delete Invoice" };
    console.error("Database Error, Failed to Delete User:", error);
    throw new Error("Database Error: Failed to Delete User");
  }
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteUserById(id: string) {
  try {
    await sql`DELETE FROM users WHERE id = ${id}`;
  } catch (error) {
    console.error("Database Error, Failed to Delete User by id:", error);
    throw new Error("Database Error: Failed to Delete User by id");
  }
  revalidatePath("/admin");
  redirect("/admin");
}
//#endregion

//#region Section
export async function createSection(name: string, tenant_id: string) {
  const newSection: Section = {
    id: "",
    name: name,
    tenant_id: tenant_id,
  };
  try {
    await sql`
      INSERT INTO sections (name, tenant_id)
      VALUES (${newSection.name}, ${newSection.tenant_id})
    `;
  } catch (error) {
    console.error("Failed to create section:", error);
    throw new Error("Failed to create section.");
  }
  revalidatePath("/dashboard/admin/sections");
}

export async function updateSection(section: Section) {
  try {
    await sql`
      UPDATE sections
      SET name = ${section.name}, tenant_id = ${section.tenant_id}
      WHERE id = ${section.id}
    `;
  } catch (error) {
    console.error("Failed to update section:", error);
    throw new Error("Failed to update section.");
  }
  revalidatePath("/admin/sections");
}

export async function deleteSection(name: string, tenantId: string) {
  // const id = '5bce9a5e-73b8-40e1-b8e5-c681b0ef2c2b';
  try {
    await sql`DELETE FROM sections WHERE name = ${name} AND tenant_id = ${tenantId}`;
  } catch (error) {
    console.error("Database Error, Failed to Delete Section:", error);
    throw new Error("Database Error: Failed to Delete Section");
  }
  revalidatePath("/admin");
  // redirect("/admin");
}

export async function deleteSectionById(id: string) {
  try {
    await sql`DELETE FROM sections WHERE id = ${id}`;
  } catch (error) {
    console.error("Database Error, Failed to Delete Section by id:", error);
    throw new Error("Database Error: Failed to Delete Section by id");
  }
  revalidatePath("/admin");
  // redirect("/admin");
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

//#region CreateLegalEntity

export type LegalEntityState = {
  errors?: {
    name?: string[];
    fullname?: string[];
    inn?: string[];
    kpp?: string[];
    address_legal?: string[];
    phone?: string[];
    email?: string[];
    contact?: string[];
    str_is_customer?: string[];
    str_is_supplier?: string[];
  };
  message?: string | null;
};

const LegalEntityFormSchema = z.object({
  id: z.string(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  fullname: z.string().min(2, {
    message: "Fullname must be at least 2 characters.",
  }),
  address_legal: z.string().min(2, {
    message: "Address must be at least 2 characters.",
  }),
  phone: z.string().min(2, {
    message: "Phone must be at least 2 characters.",
  }),
  email: z.string().email(),
  contact: z.string().min(5, {
    message: "Contact must be at least 5 characters.",
  }),
  str_is_customer: z.enum(["true", "false"]),
  str_is_supplier: z.enum(["true", "false"]),
  inn: z.string().min(10, {
    message: "INN must be at least 10 characters.",
  }),
  kpp: z.string().min(5, {
    message: "KPP must be at least 5 characters.",
  }),
});

const CreateLegalEntity = LegalEntityFormSchema.omit({ id: true });
const UpdateLegalEntity = LegalEntityFormSchema.omit({ id: true });

export async function createLegalEntity(
  prevState: LegalEntityState,
  formData: FormData
) {
  const validatedFields = CreateLegalEntity.safeParse({
    name: formData.get("name"),
    fullname: formData.get("fullname"),
    inn: formData.get("inn"),
    address_legal: formData.get("address_legal"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    contact: formData.get("contact"),
    str_is_customer: formData.get("str_is_customer"),
    str_is_supplier: formData.get("str_is_supplier"),
    kpp: formData.get("kpp"),
  });
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create newLegalEntity.",
    };
  }
  // Prepare data for insertion into the database
  const {
    name,
    fullname,
    inn,
    address_legal,
    phone,
    email,
    contact,
    str_is_customer,
    str_is_supplier,
    kpp,
  } = validatedFields.data;
  // SELECT event_time_tz AT TIME ZONE 'Europe/Moscow' FROM example;
  const date = new Date().toISOString();  //.split("T")[0]
  const is_customer = str_is_customer === "true" ? true : false;
  const is_supplier = str_is_supplier === "true" ? false : true;

  const  session = await auth();
  const username = session?.user?.name;
  try {
    await sql`
      INSERT INTO legal_entities (name, fullname, inn, address_legal, phone, 
      email, contact, is_customer, is_supplier, kpp, username, date)
      VALUES (${name}, ${fullname}, ${inn}, ${address_legal}, ${phone}, ${email}, 
      ${contact}, ${is_customer}, ${is_supplier}, ${kpp}, ${username}, ${date})
    `;
  } catch (error) {
    console.error("Failed to create newLegalEntity:", error);
    // throw new Error("Failed to create newLegalEntity.");
    return {
      message: "Database Error: Failed to Create newLegalEntity.",
      // errors: undefined,
    };
  }
  revalidatePath("/erp/legal-entities");
  redirect("/erp/legal-entities");
}

//#endregion
