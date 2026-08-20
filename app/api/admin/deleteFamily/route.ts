import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { id } = await req.json();

    await sql`DELETE FROM admin_families WHERE id = ${id};`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting family:", error);
    return NextResponse.json({ error: "Failed to delete family" }, { status: 500 });
  }
}
