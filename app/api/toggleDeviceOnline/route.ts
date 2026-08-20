import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { id, isOnline } = await req.json();

    await sql`
      UPDATE admin_devices
      SET is_online = ${isOnline}, last_seen = NOW()
      WHERE id = ${id};
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error toggling device:", error);
    return NextResponse.json({ error: "Failed to toggle device" }, { status: 500 });
  }
}
