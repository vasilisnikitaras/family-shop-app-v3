import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL);

console.log("DATABASE_URL:", process.env.DATABASE_URL);
