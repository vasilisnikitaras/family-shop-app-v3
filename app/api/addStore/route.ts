export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    console.log("📌 Incoming store name:", name);

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Missing store name" },
        { status: 400 }
      );
    }

    const familyCode = request.headers.get("x-family-code");
    console.log("📌 Incoming family code:", familyCode);

    if (!familyCode) {
      return NextResponse.json(
        { success: false, message: "Missing family code" },
        { status: 400 }
      );
    }

    console.log("📌 Checking family:", familyCode);

    const family = await sql`
      SELECT id FROM families WHERE family_code = ${familyCode}
    `;

    console.log("📌 Family result:", family);

    if (family.length === 0) {
      return NextResponse.json(
        { success: false, message: "Family not found" },
        { status: 400 }
      );
    }

    const family_id = family[0].id;

    const cleanName = name.trim().toLowerCase();

    console.log("📌 Family ID:", family_id);
    console.log("📌 Clean name:", cleanName);

    // FIX: remove LOWER/TRIM from SQL
    const stores = await sql`
      SELECT id, store_name FROM stores_v2
      WHERE family_id = ${family_id}
    `;

    console.log("📌 Existing stores:", stores);

    const match = stores.find(
      s => s.store_name.trim().toLowerCase() === cleanName
    );

    if (match) {
      console.log("📌 Store already exists:", match);
      return NextResponse.json(
        { success: true, store: match },
        { status: 200 }
      );
    }

    console.log("📌 Inserting store:", name.trim(), family_id, familyCode);

    const store = await sql`
      INSERT INTO stores_v2 (store_name, family_id, family_code)
      VALUES (${name.trim()}, ${family_id}, ${familyCode})
      RETURNING id, store_name
    `;

    console.log("📌 Store inserted:", store);

    return NextResponse.json({ success: true, store: store[0] });

  } catch (error) {
    console.error("🔥 ADD STORE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add store" },
      { status: 500 }
    );
  }
}
