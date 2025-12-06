// Tags actions

"use server";

import pool from "@/db";

export async function fetchAllTags(tenant_id: string): Promise<string[]> {
  try {
    // Вариант без учета tenant_if (для отладки)
    //   const data = await pool.query<{ name: string }>(
    //     `
    //     SELECT name
    //     FROM tags
    //     ORDER BY name ASC
    //   `
    //   );
    const data = await pool.query<{ name: string }>(
      `
      SELECT name
      FROM tags
      WHERE tenant_id = $1
      ORDER BY name ASC
    `,
      [tenant_id]
    );
    const tags = data.rows.map((row) => row.name); // ← извлекаем только строки
    return tags;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all tags: " + err);
  }
}

export async function upsertTags(
  tagNames: string[],
  tenant_id: string
): Promise<void> {
if (!tagNames || tagNames.length === 0) return;
  try {
    await pool.query(
      `
      INSERT INTO tags (name, tenant_id)
      SELECT unnest($1::text[]), $2
      ON CONFLICT (name, tenant_id) DO NOTHING
      `,
      [tagNames, tenant_id]
    );
  } catch (error) {
    console.error("Failed to upsert tags:", error);
    throw new Error("Failed to upsert tags.");
  }
}
