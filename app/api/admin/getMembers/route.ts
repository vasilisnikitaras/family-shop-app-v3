import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(req: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { searchParams } = new URL(req.url);
    const familyId = searchParams.get("familyId");

    const members = await sql`
      SELECT id, name, family_id
      FROM admin_members
      WHERE family_id = ${familyId}
      ORDER BY id ASC;
    `;

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Error loading members:", error);
    return NextResponse.json({ members: [] }, { status: 500 });
  }
}
