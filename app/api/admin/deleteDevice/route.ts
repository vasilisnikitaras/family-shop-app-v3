import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: Request) {
  try {
    const { id } = await req.json();   // <-- FIXED (όχι device_id)

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await sql`
      DELETE FROM devices
      WHERE id = ${id};
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting device:", error);
    return NextResponse.json({ error: "Failed to delete device" }, { status: 500 });
  }
}
