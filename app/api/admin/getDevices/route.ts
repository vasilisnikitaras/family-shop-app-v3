import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(req: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { searchParams } = new URL(req.url);

    const familyCode = searchParams.get("familyCode");

    let devices;

    if (!familyCode || familyCode.trim() === "") {
      // 🔥 ΦΕΡΝΕΙ ΟΛΑ ΤΑ DEVICES ΑΠΟ devices_v2
      devices = await sql`
        SELECT id, device_name, last_seen, is_online, family_code, member_name
        FROM devices_v2
        ORDER BY last_seen DESC;
      `;
    } else {
      // 🔥 ΦΕΡΝΕΙ ΜΟΝΟ ΤΗΣ ΟΙΚΟΓΕΝΕΙΑΣ
      devices = await sql`
        SELECT id, device_name, last_seen, is_online, family_code, member_name
        FROM devices_v2
        WHERE family_code = ${familyCode}
        ORDER BY last_seen DESC;
      `;
    }

    return NextResponse.json({ devices });
  } catch (error) {
    console.error("Error loading devices:", error);
    return NextResponse.json({ devices: [] }, { status: 500 });
  }
}
