import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { id, family_code } = await request.json();

    if (!id || !family_code) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    // Flip the is_checked value
    await sql`
      UPDATE items_v2
      SET is_checked = NOT COALESCE(is_checked, FALSE)
      WHERE id = ${id} AND family_code = ${family_code}
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("🔥 ERROR TOGGLING ITEM:", error);
    return NextResponse.json(
      { success: false, message: "Failed to toggle item" },
      { status: 500 }
    );
  }
}
