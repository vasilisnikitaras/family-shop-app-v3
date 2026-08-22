import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { id, name, quantity, store_id } = await request.json();

    if (!id || !name || !quantity || !store_id) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    await sql`
      UPDATE items_v2
      SET 
        name = ${name},
        quantity = ${quantity},
        store_id = ${store_id}
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error editing item:", error);
    return NextResponse.json(
      { success: false, message: "Failed to edit item" },
      { status: 500 }
    );
  }
}
