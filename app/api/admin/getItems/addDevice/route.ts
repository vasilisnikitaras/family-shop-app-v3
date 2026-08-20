import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { deviceName, familyId } = await req.json();

    await sql`
      INSERT INTO admin_devices (device_name, family_id)
      VALUES (${deviceName}, ${familyId});
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding device:", error);
    return NextResponse.json({ error: "Failed to add device" }, { status: 500 });
  }
}
