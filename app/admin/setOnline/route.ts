import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { device_name, family_id } = await req.json();

    if (!device_name || !family_id) {
      return NextResponse.json(
        { error: "Missing device_name or family_id" },
        { status: 400 }
      );
    }

    // 1️⃣ Αν υπάρχει ήδη → update
    await sql`
      UPDATE admin_devices
      SET is_online = true,
          last_seen = NOW()
      WHERE device_name = ${device_name}
      AND family_id = ${family_id};
    `;

    // 2️⃣ Αν δεν υπάρχει → create
    await sql`
      INSERT INTO admin_devices (device_name, family_id, is_online, last_seen)
      VALUES (${device_name}, ${family_id}, true, NOW())
      ON CONFLICT DO NOTHING;
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("setOnline error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
