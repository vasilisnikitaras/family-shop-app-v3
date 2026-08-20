import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { id, is_checked, family_code } = await request.json();

    if (!id || typeof is_checked === "undefined" || !family_code) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    await sql`
      UPDATE items_v2
      SET is_checked = ${is_checked}
      WHERE id::text = ${id}
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
