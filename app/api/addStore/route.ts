export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Missing store name" },
        { status: 400 }
      );
    }

    const familyCode = request.headers.get("x-family-code");

    if (!familyCode) {
      return NextResponse.json(
        { success: false, message: "Missing family code" },
        { status: 400 }
      );
    }

    const family = await sql`
      SELECT id FROM families WHERE family_code = ${familyCode}
    `;

    if (family.length === 0) {
      return NextResponse.json(
        { success: false, message: "Family not found" },
        { status: 400 }
      );
    }

    const family_id = family[0].id;

    const cleanName = name.trim().toLowerCase();

    const existingStore = await sql`
      SELECT id FROM stores_v2
      WHERE family_id = ${family_id}
      AND LOWER(TRIM(store_name)) = ${cleanName}
    `;

    if (existingStore.length > 0) {
      return NextResponse.json(
        { success: true, store: existingStore[0] },
        { status: 200 }
      );
    }

    const store = await sql`
      INSERT INTO stores_v2 (store_name, family_id, family_code)
      VALUES (${name.trim()}, ${family_id}, ${familyCode})
      RETURNING id, store_name
    `;

    return NextResponse.json({ success: true, store: store[0] });

  } catch (error) {
    console.error("Error adding store:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add store" },
      { status: 500 }
    );
  }
}
