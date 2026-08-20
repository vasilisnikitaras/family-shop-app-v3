import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { id, is_checked, family_code, user_name } = await request.json();

    if (!id || typeof is_checked === "undefined" || !family_code) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
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

    // Κάνε update το item
    await sql`
      UPDATE items_v2
      SET 
        is_checked = ${is_checked},
        updated_by = ${user_name || "Unknown"}
      WHERE id = ${id}
      AND family_id = ${family_id}
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error toggling item:", error);
    return NextResponse.json(
      { success: false, message: "Failed to toggle item" },
      { status: 500 }
    );
  }
}
