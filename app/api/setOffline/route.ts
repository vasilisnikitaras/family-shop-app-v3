import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
  const { device_name, family_code } = await req.json();

  try {
    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      UPDATE admin_devices
      SET is_online = false
      WHERE device_name = ${device_name}
      AND family_code = ${family_code};
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("setOffline error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
