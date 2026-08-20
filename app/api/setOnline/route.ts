import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { family_code } = await request.json();

    if (!family_code) {
      return NextResponse.json(
        { success: false, message: "Missing family_code" },
        { status: 400 }
      );
    }

    // Βρες το family_id
    const family = await sql`
      SELECT id FROM families WHERE family_code = ${family_code}
    `;

    if (family.length === 0) {
      return NextResponse.json(
        { success: false, message: "Family not found" },
        { status: 404 }
      );
    }

    const family_id = family[0].id;

    // Κάνε το family online
    await sql`
      UPDATE families
      SET is_online = true,
          last_seen = NOW()
      WHERE id = ${family_id}
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("setOnline error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
