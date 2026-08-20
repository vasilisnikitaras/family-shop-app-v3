import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(req: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { searchParams } = new URL(req.url);

    const familyCode = searchParams.get("familyCode");

    let devices;

    if (!familyCode || familyCode.trim() === "") {
      // 🔥 ΦΕΡΝΕΙ ΟΛΑ ΤΑ DEVICES
      devices = await sql`
        SELECT id, device_name, last_seen, is_online, family_code
        FROM admin_devices
        ORDER BY id ASC;
      `;
    } else {
      // 🔥 ΦΕΡΝΕΙ ΜΟΝΟ ΤΗΣ ΟΙΚΟΓΕΝΕΙΑΣ
      devices = await sql`
        SELECT id, device_name, last_seen, is_online, family_code
        FROM admin_devices
        WHERE family_code = ${familyCode}
        ORDER BY id ASC;
      `;
    }

    return NextResponse.json({ devices });
  } catch (error) {
    console.error("Error loading devices:", error);
    return NextResponse.json({ devices: [] }, { status: 500 });
  }
}
