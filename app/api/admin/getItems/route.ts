import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(req: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { searchParams } = new URL(req.url);
    const familyId = searchParams.get("familyId");

    const items = await sql`
      SELECT id, name, quantity, is_checked, family_id
      FROM admin_items
      WHERE family_id = ${familyId}
      ORDER BY id ASC;
    `;

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error loading items:", error);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
