import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { name, code } = await req.json();

    await sql`
      INSERT INTO admin_families (name, code)
      VALUES (${name}, ${code});
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding family:", error);
    return NextResponse.json({ error: "Failed to add family" }, { status: 500 });
  }
}
