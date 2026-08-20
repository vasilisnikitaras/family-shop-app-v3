import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { id, newName } = await req.json();

    await sql`
      UPDATE admin_families
      SET name = ${newName}
      WHERE id = ${id};
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error renaming family:", error);
    return NextResponse.json({ error: "Failed to rename family" }, { status: 500 });
  }
}
