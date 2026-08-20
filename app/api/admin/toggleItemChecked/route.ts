import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { id, isChecked } = await req.json();

    await sql`
      UPDATE admin_items
      SET is_checked = ${isChecked}
      WHERE id = ${id};
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error toggling item:", error);
    return NextResponse.json({ error: "Failed to toggle item" }, { status: 500 });
  }
}
