import { sql } from "@vercel/postgres";
import { User } from "@/app/lib/definitions";

export async function UsersCount() {
  try {
    const data = await sql<User>`
      SELECT
        *
      FROM users
    `;
    const user = data.rows[0];
    return <span>{user.id}</span>;
  } catch (err) {
    console.error("Database Error:", err);
    // throw new Error("Failed to count all users.");
    return <span>Failed to count all users</span>;
  }
   
}