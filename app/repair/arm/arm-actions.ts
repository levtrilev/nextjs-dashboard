"use server";
import { getCurrentSectionsArray } from "@/app/lib/common-actions";
import pool from "@/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { Section } from "@/app/lib/definitions";

export async function getUserCurrentSections(
  email: string
): Promise<Section[]> {
  const allowed = await getCurrentSectionsArray(email); // из прав доступа
  const savedByUser = await getUserSectionFilter(email); // из таблицы user_section_filters
  if (savedByUser && savedByUser.length > 0) {
    // Пересекаем сохранённые с разрешёнными — безопасность!
    return savedByUser.filter(s =>
  allowed.some(a => a.id === s.id)
);
  }
  return allowed; // по умолчанию — всё разрешённое
}

export async function getUserSectionFilter(
  email: string
): Promise<Section[] | null> {
  if (email === "") {
    return null;
  }

  try {
    const result = await pool.query<Section>(
      `SELECT sections.id, sections.name
       FROM sections
       WHERE sections.id = ANY (
         SELECT unnest(section_ids)
         FROM user_section_filters
         WHERE user_id = (SELECT id FROM users WHERE email = $1)
         )`,
      [email]
    );
    const rows = result.rows;

    if (rows.length === 0) {
      return null; // пользователь ещё не сохранял настройки
    }

    return rows;
  } catch (error) {
    console.error("Failed to fetch user section tabs-filter:", error);
    throw new Error(
      "Не удалось загрузить tabs-выбор разделов: " + String(error)
    );
  }
}

export async function updateUserSectionFilterByUserId(
  userId: string,
  section_ids: string[],
): Promise<void> {
    if (!Array.isArray(section_ids) || section_ids.some((s) => typeof s !== "string")) {
      throw new Error("Invalid sections format");
    }

await pool.query(
  `
    INSERT INTO user_section_filters (user_id, section_ids)
    VALUES ($1, $2)
    ON CONFLICT (user_id)
    DO UPDATE SET section_ids = $2, updated_at = NOW()
  `,
  [userId, section_ids]
);
}

export async function saveUserSections(
  userId: string,
  sections_ids: string[]
) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  // Валидация: получаем разрешённые разделы
  const allowedSections = await getCurrentSectionsArray(session.user.email);
  const allowedIds = allowedSections.map((as) => as.id);

  const validSectionIds = sections_ids.filter((id) =>
    allowedIds.includes(id)
  );

  await updateUserSectionFilterByUserId(userId, validSectionIds);

  revalidatePath("/machines"); // или конкретный путь
}
