import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { name, quantity, store_id, family_code, user_name } = await request.json();

    if (!name || !quantity || !store_id || !family_code) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    await sql`
      INSERT INTO items_v2 (name, quantity, store_id, family_code, added_by)
      VALUES (${name}, ${quantity}, ${store_id}, ${family_code}, ${user_name || "Unknown"})
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("🔥 ERROR ADDING PRODUCT:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add product" },
      { status: 500 }
    );
  }
}
