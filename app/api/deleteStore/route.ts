import { NextResponse } from "next/server";
import { sql } from "@/lib/db";


export async function POST(request: Request) {
  try {
    const { uid } = await request.json();
    const family_code = request.headers.get("x-family-code");

    if (!uid || !family_code) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    const family = await sql`
      SELECT id FROM families WHERE family_code = ${family_code}
    `;
    const family_id = family[0]?.id;

    if (!family_id) {
      return NextResponse.json(
        { success: false, message: "Family not found" },
        { status: 400 }
      );
    }

    await sql`
      UPDATE items_v2
      SET store_id = NULL
      WHERE store_id = ${uid}
      AND family_id = ${family_id}
    `;

    const deleted = await sql`
      DELETE FROM stores_v2
      WHERE id = ${uid}
      AND family_id = ${family_id}
      RETURNING id
    `;

    if (deleted.length === 0) {
      return NextResponse.json(
        { success: false, message: "Failed to delete store" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE STORE ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
