
// legalEntities actions

"use server";

import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { LegalEntity } from "@/app/lib/definitions";

const ITEMS_PER_PAGE = 6;

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
    is_customer?: string[];
    is_supplier?: string[];
  };
  message?: string | null;
};

const LegalEntityFormSchema = z.object({
  id: z.string(),
  name: z.string().min(2, {
    message: "Название должно содержать не менее 2-х символов.",
  }),
  fullname: z.string().min(2, {
    message: "Полное наименование должно содержать не менее 2-х символов.",
  }),
  address_legal: z.string().min(2, {
    message: "Поле Юридический адрес должно содержать не менее 2-х символов.",
  }),
  phone: z.string().min(2, {
    message: "Поле Телефон должно содержать не менее 2-х символов.",
  }),
  email: z.string().email(),
  contact: z.string().min(5, {
    message: "Поле Контакты должно содержать не менее 2-х символов.",
  }),
  is_customer: z.boolean(),
  is_supplier: z.boolean(),
  inn: z.string().min(10, {
    message: "Поле ИНН должно содержать не менее 10 символов.",
  }),
  kpp: z.string().min(5, {
    message: "Поле КПП должно содержать не менее 5 символов.",
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
    is_customer: formData.get("is_customer") === 'on',
    is_supplier: formData.get("is_supplier") === 'on',
    kpp: formData.get("kpp"),
  });
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Неверные данные! Failed to Create newLegalEntity.",
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
    is_customer,
    is_supplier,
    kpp,
  } = validatedFields.data;
  // SELECT event_time_tz AT TIME ZONE 'Europe/Moscow' FROM example;
  const date = new Date().toISOString();  //.split("T")[0]
  // const is_customer = str_is_customer === "true" ? true : false;
  // const is_supplier = str_is_supplier === "true" ? false : true;

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

//#region Update Delete LegalEntity

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

//#endregion

//#region LegalEntity

export async function fetchLegalEntity(id: string) {
  try {
    const data = await sql<LegalEntity>`
      SELECT
        id,
        name,
        fullname,
        inn,
        address_legal,
        phone,
        email,
        contact,
        is_customer,
        is_supplier,
        kpp
      FROM legal_entities
      WHERE id = ${id}
    `;

    const legalEntity = data.rows[0];
    return legalEntity;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch legalEntity by id.");
  }
}

export async function fetchLegalEntities() {
  try {
    const data = await sql<LegalEntity>`
      SELECT
        id,
        name,
        fullname,
        inn,
        address_legal,
        phone,
        email,
        contact,
        is_customer,
        is_supplier,
        kpp
      FROM legal_entities
      ORDER BY name ASC
    `;

    const legalEntities = data.rows;
    return legalEntities;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all legal_entities.");
  }
}

export async function fetchFilteredLegalEntities(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const legal_entities = await sql<LegalEntity>`
      SELECT
        id,
        name,
        fullname,
        inn,
        address_legal,
        phone,
        email,
        contact,
        is_customer,
        is_supplier,
        kpp
      FROM legal_entities
      WHERE
        legal_entities.name ILIKE ${`%${query}%`} OR
        legal_entities.email ILIKE ${`%${query}%`} OR
        legal_entities.fullname ILIKE ${`%${query}%`} OR
        legal_entities.address_legal ILIKE ${`%${query}%`} OR
        legal_entities.phone ILIKE ${`%${query}%`} OR
        legal_entities.inn ILIKE ${`%${query}%`} OR
        legal_entities.contact ILIKE ${`%${query}%`}
      ORDER BY name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return legal_entities.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch Legal Entities.");
  }
}

export async function fetchLegalEntitiesPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM legal_entities
    WHERE
        legal_entities.name ILIKE ${`%${query}%`} OR
        legal_entities.email ILIKE ${`%${query}%`} OR
        legal_entities.fullname ILIKE ${`%${query}%`} OR
        legal_entities.address_legal ILIKE ${`%${query}%`} OR
        legal_entities.phone ILIKE ${`%${query}%`} OR
        legal_entities.inn ILIKE ${`%${query}%`} OR
        legal_entities.contact ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of legal_entities.");
  }
}

//#endregion