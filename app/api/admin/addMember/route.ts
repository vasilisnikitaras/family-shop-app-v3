import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { name, familyId } = await req.json();

    await sql`
      INSERT INTO admin_members (name, family_id)
      VALUES (${name}, ${familyId});
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding member:", error);
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
  }
}
