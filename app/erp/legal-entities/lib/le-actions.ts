"use server";
import { z } from "zod";
import pool from "@/db"; // Импорт пула подключений
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { LegalEntity, LegalEntityForm } from "@/app/lib/definitions";

const ITEMS_PER_PAGE = 8;

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
    region_id?: string[];
    section_id?: string[];
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
  region_id: z
    .string()
    .uuid({ message: "Поле Регион должно содержать валидный UUID." }),
  section_id: z
    .string()
    .uuid({ message: "Поле Раздел должно содержать валидный UUID." }),
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
    is_customer: formData.get("is_customer") === "on",
    is_supplier: formData.get("is_supplier") === "on",
    kpp: formData.get("kpp"),
    region_id: formData.get("region_id"),
    section_id: formData.get("section_id"),
  });

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Неверные данные! Failed to Create newLegalEntity.",
    };
  }

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
    region_id,
    section_id,
  } = validatedFields.data;

  const date = new Date().toISOString();

  const session = await auth();
  const username = session?.user?.name;

  try {
    await pool.query(
      `INSERT INTO legal_entities (
        name, fullname, inn, address_legal, phone, 
        email, contact, is_customer, is_supplier, kpp, 
        region_id, section_id, username, date
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      )`,
      [
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
        region_id,
        section_id,
        username,
        date,
      ]
    );
  } catch (error) {
    console.error("Failed to create newLegalEntity:", error);
    return {
      message: "Database Error: Failed to Create newLegalEntity.",
    };
  }

  revalidatePath("/erp/legal-entities");
  redirect("/erp/legal-entities");
}
//#endregion

//#region Update Delete LegalEntity
export async function deleteLegalEntity(id: string) {
  try {
    await pool.query(`DELETE FROM legal_entities WHERE id = $1`, [id]);
  } catch (error) {
    console.error("Database Error, Failed to Delete LegaEntity:", error);
    throw new Error("Database Error: Failed to Delete LegaEntity");
  }
  revalidatePath("/erp/legal-entities");
}

export async function updateLegalEntity(legalEntity: LegalEntity) {
  const date = new Date().toISOString();

  const session = await auth();
  const username = session?.user?.name;

  try {
    await pool.query(
      `UPDATE legal_entities
       SET 
         name = $1,
         fullname = $2,
         inn = $3,
         address_legal = $4,
         phone = $5,
         email = $6,
         contact = $7,
         is_customer = $8,
         is_supplier = $9,
         kpp = $10,
         region_id = $11,
         section_id = $12,
         user_tags = $13,
         access_tags = $14, 
         username = $15,
         date = $16
       WHERE id = $17`,
      [
        legalEntity.name,
        legalEntity.fullname,
        legalEntity.inn,
        legalEntity.address_legal,
        legalEntity.phone,
        legalEntity.email,
        legalEntity.contact,
        legalEntity.is_customer,
        legalEntity.is_supplier,
        legalEntity.kpp,
        legalEntity.region_id,
        legalEntity.section_id,
        JSON.stringify(legalEntity.user_tags),
        JSON.stringify(legalEntity.access_tags),
        username,
        date,
        legalEntity.id
      ]
    );
  } catch (error) {
    console.error("Failed to update legalEntity:", error);
    throw new Error("Failed to update legalEntity.");
  }
  revalidatePath("/erp/legal-entities");
}
//#endregion

//#region LegalEntity
export async function fetchLegalEntity(id: string, current_sections: string) {
  try {
    const result = await pool.query<LegalEntity>(
      `WITH your_legal_entities AS (
         SELECT * FROM legal_entities 
         WHERE section_id = ANY($1::uuid[])
       )
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
         kpp,
         region_id,
         section_id,
         user_tags,
         access_tags
       FROM your_legal_entities
       WHERE id = $2`,
      [current_sections, id]
    );

    const legalEntity = result.rows[0];
    return legalEntity;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch legalEntity by id.");
  }
}

export async function fetchLegalEntities(current_sections: string) {
  try {
    const result = await pool.query<LegalEntity>(
      `WITH your_legal_entities AS (
         SELECT * FROM legal_entities 
         WHERE section_id = ANY($1::uuid[])
       )
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
         kpp,
         region_id,
         section_id
       FROM your_legal_entities
       ORDER BY name ASC`,
      [current_sections]
    );

    return result.rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all legal_entities.");
  }
}

export async function fetchFilteredLegalEntities(
  query: string,
  currentPage: number,
  current_sections: string
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const result = (await pool.query<LegalEntity>(
      `WITH your_legal_entities AS (
         SELECT * FROM legal_entities 
         WHERE section_id = ANY($1::uuid[])
       )
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
         kpp,
         region_id,
         section_id
       FROM your_legal_entities legal_entities
       WHERE
         legal_entities.name ILIKE $2 OR
         legal_entities.email ILIKE $2 OR
         legal_entities.fullname ILIKE $2 OR
         legal_entities.address_legal ILIKE $2 OR
         legal_entities.phone ILIKE $2 OR
         legal_entities.inn ILIKE $2 OR
         legal_entities.contact ILIKE $2
       ORDER BY name ASC
       LIMIT $3 OFFSET $4`,
      [current_sections, `%${query}%`, ITEMS_PER_PAGE, offset]
    )) as { rows: LegalEntity[] };

    return result.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch Legal Entities.");
  }
}

export async function fetchLegalEntitiesPages(
  query: string,
  current_sections: string
) {
  try {
    const result = await pool.query(
      `WITH your_legal_entities AS (
         SELECT * FROM legal_entities 
         WHERE section_id = ANY($1::uuid[])
       )
       SELECT COUNT(*)
       FROM your_legal_entities legal_entities
       WHERE
         legal_entities.name ILIKE $2 OR
         legal_entities.email ILIKE $2 OR
         legal_entities.fullname ILIKE $2 OR
         legal_entities.address_legal ILIKE $2 OR
         legal_entities.phone ILIKE $2 OR
         legal_entities.inn ILIKE $2 OR
         legal_entities.contact ILIKE $2`,
      [current_sections, `%${query}%`]
    );

    const totalPages = Math.ceil(Number(result.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of legal_entities.");
  }
}

export async function fetchLegalEntityForm(
  id: string,
  current_sections: string
) {
  try {
    const result = await pool.query<LegalEntityForm>(
      `WITH your_legal_entities AS (
         SELECT * FROM legal_entities 
         WHERE section_id = ANY($1::uuid[])
       )
       SELECT
         le.id,
         le.name,
         le.fullname,
         le.inn,
         le.address_legal,
         le.phone,
         le.email,
         le.contact,
         le.is_customer,
         le.is_supplier,
         le.kpp,
         le.region_id,
         le.section_id,
         le.editing_by_user_id,
         le.editing_since,
          le.user_tags,
          le.access_tags,
         r.name as region_name,
         s.name as section_name
       FROM your_legal_entities le 
       LEFT JOIN regions r ON le.region_id = r.id
       LEFT JOIN sections s ON le.section_id = s.id
       WHERE le.id = $2`,
      [current_sections, id]
    );

    return result.rows[0];
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch legalEntity by id.");
  }
}
//#endregion
