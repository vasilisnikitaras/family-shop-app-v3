import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: Request) {
  try {
    const { family_code, member_name, device_name } = await req.json();

    // ⭐ DEBUG LOG — ΒΛΕΠΟΥΜΕ ΤΙ ΣΤΕΛΝΕΙ ΤΟ CLIENT
    console.log("REGISTER JSON:", {
      family_code,
      member_name,
      device_name
    });

    if (!family_code || !member_name || !device_name) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    // 🔥 Check if device already exists
    const existing = await sql`
      SELECT * FROM devices_v2
      WHERE family_code = ${family_code}
      AND device_name = ${device_name}
      LIMIT 1;
    `;

    // 🔥 If exists → update last_seen + online
    if (existing.length > 0) {
      await sql`
        UPDATE devices_v2
        SET last_seen = NOW(), is_online = TRUE
        WHERE id = ${existing[0].id};
      `;

      return NextResponse.json({
        success: true,
        message: "Device updated",
        device: existing[0],
      });
    }

    // 🔥 If NOT exists → create new device
    const created = await sql`
      INSERT INTO devices_v2 (
        family_code,
        member_name,
        device_name,
        last_seen,
        is_online
      )
      VALUES (
        ${family_code},
        ${member_name},
        ${device_name},
        NOW(),
        TRUE
      )
      RETURNING *;
    `;

    return NextResponse.json({
      success: true,
      message: "Device registered",
      device: created[0],
    });

  } catch (err) {
    console.error("❌ registerDevice error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
