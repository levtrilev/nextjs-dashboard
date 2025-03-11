
// // LegalEntity buttons

"use server";

import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import type { Section, User, Tenant, LegalEntity } from "@/app/lib/definitions";

export async function deleteLegalEntity(id: string) {
  try {
    await sql`DELETE FROM legal_entities WHERE id = ${id}`;
  } catch (error) {
    console.error("Database Error, Failed to Delete LegaEntity:", error);
    throw new Error("Database Error: Failed to Delete LegaEntity");
  }
  revalidatePath("/erp/legal-entities");
}

export async function updateLegalEntity(legalEntity: LegalEntity) {
  const date = new Date().toISOString(); //.split("T")[0]
  // const is_customer = str_is_customer === "true" ? true : false;
  // const is_supplier = str_is_supplier === "true" ? true : false;

  const session = await auth();
  const username = session?.user?.name;
  try {
    await sql`
UPDATE legal_entities
SET 
    name = ${legalEntity.name},
    fullname = ${legalEntity.fullname},
    inn = ${legalEntity.inn},
    address_legal = ${legalEntity.address_legal},
    phone = ${legalEntity.phone},
    email = ${legalEntity.email},
    contact = ${legalEntity.contact},
    is_customer = ${legalEntity.is_customer},
    is_supplier = ${legalEntity.is_supplier},
    kpp = ${legalEntity.kpp},
    username = ${username},
    date = ${date}
WHERE id = ${legalEntity.id};
    `;
    // SET name = ${tenant.name}, active = ${tenant.active}, description = ${tenant.description}
  } catch (error) {
    console.error("Failed to update legalEntity:", error);
    throw new Error("Failed to update legalEntity.");
  }
  revalidatePath("/erp/legal-entities");
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
  const date = new Date().toISOString(); //.split("T")[0]
  const is_customer = str_is_customer === "true" ? true : false;
  const is_supplier = str_is_supplier === "true" ? true : false;

  const session = await auth();
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
