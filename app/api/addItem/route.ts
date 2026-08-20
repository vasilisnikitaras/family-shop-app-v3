import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { name, quantity, store_id, family_code, added_by } = await request.json();

    if (!name || !family_code) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    // 🔥 Βρες το family_id
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

    // 🔥 INSERT στο items_v2
    await sql`
      INSERT INTO items_v2 (
        name,
        quantity,
        store_id,
        family_id,
        is_checked,
        added_by
      )
      VALUES (
        ${name},
        ${quantity || 1},
        ${store_id || null},
        ${family_id},
        FALSE,
        ${added_by || "Unknown"}
      )
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error adding item:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add item" },
      { status: 500 }
    );
  }
}
