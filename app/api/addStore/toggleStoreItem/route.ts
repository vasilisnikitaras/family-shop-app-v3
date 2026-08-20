import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { item_id, store_id, family_code } = await request.json();

    if (!item_id || !family_code) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    await sql`
      UPDATE items_v2
      SET store_id = ${store_id}
      WHERE id = ${item_id}
      AND family_code = ${family_code}
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error updating store:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update store" },
      { status: 500 }
    );
  }
}
