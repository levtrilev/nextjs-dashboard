import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
// import { sql } from "@vercel/postgres";
import pool from "@/db";
import bcrypt from "bcrypt";
import type { User } from "@/app/lib/definitions";

export async function getUser(email: string): Promise<User | undefined> {
  try {
    // const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    const user = await pool.query<User>('SELECT * FROM users WHERE email=$1', [email]);
    // console.error(user.rows[0].password + " " + user.rows[0].email + " " + user.rows[0].id);
    return user.rows[0];
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password ?? "");

          if (passwordsMatch) return user;
        }

        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
});
