import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { item_id, store_id, family_code } = await request.json();

    if (!item_id || !store_id || !family_code) {
      return NextResponse.json(
        { error: "Missing item_id, store_id or family_code" },
        { status: 400 }
      );
    }

    await sql`
      UPDATE items
      SET store_id = ${store_id}
      WHERE id = ${item_id} AND family_code = ${family_code}
    `;

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Error toggling store:", error);
    return NextResponse.json(
      { error: "Failed to toggle store" },
      { status: 500 }
    );
  }
}
