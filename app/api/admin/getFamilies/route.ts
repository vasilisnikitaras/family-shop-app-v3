import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const families = await sql`
      SELECT id, family_code, family_password, created_at
      FROM families
      ORDER BY id ASC;
    `;

    return NextResponse.json({ families });
  } catch (error) {
    console.error("Error loading families:", error);
    return NextResponse.json({ families: [] }, { status: 500 });
  }
}
