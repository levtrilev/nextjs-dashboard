// legalEntities actions

"use server";

import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { LegalEntity, LegalEntityForm } from "@/app/lib/definitions";

// async function getCurrentSections(email: string): Promise<string | undefined> {
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
// const  session = await auth();
// const email = session ? (session.user? session.user.email : "") : "";
// const current_sections = await getCurrentSections(email as string);
// console.log("current_sections: " + current_sections);
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
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    console.log("section_id: " + formData.get("section_id"));
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
    region_id,
    section_id,
  } = validatedFields.data;
  // SELECT event_time_tz AT TIME ZONE 'Europe/Moscow' FROM example;
  const date = new Date().toISOString(); //.split("T")[0]
  // const is_customer = str_is_customer === "true" ? true : false;
  // const is_supplier = str_is_supplier === "true" ? false : true;

  const session = await auth();
  const username = session?.user?.name;
  try {
    await sql`
      INSERT INTO legal_entities (name, fullname, inn, address_legal, phone, 
      email, contact, is_customer, is_supplier, kpp, region_id, section_id, 
      username, date)
      VALUES (${name}, ${fullname}, ${inn}, ${address_legal}, ${phone}, ${email}, 
      ${contact}, ${is_customer}, ${is_supplier}, ${kpp}, ${region_id}, ${section_id}, 
      ${username}, ${date})
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
    region_id = ${legalEntity.region_id},
    section_id = ${legalEntity.section_id}, 
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

export async function fetchLegalEntity(id: string, current_sections: string) {
  try {
    const data = await sql<LegalEntity>`
WITH your_legal_entities AS ( SELECT * FROM legal_entities where section_id = 
ANY (${current_sections}::uuid[]))

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
      WHERE id = ${id}
    `;

    const legalEntity = data.rows[0];
    // после заполнения идентификаторов эти строки можно удалить
    // if (!legalEntity.region_id) { legalEntity.region_id = ""; }
    // if (!legalEntity.section_id) { legalEntity.section_id = ""; }
    ////////////
    return legalEntity;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch legalEntity by id.");
  }
}

export async function fetchLegalEntities(current_sections: string) {
  try {
    const data = await sql<LegalEntity>`
    WITH your_legal_entities AS ( SELECT * FROM legal_entities where section_id = 
      ANY (${current_sections}::uuid[]))

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
  currentPage: number,
  current_sections: string
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const legal_entities = await sql<LegalEntity>`
    WITH your_legal_entities AS ( SELECT * FROM legal_entities where section_id = 
      ANY (${current_sections}::uuid[]))

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

export async function fetchLegalEntitiesPages(query: string, current_sections: string) {
  try {
    const count = await sql`
    WITH your_legal_entities AS ( SELECT * FROM legal_entities where section_id = 
      ANY (${current_sections}::uuid[]))
    
    SELECT COUNT(*)
    FROM your_legal_entities legal_entities
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

export async function fetchLegalEntityForm(id: string, current_sections: string) {
  try {
    const data = await sql<LegalEntityForm>`
    WITH your_legal_entities AS ( SELECT * FROM legal_entities where section_id = 
      ANY (${current_sections}::uuid[]))

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
        r.name as region_name,
        s.name as section_name
      FROM your_legal_entities le 
      LEFT JOIN regions r ON le.region_id = r.id
      LEFT JOIN sections s ON le.section_id = s.id
      WHERE le.id = ${id}
    `;

    const legalEntity = data.rows[0];

    return legalEntity;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch legalEntity by id.");
  }
}


//#endregion
